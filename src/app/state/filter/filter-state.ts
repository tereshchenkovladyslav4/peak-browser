import {BaseState, BaseStateService, setDefaultValues} from "../base-state";
import {Injectable} from "@angular/core";
import {ActiveFilter, DEFAULT_DURATION_MAX, DEFAULT_DURATION_MIN} from "../../resources/models/filter/active-filter";
import {FilterType} from "../../resources/enums/filter-type";
import {filter, Observable} from "rxjs";
import {map} from "rxjs/operators";

export const DEFAULT_FILTER_DURATION = {value: DEFAULT_DURATION_MIN, highValue: DEFAULT_DURATION_MAX};

interface ActiveFilterFunctionsMap {
  [key: string]: Function
}

const DEFAULT_ACTIVE_FILTER_FUNCTIONS_MAP: ActiveFilterFunctionsMap = {
  [FilterType.PUBLISHER]: null,
  [FilterType.TOPICS]: null,
  [FilterType.CONTENT_TYPE]: null,
  [FilterType.DURATION]: null,
  [FilterType.DIFFICULTY]: null,
  [FilterType.KEYWORDS]: null,
  [FilterType.SEARCH]: null,
}

interface Filter {
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

interface State extends BaseState {
  data: any[];
  filter: Filter;
  searchFilter: Filter;
  activeFilters: ActiveFilter[]
  activeFilterFunctionsMap: ActiveFilterFunctionsMap;

}

const DEFAULT_STATE: State = setDefaultValues({
  data: [],
  filter: DEFAULT_FILTER_STATE,
  searchFilter: DEFAULT_SEARCH_FILTER_STATE,
  activeFilters: [],
  activeFilterFunctionsMap: DEFAULT_ACTIVE_FILTER_FUNCTIONS_MAP,
});

@Injectable({
  providedIn: 'root'
})
export class FilterStateService extends BaseStateService<State> {

  constructor() {
    super(DEFAULT_STATE);
  }

  // REDUCER / UPDATES
  updateFilter(filter: Filter) {
    this.updateState({
      ...this.state$.getValue(),
      filter: filter
    });
  }

  updateData(data: any) {
    this.updateState({
      ...this.state$.getValue(),
      data: data
    });
  }

  updateSearchFilter(searchFilter: Filter) {
    this.updateState({
      ...this.state$.getValue(),
      searchFilter: searchFilter
    });
  }

  updateActiveFilters(activeFilters: ActiveFilter[]) {
    this.updateState({
      ...this.state$.getValue(),
      activeFilters: activeFilters
    });
  }

  updateActiveFilterFunctionsMap(activeFilterFunctionsMap: ActiveFilterFunctionsMap) {
    this.updateState({
      ...this.state$.getValue(),
      activeFilterFunctionsMap: activeFilterFunctionsMap
    });
  }

  resetFilter() {
    this.updateFilter(DEFAULT_FILTER_STATE);
  }

  resetSearchFilter() {
    this.updateSearchFilter(DEFAULT_SEARCH_FILTER_STATE);
  }

  resetActiveFilterFunctionsMap() {
    this.updateActiveFilterFunctionsMap(DEFAULT_ACTIVE_FILTER_FUNCTIONS_MAP);
  }

  resetActiveFilters() {
    this.updateActiveFilters([]);
  }

  // SELECTORS
  selectData() {
    return this.selectState(state => state.data);
  }

  selectActiveFilters() {
    return this.selectState(state => state.activeFilters);
  }

  selectFilter() {
    return this.selectState(state => state.filter);
  }

  selectFilterPublisher() {
    return this.selectFilter().pipe(map(state => state[FilterType.PUBLISHER]));
  }

  selectFilterTopics() {
    return this.selectFilter().pipe(map(state => state[FilterType.TOPICS]));
  }

  selectFilterContentType() {
    return this.selectFilter().pipe(map(state => state[FilterType.CONTENT_TYPE]));
  }

  selectFilterDuration() {
    return this.selectFilter().pipe(map(state => state[FilterType.DURATION]));
  }

  selectFilterDifficulty() {
    return this.selectFilter().pipe(map(state => state[FilterType.DIFFICULTY]));
  }

  selectFilterKeywords() {
    return this.selectFilter().pipe(map(state => state[FilterType.KEYWORDS]));
  }

  selectFilterSearch() {
    return this.selectFilter().pipe(map(state => state[FilterType.SEARCH]));
  }

  selectSearchFilter() {
    return this.selectState(state => state.searchFilter);
  }

  selectSearchFilterTopics() {
    return this.selectSearchFilter().pipe(map(state => state[FilterType.TOPICS]));
  }

  selectSearchFilterKeywords() {
    return this.selectSearchFilter().pipe(map(state => state[FilterType.KEYWORDS]));
  }

  // SELECTORS FROM SELECTORS

  selectFilteredData(): Observable<any> {
    return this.selectState(state => [
      state.data,
      state.activeFilterFunctionsMap,
      state.builtInSearchTerms
    ]).pipe(
      filter(([data, ...rest]) => !!data),
      map(([data, activeFiltersMap, ...rest]: [any[], ActiveFilterFunctionsMap]) => {

        const activeFilters = Object.values(activeFiltersMap)?.filter(v => !!v) || [];
        if (!activeFilters.length) {
          return data;
        }

        return data.filter(el => activeFilters.every(func => func(el)));
      })
    );
  }

  selectIsNoDataResults(): Observable<boolean> {
    return this.selectData().pipe(map(data => data && !data.length));
  }

  selectIsNoFilteredDataResults(): Observable<boolean> {
    return this.selectFilteredData().pipe(map(filteredData => filteredData && !filteredData.length));
  }

  // SNAPSHOT

  getFilterSnapshot() {
    return this.getStateSnapshot().filter;
  }

  getSearchFilterSnapshot() {
    return this.getStateSnapshot().searchFilter;
  }

  getActiveFiltersSnapshot() {
    return this.getStateSnapshot().activeFilters;
  }

  getActiveFiltersFunctionsMapSnapshot() {
    return this.getStateSnapshot().activeFilterFunctionsMap;
  }
}
