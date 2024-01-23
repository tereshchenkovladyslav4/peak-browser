import { stringifySelectedFiltersQueryParam } from "../../resources/functions/filter/filter";
import { hashObject } from "../../resources/functions/hash/hash";
import { DEFAULT_DURATION_MAX, DEFAULT_DURATION_MIN } from "../../resources/models/filter/active-filter";
import { mapContentTypeStringToServerContentType } from "../../resources/models/filter/content-type-filter";
import { mapDifficultyStringToContentDifficulty } from "../../resources/models/filter/difficulty-filter";
import { Topic } from "../../resources/models/topic";

 export function getActiveFilterId({ isActive, ...filter }) {
  // builds a unique ID from the filter JSON properties excluding isActive and id
  return hashObject(filter);
}

  export function getPublishFilterFunction(filterValues: any) {
  const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => k);
  return activeFilters?.length
    ? (dataElement): boolean => activeFilters.includes(dataElement?.publisher?.name)
    : null;
}

  export function getTopicsFilterFunction({ topics, ...filterValues }: any) {
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

  export function getContentTypeFilterFunction(filterValues: any) {
  const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => mapContentTypeStringToServerContentType(k));
  return activeFilters?.length
    ? (dataElement): boolean => activeFilters.includes(dataElement.contentType)
    : null;
}

  export function getDurationFilterFunction(durationRange: { value: number, highValue: number }) {
  const filterFunction = (dataElement): boolean => (dataElement.duration >= durationRange.value && dataElement.duration <= durationRange.highValue);
  return !(durationRange.value === DEFAULT_DURATION_MIN && durationRange.highValue === DEFAULT_DURATION_MAX)
    ? filterFunction
    : null;
}

  export function getDifficultyFilterFunction(filterValues: any) {
  const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => mapDifficultyStringToContentDifficulty(k));
  return activeFilters?.length
    ? (dataElement): boolean => activeFilters.includes(dataElement.difficulty)
    : null;
}

  export function getKeywordsFilterFunction(filterValues: any) {
  const activeFilters = Object.entries(filterValues).filter(([k, v]) => !!v).map(([k]) => k);
  const noKeywordsAssigned = filterValues.noKeywordsAssigned;
  return activeFilters?.length
    ? (dataElement): boolean => activeFilters.some(f => dataElement?.keywords?.includes(f)) ||
      (noKeywordsAssigned && !dataElement.keywords.length)
    : null;
}

  export function getSearchFilterFunction(filterValues: any) {
  const [activeFiltersKeys, activeFiltersValues] = [Object.keys(filterValues), Object.values(filterValues)];
  return activeFiltersKeys.length && (activeFiltersValues?.every(v => !!v) || false)
    ? (dataElement): boolean => (
      activeFiltersKeys.some((key, i) =>
        dataElement[key.toString()]?.toLowerCase().includes(activeFiltersValues[i].toString().toLowerCase()) || null
      )
    )
    : null;
}
