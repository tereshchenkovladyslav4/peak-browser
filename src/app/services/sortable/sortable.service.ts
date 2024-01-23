import {Directive, Inject, Injectable, InjectionToken} from "@angular/core";
import {BehaviorSubject} from "rxjs";

export const ASC = 'asc';
export const DESC = 'desc';

type Order = 'asc' | 'desc';

export const SORT_BY_TOKEN: InjectionToken<any> = new InjectionToken<any>('sortBy');

// don't use as singleton
@Injectable()
export class SortableService<T> {

  sortBy: {
    [key: string]: {
      order: Order;
      isActive: boolean;
      path: string;
    }
  };
  triggerSort$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(@Inject(SORT_BY_TOKEN) protected defaultSortBy: any) {
    this.sortBy = defaultSortBy;
    this.triggerSort$.next(this.sortBy[this.getActiveSortKey()]);
  }

  sortByProperty(property: string) {
    this.deactivateAllSorts();
    this.sortBy[property].order = this.sortBy[property].order === ASC ? DESC : ASC;
    this.sortBy[property].isActive = true;
    this.triggerSort$.next(this.sortBy[property]);
  }

  propertyCompareFn(path: string, order: string) {
    return (a: T, b: T) => order === ASC
      ? resolvePath(a, path)?.toUpperCase().localeCompare(resolvePath(b, path)?.toUpperCase())
      : resolvePath(b, path)?.toUpperCase().localeCompare(resolvePath(a, path)?.toUpperCase())
  }

  private deactivateAllSorts() {
    Object.keys(this.sortBy).forEach(key => this.sortBy[key].isActive = false);
  }

  private getActiveSortKey() {
    return Object.keys(this.sortBy).find(key => this.sortBy[key].isActive);
  }
}

export function resolvePath(object: Object, path: string, defaultValue = null) {
  return path.split('.').reduce((o, p) => o ? o[p] : defaultValue, object);
}
