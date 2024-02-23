import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { LabelValue } from '../../resources/models/label-value';

@Injectable({ providedIn: 'root' })
export class SortService {
  fields$ = new BehaviorSubject<LabelValue[]>([]);
  sortBy$ = new BehaviorSubject<SortMeta>({ field: '', order: 1 });

  get sortField() {
    return this.sortBy$.value.field
  }

  get sortOrder() {
    return this.sortBy$.value.order
  }

  init(fields: LabelValue[], sortField: string, sortOrder: number) {
    this.fields$.next(fields);
    this.sortBy$.next({ field: sortField, order: sortOrder });
  }

  updateSort(sortField: string, sortOrder: number) {
    this.sortBy$.next({ field: sortField, order: sortOrder });
  }

  toggleSortDirection() {
    this.sortBy$.next({
      ...this.sortBy$.value,
      order: this.sortBy$.value.order * -1,
    });
  }
}
