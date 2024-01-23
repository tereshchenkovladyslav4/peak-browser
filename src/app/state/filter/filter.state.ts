import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext, Store } from "@ngxs/store";
import { FilterType } from "../../resources/enums/filter-type";
import { ActiveFilter, DEFAULT_DURATION_MAX, DEFAULT_DURATION_MIN, getActiveFilters } from "../../resources/models/filter/active-filter";
import { BaseState, setDefaultValues } from "../base-state";
import { FilterActions } from "./filter.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { getActiveFilterId, getContentTypeFilterFunction, getDifficultyFilterFunction, getDurationFilterFunction, getKeywordsFilterFunction, getPublishFilterFunction, getSearchFilterFunction, getTopicsFilterFunction } from "./filter.util";
import { stringifySelectedFiltersQueryParam } from "../../resources/functions/filter/filter";

export interface ActiveFilterFunctionsMap {
  [key: string]: Function
}

export const DEFAULT_FILTER_DURATION = { value: DEFAULT_DURATION_MIN, highValue: DEFAULT_DURATION_MAX };

const DEFAULT_ACTIVE_FILTER_FUNCTIONS_MAP: ActiveFilterFunctionsMap = {
  [FilterType.PUBLISHER]: null,
  [FilterType.TOPICS]: null,
  [FilterType.CONTENT_TYPE]: null,
  [FilterType.DURATION]: null,
  [FilterType.DIFFICULTY]: null,
  [FilterType.KEYWORDS]: null,
  [FilterType.SEARCH]: null,
}

export interface Filter {
  [key: string]: any
}

const DEFAULT_FILTER_STATE: Filter = {
  [FilterType.PUBLISHER]: {},
  [FilterType.TOPICS]: {},
  [FilterType.CONTENT_TYPE]: {},
  [FilterType.DURATION]: DEFAULT_FILTER_DURATION,
  [FilterType.DIFFICULTY]: {},
  [FilterType.KEYWORDS]: {},
  [FilterType.SEARCH]: {},
};

const DEFAULT_SEARCH_FILTER_STATE: Filter = {
  [FilterType.TOPICS]: '',
  [FilterType.KEYWORDS]: '',
};

export interface FilterStateData {
  data: any[];
  filter: Filter;
  searchFilter: Filter;
  activeFilters: ActiveFilter[]
  activeFilterFunctionsMap: ActiveFilterFunctionsMap;
  isLoaded: boolean;

}

const DEFAULT_STATE: FilterStateData = setDefaultValues({
  data: [],
  filter: DEFAULT_FILTER_STATE,
  searchFilter: DEFAULT_SEARCH_FILTER_STATE,
  activeFilters: [],
  activeFilterFunctionsMap: DEFAULT_ACTIVE_FILTER_FUNCTIONS_MAP,
  isLoaded: false
});

@State<FilterStateData>({
  name: "Filter",
  defaults: DEFAULT_STATE
})
@Injectable()
export class FilterState {

  constructor(private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) {
  }
  /* ACTIONS */
  @Action(FilterActions.UpdateFilter)
  updateFilter({ patchState }: StateContext<FilterStateData>, action: FilterActions.UpdateFilter) {
    patchState({ [action.filterType]: action.filterValues });
    this.updateUrlQueryParams();
  }

  @Action(FilterActions.UpdateData)
  updateData({ patchState }: StateContext<FilterStateData>, action: FilterActions.UpdateData) {
    patchState({ data: action.data, isLoaded: true });
  }

  @Action(FilterActions.UpdateSearchFilter)
  updateSearchFilter({ patchState }: StateContext<FilterStateData>, { searchFilter }: FilterActions.UpdateSearchFilter) {
    patchState({ searchFilter });
  }
  @Action(FilterActions.UpdateActiveFilterFunctionsMap)
  UpdateActiveFilterFunctionsMap({ patchState, getState }: StateContext<FilterStateData>, { functionsMap }: FilterActions.UpdateActiveFilterFunctionsMap) {
    patchState({
      activeFilterFunctionsMap: {
        ...getState().activeFilterFunctionsMap,
        ...functionsMap
      }
    })
  }

  @Action(FilterActions.UpdateFilterStates)
  onFilter(state: StateContext<FilterStateData>, { filterType, filterValues }: FilterActions.UpdateFilterStates) {
    const activeFilterFunctionMethodMap = {
      [FilterType.PUBLISHER]: () => getPublishFilterFunction(filterValues),
      [FilterType.TOPICS]: () => getTopicsFilterFunction(filterValues),
      [FilterType.CONTENT_TYPE]: () => getContentTypeFilterFunction(filterValues),
      [FilterType.DURATION]: () => getDurationFilterFunction(filterValues),
      [FilterType.DIFFICULTY]: () => getDifficultyFilterFunction(filterValues),
      [FilterType.KEYWORDS]: () => getKeywordsFilterFunction(filterValues),
      [FilterType.SEARCH]: () => getSearchFilterFunction(filterValues)
    };
    //calls actions to update all filters
    state.dispatch([new FilterActions.UpdateActiveFilters(filterValues, filterType),
    new FilterActions.UpdateFilter(filterValues, filterType),
    new FilterActions.UpdateActiveFilterFunctionsMap({ [filterType]: activeFilterFunctionMethodMap[filterType]() })
    ]);
  }

