import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Assignment, AssignmentEnrollmentStatus, AssignmentHistory } from '../../../../resources/models/assignment';
import { AsyncPipe, DatePipe, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { DropdownMenuContainerComponent } from '../../../../components/dropdown-menu-container/dropdown-menu-container.component';
import { TableModule } from 'primeng/table';
import { EpDatePipe } from 'src/app/pipes/ep-date.pipe';
import { DESC, SORT_BY_TOKEN, SortableService } from '../../../../services/sortable/sortable.service';
import { AssignmentHistoryService } from '../../../../services/assignment-history/assignment-history.service';
import { FilterStateService } from '../../../../state/filter/filter-state';
import { APP_ROUTES, NAVIGATION_ROUTES } from '../../../../resources/constants/app-routes';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { NoResultComponent } from '../../../../components/no-result/no-result.component';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterLink } from '@angular/router';
import { WithIsLoaded } from '../../../../resources/mixins/is-loaded.mixin';
import { FilterType } from '../../../../resources/enums/filter-type';
import { MenuModule } from 'primeng/menu';
import { DropdownItem } from 'src/app/resources/models/dropdown-item';
import { DropdownMenuService } from 'src/app/services/dropdown-menu.service';
import { ContentType, ContentDocumentType } from 'src/app/resources/models/content';
import { ContentTypesService } from 'src/app/services/content-types.service';
import { SortMeta } from 'primeng/api';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { ViewCertificateComponent } from 'src/app/components/dialog/view-certificate/view-certificate.component';
import { DialogConfig } from 'src/app/components/dialog/dialog-base/dialog-base.component';
import { EnrollmentDetailsComponent } from '../enrollment-details/enrollment-details.component';
import { formatDurationShort } from '../../../../resources/functions/content/content';
import { AssignmentBookmarkComponent } from '../assignment-bookmark/assignment-bookmark.component';

const HISTORICAL_STATUSES = [
  AssignmentEnrollmentStatus.Expired,
  AssignmentEnrollmentStatus.Dropped,
  AssignmentEnrollmentStatus.Completed,
];

const DEFAULT_SORT = {
  name: {
    order: DESC,
    isActive: true,
    path: 'statusDate',
  },
};

@Component({
  selector: 'ep-assignment-history',
  templateUrl: './assignment-history.component.html',
  styleUrls: ['./assignment-history.component.scss'],
  imports: [
    NgForOf,
    AsyncPipe,
    DatePipe,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    DropdownMenuContainerComponent,
    NgStyle,
    TableModule,
    LoadingComponent,
    NoResultComponent,
    SharedModule,
    RouterLink,
    MenuModule,
    AssignmentBookmarkComponent,
  ],
  providers: [EpDatePipe, { provide: SORT_BY_TOKEN, useValue: DEFAULT_SORT }, SortableService],
  standalone: true,
})
export class AssignmentHistoryComponent extends WithIsLoaded() implements OnInit, OnDestroy {
  protected readonly APP_ROUTES = APP_ROUTES;
  readonly unsubscribeAll$ = new Subject<void>();
  protected readonly DEFAULT_SORT_FIELD = 'statusDate';
  protected readonly DEFAULT_SORT_ORDER = 1;
  @Input() formFilter$: Observable<string>;
  filteredData$: Observable<Assignment[]>;
  isNoDataResults$: Observable<boolean>;
  isNoFilteredDataResults$: Observable<boolean>;
  tableData$: Observable<AssignmentHistory[]>;
  dropdownMenusMap = new Map<string, DropdownItem[]>();
  selectedRow: AssignmentHistory;
  columns = [
    { header: 'assignments.name', field: 'name', sortable: true },
    { header: 'assignments.learning-path', field: 'learningPathName', sortable: true },
    { header: 'assignments.content-type', field: 'contentType', sortable: true },
    { header: 'assignments.status', field: 'statusLabel', sortable: true },
    { header: 'assignments.status-date', field: 'statusDate', sortable: true },
  ];
  sortBy$ = new BehaviorSubject<SortMeta>({ field: this.DEFAULT_SORT_FIELD, order: this.DEFAULT_SORT_ORDER });

  constructor(
    private contentTypesService: ContentTypesService,
    protected sortable: SortableService<AssignmentHistory>,
    private filterState: FilterStateService,
    private assignmentHistoryService: AssignmentHistoryService,
    private dropdownMenuService: DropdownMenuService,
    private router: Router,
    private dialogService: DialogService,
  ) {
    super();
  }

