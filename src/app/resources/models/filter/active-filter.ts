import {FilterType} from "../../enums/filter-type";
import {toTitleCase} from "../../functions/strings/to-title-case";
import {ContentDifficulty} from "../content";
import {DifficultyString} from "./difficulty-filter";


export const DEFAULT_DURATION_MIN = 0;
export const DEFAULT_DURATION_MAX = 7200;

export interface ActiveFilter {
  label: string;
  isActive: boolean;
  id?: number;
  mappedFrom: {
    filterType: FilterType;
    parentKey?: string;
    key: string;
  }
}

export function getActiveFilters(filterValues: any, filterType: FilterType, parentKey?: string): ActiveFilter[] {
  if (filterType === FilterType.DURATION) {
    const isDurationActive = !(filterValues.value === DEFAULT_DURATION_MIN && filterValues.highValue === DEFAULT_DURATION_MAX);
    return [getActiveFilter(filterType, isDurationActive, filterType)];
  } else {
    return Object.entries(filterValues).flatMap(([k, v]: [string, any]) => {
      if (typeof v === 'object') {
        return getActiveFilters(v, filterType, k);
      } else {
        return getActiveFilter(k, v, filterType, parentKey);
      }
    }).sort((a: ActiveFilter, b: ActiveFilter) => a.label.localeCompare(b.label))
  }
}

function getActiveFilter(key: string, value: boolean, filterType: FilterType, parentKey?: string): ActiveFilter {
  return {
    label: getFilterLabel(key, filterType, parentKey),
    isActive: value,
    mappedFrom: {
      filterType: filterType,
      key: key,
      parentKey: parentKey
    }
  };
}

function getFilterLabel(filterKey: string, filterType: FilterType, parentKey?: string) {
  const durationLabel = 'Duration'

  const filterTypeLabelMap = {
    [FilterType.TOPICS]: () => getTopicsLabel(filterKey, parentKey),
    [FilterType.DURATION]: () => durationLabel,
    [FilterType.CONTENT_TYPE]: () => getContentTypeLabel(filterKey),
    [FilterType.DIFFICULTY]: () => getDifficultyLabel(filterKey),
    [FilterType.KEYWORDS]: () => getKeywordsLabel(filterKey)
  };

  return filterTypeLabelMap[filterType]?.() || filterKey;
}

function getTopicsLabel(filterKey: string, parentKey?: string): string {
  const topicsParentKey = 'topics ';
  const noTopicsAssignedKey = 'noTopicsAssigned';
  const noTopicsAssignedLabel = 'No Topics Assigned';
  const topicsLabel = `${parentKey} ${filterKey}`.replace(topicsParentKey, '').replace(`${parentKey} `, `${parentKey} - `);

  return filterKey === noTopicsAssignedKey ? noTopicsAssignedLabel : topicsLabel;
}

function getContentTypeLabel(contentType) {
  return toTitleCase(contentType);
}

export function getDifficultyLabel(difficulty) {
  const map = {
    [DifficultyString.NONE]: 'No Difficulty Assigned',
    [DifficultyString.BEGINNER]: 'Beginner',
    [DifficultyString.INTERMEDIATE]: 'Intermediate',
    [DifficultyString.ADVANCED]: 'Advanced',
  };

  return map[difficulty];
}

function getKeywordsLabel(filterKey: string): string {
  const noKeywordsAssignedKey = 'noKeywordsAssigned';
  const noKeywordsAssignedLabel = 'No Keywords Assigned';
  const keywordsLabel = `${filterKey}`;

  return filterKey === noKeywordsAssignedKey ? noKeywordsAssignedLabel : keywordsLabel;
}

