import { FilterType } from "../../resources/enums/filter-type";
import { ActiveFilter } from "../../resources/models/filter/active-filter";
import { ActiveFilterFunctionsMap, Filter } from "./filter.state";

export namespace FilterActions {

  export class UpdateFilter {
    static readonly type = '[Filter] Update Filters';
    constructor(public filterValues: any, public filterType: FilterType) {}
  }

  export class UpdateData {
    static readonly type = '[Filter] Update Data';
    constructor(public data: any) { }
  }

  export class UpdateSearchFilter {
    static readonly type = '[Filter] Update Search Filter';
    constructor(public searchFilter: Filter) { }
  }

  export class UpdateActiveFilters {
    static readonly type = '[Filter] Update Active Filters';
    constructor(public filterValues: any, public filterType: FilterType) { }
  }

  export class UpdateActiveFilterFunctionsMap {
    static readonly type = '[Filter] Update Active Filter Functions Map';
    constructor(public functionsMap: ActiveFilterFunctionsMap) { }
  }

  export class UpdateFilterStates {
    static readonly type = '[Filter] Update All Filters';
    constructor(public filterValues: any, public filterType: FilterType) { }
  }

  export class ResetFilterState {
    static readonly type = '[Filter] Reset Fitler State';
  }

  export class RemoveFilter {
    static readonly type = '[Filter] Remove a Filter';
    constructor(public filter: ActiveFilter) { }
  }

  export class SearchFilterDropdown {
    static readonly type = '[Filter] Search Filter Dropdown';
    constructor(public searchValue: any, public filterType: FilterType) { }
  }
}