  @Action(FilterActions.UpdateActiveFilters)
  updateActiveFilters({ getState, patchState }: StateContext<FilterStateData>, { filterType, filterValues }: FilterActions.UpdateActiveFilters) {
    if (filterType === FilterType.SEARCH) {
      return;
    }
    // builds new ActiveFilters from filterValues arg
    const newFilters = getActiveFilters(filterValues, filterType)
      // assign ID
      .map(filter => ({ ...filter, id: getActiveFilterId(filter) }))

    // updates current ActiveFilters isActive property based on new filter values
    const currentFilters = getState().activeFilters.map(filter => {
      return {
        ...filter,
        isActive: newFilters.find(f => f.id === filter.id)?.isActive ?? filter.isActive
      };
    });

    // combines new and current - filters on isActive to remove inactive - deduplicates remaining positive filters
    const newActiveFilters = [...currentFilters, ...newFilters].filter(filter => filter.isActive)
      .filter((filter, index, array) =>
        array.findIndex(f => f.id == filter.id) === index);

    patchState({ activeFilters: newActiveFilters });
  }

  @Action(FilterActions.SearchFilterDropdown)
  searchFilterDropdown({ patchState }: StateContext<FilterStateData>, { filterType, searchValue }: FilterActions.SearchFilterDropdown) {
    patchState({ [filterType]: searchValue })
  }

  @Action(FilterActions.ResetFilterState)
  ResetFilterState(state: StateContext<FilterStateData>) {
    const { data, searchFilter } = state.getState();
    //Reset all properties except for what is currently being displayed and current search filter
    state.patchState({ ...DEFAULT_STATE, searchFilter, data })
  }

  @Action(FilterActions.RemoveFilter)
  removeFilter({ getState }: StateContext<FilterStateData>, { filter }: FilterActions.RemoveFilter) {
    // this removes simple filters and handles the nested structure and rules of topics filters
    const { parentKey, key, filterType } = filter.mappedFrom;
    const defaultRemoveFilterValues = () => {
      const topicKey = 'topics';
      const filterSnapshot = getState();
      const parentFilterMap = filterSnapshot[filterType][parentKey];
      const filterForRemoval = filterSnapshot[filterType][key];
      const currentValues = filterSnapshot[filterType];
      const updatedValues = parentKey
        ? {
          [filter.mappedFrom.parentKey]: {
            ...parentFilterMap,
            [key]: false
          },
        }
        : { [key]: false };
      const updatedSubtopicValues = parentKey === topicKey
        ? {
          [key]: Object.keys(filterForRemoval).reduce((subtopic, key) => ({
            ...subtopic,
            [key]: false
          }), {})
        }
        : {};

      return { ...currentValues, ...updatedValues, ...updatedSubtopicValues };
    };
    const filterTypeValuesMap = {
      [FilterType.DURATION]: () => DEFAULT_FILTER_DURATION,
    };

    this.store.dispatch(new FilterActions.UpdateFilterStates(filterTypeValuesMap[filterType]?.() ?? defaultRemoveFilterValues(), filterType));

  }

  @Selector()
  private getSnapshot(state: FilterStateData): FilterStateData {
    return state;
  }

  @Selector()
  static getSearchFilterSnapshot(state: FilterStateData): Filter {
    return state.searchFilter;
  }

  @Selector()
  static getActiveFiltersFunctionsMapSnapshot(state: FilterStateData): ActiveFilterFunctionsMap {
    return state.activeFilterFunctionsMap;
  }

  @Selector()
  static getActiveFilters(state: FilterStateData): ActiveFilter[] {
    return state.activeFilters;
  }

  @Selector()
  static getData(state: FilterStateData) {
    return state.data;
  }

  @Selector()
  static selectFilteredData(state: FilterStateData): any {
    const { data } = state;
    if (!!data) {
      const activeFilters = Object.values(state.activeFilterFunctionsMap)?.filter(v => !!v);
      //if there are active filters, filter data based on which filter functions are active
      return !activeFilters.length ? data : data.filter(el => activeFilters.every(func => func(el)));
    }

    return;
  }

  static getFilterOptionByType(filterType: FilterType) {
    return createSelector([FilterState], (state: FilterStateData) => {
      return state.filter[filterType];
    })
  }

  static getSearchFilterOptionByType(filterType: FilterType.TOPICS | FilterType.KEYWORDS) {
    return createSelector([FilterState], (state: FilterStateData) => {
      return state.searchFilter[filterType];
    })
  }
  
  private updateUrlQueryParams() {
    const filterStore = this.store.selectSnapshot(x => x.Filter);
    const { selectedFilters, ...otherQueryParams } = this.route.snapshot.queryParams;
    const selectedFiltersQueryParam = filterStore.activeFilters.length
      ? { selectedFilters: stringifySelectedFiltersQueryParam(filterStore.activeFilters) }
      : {};
    const queryParams = { ...otherQueryParams, ...selectedFiltersQueryParam };
    const url = this.router.createUrlTree([], { relativeTo: this.route, queryParams: queryParams }).toString()

    this.location.replaceState(url);
  }
}
