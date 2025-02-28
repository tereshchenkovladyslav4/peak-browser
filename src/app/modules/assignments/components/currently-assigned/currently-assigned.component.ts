import { AssignmentStatusComponent } from '../assignment-status/assignment-status.component';
import { Component, Input, OnInit } from '@angular/core';
import { AssignmentCardComponent } from '../assignment-card/assignment-card.component';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Assignment } from '../../../../resources/models/assignment';
import { Observable, combineLatest, map } from 'rxjs';
import { APP_ROUTES } from '../../../../resources/constants/app-routes';
import { NoResultComponent } from '../../../../components/no-result/no-result.component';
import { SharedModule } from '../../../shared/shared.module';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { Select, Store } from '@ngxs/store';
import { AssignmentsState } from 'src/app/state/assignments/assignments.state';
import { AssignmentsActions } from 'src/app/state/assignments/assignments.actions';
import { ViewMode } from 'src/app/resources/enums/view-mode.enum';
import { AssignmentMenuComponent } from '../assignment-menu/assignment-menu.component';
import { TableModule } from 'primeng/table';
import { SortMeta } from 'primeng/api';
import { AssignmentBookmarkComponent } from '../assignment-bookmark/assignment-bookmark.component';
import { SortSelectorComponent } from '../../../../components/sort-selector/sort-selector.component';
import { SortService } from '../../../../services/sort/sort.service';

@Component({
  selector: 'ep-currently-assigned',
  templateUrl: './currently-assigned.component.html',
  styleUrls: ['./currently-assigned.component.scss'],
  imports: [
    AssignmentCardComponent,
    AsyncPipe,
    NgForOf,
    NgIf,
    NgClass,
    NoResultComponent,
    SharedModule,
    RouterLink,
    LoadingComponent,
    AssignmentMenuComponent,
    TableModule,
    AssignmentStatusComponent,
    AssignmentBookmarkComponent,
    SortSelectorComponent,
  ],
  standalone: true,
})
export class CurrentlyAssignedComponent implements OnInit {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly ViewMode = ViewMode;
  private readonly DEFAULT_SORT_FIELD = 'dueDate';
  private readonly DEFAULT_SORT_ORDER = 1;

  @Select(AssignmentsState.getIsAssignmentsLoading) isAssignmentsLoading$: Observable<boolean>;
  @Select(AssignmentsState.getStackedActiveAssignments) stackedActiveAssignments$: Observable<Assignment[]>;
  @Select(AssignmentsState.getActiveAssignments) activeAssignments$: Observable<Assignment[]>;
  @Input() formFilter$: Observable<string>;
  @Input() viewMode: ViewMode;
  columns = [
    { header: 'assignments.name', field: 'name', sortable: true },
    { header: 'assignments.learning-path', field: 'learning-path', sortable: true },
    { header: 'assignments.content-type', field: 'content-type', sortable: true },
    { header: 'assignments.due-expiration-date', field: 'dueDate', sortable: true },
    { header: 'assignments.status', field: 'status', sortable: true },
    { header: '', field: 'actions', sortable: false },
  ];
  sortedGridViewAssignments$: Observable<Assignment[]>;
  sortedListViewAssignments$: Observable<Assignment[]>;

  constructor(
    private store: Store,
    protected sortService: SortService,
  ) {
    this.sortService.init(
      this.columns
        .filter((item) => item.sortable)
        .map((item) => {
          return { label: item.header, value: item.field };
        }),
      this.DEFAULT_SORT_FIELD,
      this.DEFAULT_SORT_ORDER,
    );

    this.sortedGridViewAssignments$ = combineLatest([this.stackedActiveAssignments$, this.sortService.sortBy$]).pipe(
      map(([assignments, sortBy]) => {
        if (assignments?.length && sortBy?.field && sortBy?.order) {
          return this.defaultSort(assignments, sortBy);
        }
        return assignments;
      }),
    );

    this.sortedListViewAssignments$ = combineLatest([this.activeAssignments$, this.sortService.sortBy$]).pipe(
      map(([assignments, sortBy]) => {
        if (assignments?.length && sortBy?.field && sortBy?.order) {
          return this.defaultSort(assignments, sortBy);
        }
        return assignments;
      }),
    );
  }

  ngOnInit() {
    this.store.dispatch(new AssignmentsActions.CurrentAssignmentsFromApi());
  }

  defaultSort(assignments: Assignment[], sortBy: SortMeta) {
    return assignments.sort((a, b) => {
      const sortOrder = sortBy.order;
      switch (sortBy.field) {
        case 'dueDate': {
          return (
            (a.dueDate || 'NA').localeCompare(b.dueDate || 'NA') * sortOrder ||
            (a.learningPath?.name || '').localeCompare(b.learningPath?.name || '') * sortOrder
          );
        }
        case 'content-type': {
          return (
            (a.contentType || '').localeCompare(b.contentType || '') * sortOrder ||
            (a.learningPath?.name || '').localeCompare(b.learningPath?.name || '') * sortOrder
          );
        }
        case 'status': {
          return (
            (a.progress > b.progress ? -1 : a.progress < b.progress ? 1 : 0) * sortOrder ||
            (a.learningPath?.name || '').localeCompare(b.learningPath?.name || '') * sortOrder
          );
        }
        case 'learning-path': {
          return (
            (a.learningPath?.name || '').localeCompare(b.learningPath?.name || '') * sortOrder ||
            (a.course?.name || '').localeCompare(b.course?.name || '') * sortOrder
          );
        }
        default: {
          return (a.course?.name || '').localeCompare(b.course?.name || '') * sortOrder;
        }
      }
    });
  }

  isPastDue(assignment: Assignment) {
    const today = new Date();
    const due = new Date(assignment.dueDate);

    return assignment.dueDate && due < today;
  }

  getData(event) {
    this.sortService.updateSort(event.sortField, event.sortOrder);
  }
}
