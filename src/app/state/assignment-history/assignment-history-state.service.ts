import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { FilterBaseService } from '../../services/filter/filter-base.service';
import { Observable, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterStateService } from '../filter/filter-state';
import { AssignmentHistoryService } from '../../services/assignment-history/assignment-history.service';

@Injectable({
  providedIn: 'root',
})
export class AssignmentHistoryStateService extends FilterBaseService {
  constructor(
    private assignmentHistoryService: AssignmentHistoryService,
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override location: Location,
    protected override filterState: FilterStateService,
  ) {
    super(route, router, location, filterState);
  }

  getHistoricalAssignments(): Observable<any[]> {
    this.filterState.updateIsLoaded(false);
    return this.assignmentHistoryService.fetchHistoricalAssignments().pipe(
      tap((results) => this.filterState.updateData(results)),
      tap(() => this.filterState.updateIsLoaded(true)),
    );
  }
}