  ngOnInit() {
    this.isNoFilteredDataResults$ = this.filterState.selectIsNoFilteredDataResults();
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();
    this.setIsLoaded(this.assignmentHistoryService);
    this.assignmentHistoryService.getHistoricalAssignments().pipe(take(1)).subscribe();

    this.formFilter$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((value) => this.onBuiltInSearch(value));
    this.assignmentHistoryService.reset$
      .pipe(
        takeUntil(this.unsubscribeAll$),
        filter((r) => r?.filters),
      )
      .subscribe(() => this.clearFilters());

    this.filteredData$ = combineLatest([this.filterState.selectFilteredData(), this.formFilter$]).pipe(
      map(([assignments]) => assignments),
    );
    this.tableData$ = this.filteredData$.pipe(
      filter((data) => !!data),
      map((data) =>
        data.filter(
          (
            assignment, // filters on done statuses
          ) =>
            HISTORICAL_STATUSES.some((status) =>
              [assignment.status as unknown as AssignmentEnrollmentStatus].includes(status),
            ),
        ),
      ),
      map((assignments) => assignments.map((assignment) => ({ ...this.rowFactory(assignment), raw: assignment }))),
    );

    this.tableData$ = combineLatest([this.tableData$, this.sortBy$]).pipe(
      map(([assignments, sortBy]) => {
        if (assignments?.length && sortBy?.field && sortBy?.order) {
          return this.defaultSort(assignments, sortBy);
        }

        return assignments;
      }),
    );

    // create dropdownItems foreach row in table
    this.tableData$
      .pipe(
        tap((assignmentsHistory) => {
          const menuItemMaps: [k: string, v: DropdownItem[]][] = assignmentsHistory.map((assignmentHistory) => [
            assignmentHistory.id as string,
            this.createDropdownMenu(assignmentHistory),
          ]);
          this.dropdownMenusMap = new Map(menuItemMaps);
        }),
        takeUntil(this.unsubscribeAll$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.filterState.resetState();
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  defaultSort(assignments: AssignmentHistory[], sortBy: SortMeta) {
    return assignments.sort((a, b) => {
      const sortOrder = sortBy.order;
      switch (sortBy.field) {
        case 'learningPathName': {
          return (
            (a.learningPathName || '').localeCompare(b.learningPathName || '') * sortOrder ||
            (a.name || '').localeCompare(b.name || '') * sortOrder
          );
        }
        case 'content-type': {
          return (
            (a.contentType || '').localeCompare(b.contentType || '') * sortOrder ||
            (a.name || '').localeCompare(b.name || '') * sortOrder
          );
        }
        case 'statusLabel': {
          return (
            (a.statusLabel || '').localeCompare(b.statusLabel || '') * sortOrder ||
            (a.name || '').localeCompare(b.name || '') * sortOrder
          );
        }
        case 'statusDate': {
          return (
            (a.statusDate || 'NA').localeCompare(b.statusDate || 'NA') * -sortOrder ||
            (a.name || '').localeCompare(b.name || '') * sortOrder
          );
        }
        default: {
          return (a.name || '').localeCompare(b.name || '') * sortOrder;
        }
      }
    });
  }

  getData(event) {
    this.sortBy$.next({ field: event.sortField, order: event.sortOrder });
  }

  clearFilters() {
    this.assignmentHistoryService.removeAllFilters();
    this.onBuiltInSearch();
  }

  onBuiltInSearch(filter = '') {
    this.onFilter({ searchBy: filter || '' }, FilterType.SEARCH);
  }

  onFilter(filterValues: any, filterType: FilterType) {
    this.assignmentHistoryService.onFilter(filterValues, filterType);
  }

  onRowSelect(event) {
    this.openEnrollmentDetails(event.data as AssignmentHistory);
  }

  private createDropdownMenu(assignmentHistory: AssignmentHistory): DropdownItem[] {
    return this.dropdownMenuService
      .addViewEnrollmentDetails({
        action: () => this.openEnrollmentDetails(assignmentHistory),
      })
      .addViewDetails({
        action: () => {
          this.goToLearningPath(assignmentHistory);
        }
        })
      .addDivider()
      .addViewCertificate({
        action: () => {
          this.openCertificate(assignmentHistory);
        },
      })
      .getItems();
  }

  goToLearningPath(assignmentHistory: AssignmentHistory) {
    this.router.navigate([NAVIGATION_ROUTES.content, assignmentHistory.learningPathId]);
  }

  private openEnrollmentDetails(assignmentHistory: AssignmentHistory) {
    const enrollmentDetailsConfig: DialogConfig = {
      containerStyles: {
        width: '620px',
      },
      actionsStyles: {
        marginTop: '20px',
      },
    };

    this.dialogService.open(EnrollmentDetailsComponent, {
      data: {
        config: enrollmentDetailsConfig,
        assignmentHistory,
        enrollId: assignmentHistory.id,
        courseId: assignmentHistory.courseId,
      },
    });
  }

  private openCertificate(assignmentHistory: AssignmentHistory) {
    const config: DialogConfig = {
      containerStyles: {
        width: '519px',
        height: '623px',
      },
      contentStyles: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      actionsStyles: {
        marginTop: '20px',
      },
    };

    this.dialogService.open(ViewCertificateComponent, {
      data: {
        config: config,
        enrollId: assignmentHistory.id,
        courseId: assignmentHistory.courseId,
      },
    });
  }

  private navigateToLearningPath(learningPathId: string, courseId: string) {
    this.router.navigate([NAVIGATION_ROUTES.content, learningPathId], {
      queryParams: {
        courseId: courseId,
      },
    });
  }

  private rowFactory(assignment: Assignment): any {
    const that = this;
    const type: 'course' | 'assessment' =
      assignment.assessment && Object.keys(assignment.assessment)?.length ? 'assessment' : 'course';
    const factoryMap = {
      course: () => that.constructCourseRow(assignment),
      assessment: () => that.constructAssessmentRow(assignment),
    };

    return factoryMap[type]() || new Error('type not implemented');
  }

  private constructCourseRow(assignment: Assignment): AssignmentHistory {
    const statusDate =
      assignment.droppedDate ||
      assignment.completedDate ||
      (new Date(assignment.dueDate) < new Date() ? assignment.dueDate : null);
    return {
      id: assignment?.enrollmentId,
      name: assignment.course?.name || '<unnamed>',
      learningPathId: assignment.learningPath?.id,
      learningPathName: assignment.learningPath?.name || '<unnamed>',
      courseId: assignment.course?.id,
      contentType: this.contentTypesService.getContentInfoTranslationText(
        assignment.course?.type as unknown as ContentType,
        assignment.course?.documentType as unknown as ContentDocumentType,
      ),
      statusDate: statusDate,
      ...this.getRowStatusProperties(assignment.status as unknown as AssignmentEnrollmentStatus),
      dropdownItems: null,
      progress: assignment.progress,
      assignedBy: (assignment.assignors || []).map((item) => item.displayName).join(', '),
      duration: formatDurationShort(assignment.course.duration),
    };
  }

  private constructAssessmentRow(assignment: Assignment): any {
    return {
      id: assignment?.enrollmentId,
      name: assignment.assessment?.testName || '<unnamed>',
      learningPathName: assignment.learningPath?.name || '<unnamed>',
      contentType: 'Assessment', // todo update this mapping
      // contentType: this.contentTypesService.getContentInfoTranslationText(
      //   assignment.assessment?.type as unknown as ContentType,
      //   assignment.assessment?.documentType as unknown as ContentDocumentType
      // ),
      statusDate: assignment.assessment?.expiryDate,
      ...this.getRowStatusProperties(assignment.status as unknown as AssignmentEnrollmentStatus),
    };
  }

  private getRowStatusProperties(status: AssignmentEnrollmentStatus) {
    return {
      status: status,
      statusStyles: this.getStatusStyles(status),
      statusIcon: this.getStatusIcon(status),
      statusLabel: this.getStatusLabel(status),
    };
  }

  private getStatusStyles(status: AssignmentEnrollmentStatus) {
    const styleMap = {
      [AssignmentEnrollmentStatus.Completed]: ['#2ca365', '#effbf5'],
      [AssignmentEnrollmentStatus.Dropped]: ['#f74c4c', '#feebeb'],
      [AssignmentEnrollmentStatus.Expired]: ['#ff9a24', '#fff4e7'],
    };
    const getStyles = (...args) => ({
      color: args[0],
      ['background-color']: args[1],
    });

    return getStyles(...styleMap[status]);
  }

  private getStatusIcon(status: AssignmentEnrollmentStatus) {
    const iconMap = {
      [AssignmentEnrollmentStatus.Completed]: 'assets/images/check-green.svg',
      [AssignmentEnrollmentStatus.Dropped]: 'assets/images/remove-red.svg',
      [AssignmentEnrollmentStatus.Expired]: 'assets/images/expired-yellow.svg',
    };

    return iconMap[status];
  }

  private getStatusLabel(status: AssignmentEnrollmentStatus) {
    const labelMap = {
      [AssignmentEnrollmentStatus.Completed]: 'Completed',
      [AssignmentEnrollmentStatus.Dropped]: 'Dropped',
      [AssignmentEnrollmentStatus.Expired]: 'Expired',
    };

    return labelMap[status];
  }
}
