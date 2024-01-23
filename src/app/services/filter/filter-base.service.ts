import {Injectable} from '@angular/core';
import {FilterType} from "../../resources/enums/filter-type";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {
  ActiveFilter,
  DEFAULT_DURATION_MAX,
  DEFAULT_DURATION_MIN,
  getActiveFilters
} from "../../resources/models/filter/active-filter";
import {hashObject} from "../../resources/functions/hash/hash";
import {mapContentTypeStringToServerContentType} from "../../resources/models/filter/content-type-filter";
import {mapDifficultyStringToContentDifficulty} from "../../resources/models/filter/difficulty-filter";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {
  parseSelectedFiltersQueryParam,
  stringifySelectedFiltersQueryParam
} from "../../resources/functions/filter/filter";
import {DEFAULT_FILTER_DURATION, FilterStateService} from "../../state/filter/filter-state";
import {ConsumesState} from "../consumes-state/consumes-state.service";
import { Topic } from '../../resources/models/topic';



@Injectable({
  providedIn: 'root'
})
export class FilterBaseService extends ConsumesState<FilterStateService> {

  isNoFilteredDataResults$: Observable<boolean>;
  reset$ = new Subject<{
    appBarSearch?: boolean,
    filters?: boolean
  }>();

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected location: Location,
              protected filterState: FilterStateService) {
    super(filterState);
  }

  applyFiltersFromUrlQueryParam() {
    const selectedFilters = parseSelectedFiltersQueryParam(this.route.snapshot.queryParams['selectedFilters']);
    Object.entries(selectedFilters).forEach(([k, v]: [FilterType, any]) => this.onFilter(v, k));
  }

  removeAllFilters() {
    this.filterState.resetFilter();
    this.updateUrlQueryParams();
    this.filterState.resetSearchFilter();
    this.filterState.resetActiveFilterFunctionsMap();
    this.filterState.resetActiveFilters();
  }

  removeFilter({mappedFrom: {filterType, key, parentKey}}: ActiveFilter) {
    // this removes simple filters and handles the nested structure and rules of topics filters
    const defaultRemoveFilterValues = () => {
      const topicKey = 'topics';
      const filterSnapshot = this.filterState.getFilterSnapshot();
      const parentFilterMap = filterSnapshot[filterType][parentKey];
      const filterForRemoval = filterSnapshot[filterType][key];
      const currentValues = filterSnapshot[filterType];
      const updatedValues = parentKey
        ? {
          [parentKey]: {
            ...parentFilterMap,
            [key]: false
          },
        }
        : {[key]: false};
      const updatedSubtopicValues = parentKey === topicKey
        ? {
          [key]: Object.keys(filterForRemoval).reduce((subtopic, key) => ({
            ...subtopic,
            [key]: false
          }), {})
        }
        : {};

      return {...currentValues, ...updatedValues, ...updatedSubtopicValues};
    };
    const filterTypeValuesMap = {
      [FilterType.DURATION]: () => DEFAULT_FILTER_DURATION,
    };

    this.onFilter(filterTypeValuesMap[filterType]?.() ?? defaultRemoveFilterValues(), filterType)
  }

  onSearch(searchValue, filterType: FilterType) {
    this.filterState.updateSearchFilter({
      ...this.filterState.getSearchFilterSnapshot(),
      [filterType]: searchValue
    })
  }

  onFilter(filterValues, filterType: FilterType) {
    const activeFilterFunctionMethodMap = {
      [FilterType.PUBLISHER]: () => this.getPublishFilterFunction(filterValues),
      [FilterType.TOPICS]: () => this.getTopicsFilterFunction(filterValues),
      [FilterType.CONTENT_TYPE]: () => this.getContentTypeFilterFunction(filterValues),
      [FilterType.DURATION]: () => this.getDurationFilterFunction(filterValues),
      [FilterType.DIFFICULTY]: () => this.getDifficultyFilterFunction(filterValues),
      [FilterType.KEYWORDS]: () => this.getKeywordsFilterFunction(filterValues),
      [FilterType.SEARCH]: () => this.getSearchFilterFunction(filterValues)
    };

    // update state for keeping track of all values
    this.updateActiveFilters(filterValues, filterType);
    this.updateFilterState(filterValues, filterType);
    this.updateActiveFiltersFunctionsMap(activeFilterFunctionMethodMap[filterType](), filterType);
  }

  private getPublishFilterFunction(filterValues: any) {
    const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => k);
    return activeFilters?.length
      ? (dataElement): boolean => activeFilters.includes(dataElement?.publisher?.name)
      : null;
  }

  private getTopicsFilterFunction({topics, ...filterValues}: any) {
    const activeTopicsFilters = Object.entries(topics).filter(([k, v]) => !!v).map(([k]) => k);
    const activeSubtopicsFiltersMap = Object.fromEntries(
      Object.entries(filterValues).map(([k, v]) =>
        [k, Object.entries(v).filter(([k, v]) => !!v)?.map(([k, v]) => k)])
        ?.filter(([k, v]) => v?.length));
    const noTopicsAssigned = filterValues.noTopicsAssigned;

    const checkTopic = (topic: Topic) =>
      activeTopicsFilters.includes(topic.name) &&
      (!activeSubtopicsFiltersMap?.[topic.name]?.length ||
        activeSubtopicsFiltersMap?.[topic.name]?.length === Object.keys(filterValues?.[topic.name] || {})?.length);

    const checkSubTopic = (topic: Topic) =>
      activeSubtopicsFiltersMap?.[topic.name] &&
      topic?.subtopics
           ?.map((subtopic) => subtopic.name)
           ?.some((subtopicName) => activeSubtopicsFiltersMap?.[topic.name].includes(subtopicName));

    return activeTopicsFilters?.length || Object.keys(activeSubtopicsFiltersMap).length || noTopicsAssigned
      ? (dataElement): boolean =>
        dataElement.topics?.some((topic) => checkTopic(topic) || checkSubTopic(topic)) ||
        (noTopicsAssigned && !dataElement.topics.length)
      : null;
  }

  private getContentTypeFilterFunction(filterValues: any) {
    const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => mapContentTypeStringToServerContentType(k));
    return activeFilters?.length
      ? (dataElement): boolean => activeFilters.includes(dataElement.contentType)
      : null;
  }

  private getDurationFilterFunction(durationRange: { value: number, highValue: number }) {
    const filterFunction = (dataElement): boolean => (dataElement.duration >= durationRange.value && dataElement.duration <= durationRange.highValue);
    return !(durationRange.value === DEFAULT_DURATION_MIN && durationRange.highValue === DEFAULT_DURATION_MAX)
      ? filterFunction
      : null;
  }

  private getDifficultyFilterFunction(filterValues: any) {
    const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => mapDifficultyStringToContentDifficulty(k));
    return activeFilters?.length
      ? (dataElement): boolean => activeFilters.includes(dataElement.difficulty)
      : null;
  }

  private getKeywordsFilterFunction(filterValues: any) {
    const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => k);
    const noKeywordsAssigned = filterValues.noKeywordsAssigned;
    return activeFilters?.length
      ? (dataElement): boolean => activeFilters.some(f => dataElement?.keywords?.includes(f)) ||
        (noKeywordsAssigned && !dataElement.keywords.length)
      : null;
  }

  private getSearchFilterFunction(filterValues: any) {
    const [ activeFiltersKeys, activeFiltersValues ] = [Object.keys(filterValues), Object.values(filterValues)];
    return activeFiltersKeys.length && (activeFiltersValues?.every(v => !!v) || false)
      ? (dataElement): boolean => (
        activeFiltersKeys.some((key, i) =>
          dataElement[key.toString()]?.toLowerCase().includes(activeFiltersValues[i].toString().toLowerCase()) || null
        )
      )
      : null;
  }

  private updateFilterState(filterValues, filterType: FilterType) {
    this.filterState.updateFilter({...this.filterState.getFilterSnapshot(), [filterType]: filterValues});
    this.updateUrlQueryParams();
  }

  private updateActiveFiltersFunctionsMap(filterFunction, filterType: FilterType) {
    this.filterState.updateActiveFilterFunctionsMap({
      ...this.filterState.getActiveFiltersFunctionsMapSnapshot(),
      [filterType]: filterFunction
    });
  }

  private updateActiveFilters(filterValues, filterType: FilterType) {
    const skipFilterTypes = [FilterType.SEARCH];
    if (skipFilterTypes.includes(filterType)) {
      return;
    }

    // builds new ActiveFilters from filterValues arg
    const newFilters = getActiveFilters(filterValues, filterType)
      // assign ID
      .map(filter => ({...filter, id: this.getActiveFilterId(filter)}))

    // updates current ActiveFilters isActive property based on new filter values
    const currentFilters = this.filterState.getActiveFiltersSnapshot().map(filter => {
      return {
        ...filter,
        isActive: newFilters.find(f => f.id === filter.id)?.isActive ?? filter.isActive
      };
    });

    // combines new and current - filters on isActive to remove inactive - deduplicates remaining positive filters
    const newActiveFilters = [...currentFilters, ...newFilters].filter(filter => filter.isActive)
      .filter((filter, index, array) =>
        array.findIndex(f => f.id == filter.id) === index);

    this.filterState.updateActiveFilters(newActiveFilters);
  }

  private getActiveFilterId({isActive, ...filter}) {
    // builds a unique ID from the filter JSON properties excluding isActive and id
    return hashObject(filter);
  }

  private updateUrlQueryParams() {
    const {selectedFilters, ...otherQueryParams} = this.route.snapshot.queryParams;
    const selectedFiltersQueryParam = this.filterState.getActiveFiltersSnapshot().length
      ? {selectedFilters: stringifySelectedFiltersQueryParam(this.filterState.getFilterSnapshot())}
      : {};
    const queryParams = { ...otherQueryParams, ...selectedFiltersQueryParam };
    const url = this.router.createUrlTree([], {relativeTo: this.route, queryParams: queryParams}).toString()

    this.location.replaceState(url);
  }
}
