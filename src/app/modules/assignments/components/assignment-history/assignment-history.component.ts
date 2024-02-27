import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Assignment, AssignmentEnrollmentStatus, AssignmentHistory } from '../../../../resources/models/assignment';
import { AsyncPipe, DatePipe, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import { DropdownMenuContainerComponent } from '../../../../components/dropdown-menu-container/dropdown-menu-container.component';
import { TableModule } from 'primeng/table';
import { EpDatePipe } from 'src/app/pipes/ep-date.pipe';
import { DESC, SORT_BY_TOKEN, SortableService } from '../../../../services/sortable/sortable.service';
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
import { EnrollmentService } from '../../../../services/enrollment.service';
import { CertificateUnavailableReason } from '../../../../resources/models/certificate';
import { ConfirmDialogComponent } from '../../../../components/dialog/confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../../../services/translation.service';
import { InformationDialogComponent } from '../../../../components/dialog/information-dialog/information-dialog.component';
import { EnrollSingleContentComponent } from '../../../../components/dialog/enroll-single-content/enroll-single-content.component';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { HISTORICAL_STATUSES } from 'src/app/resources/models/assignment';
import { AssignmentHistoryStateService } from '../../../../state/assignment-history/assignment-history-state.service';

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
  mostRecentAssignmentMap: { [key: string]: Assignment }; // key: courseId -> value: most recent Assignment for courseId

  constructor(
    private contentTypesService: ContentTypesService,
    protected sortable: SortableService<AssignmentHistory>,
    private filterState: FilterStateService,
    private assignmentHistoryStateService: AssignmentHistoryStateService,
    private dropdownMenuService: DropdownMenuService,
    private router: Router,
    private dialogService: DialogService,
    private enrollmentService: EnrollmentService,
    private translationService: TranslationService,
    private bookmarksStateService: BookmarksStateService,
  ) {
    super();
  }

  ngOnInit() {
    this.isNoFilteredDataResults$ = this.filterState
      .selectIsNoFilteredDataResults()
      .pipe(takeUntil(this.unsubscribeAll$));
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults().pipe(takeUntil(this.unsubscribeAll$));
    this.setIsLoaded(this.assignmentHistoryStateService);
    this.assignmentHistoryStateService.getHistoricalAssignments().pipe(takeUntil(this.unsubscribeAll$)).subscribe();

    this.formFilter$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((value) => this.onBuiltInSearch(value));
    this.assignmentHistoryStateService.reset$
      .pipe(
        takeUntil(this.unsubscribeAll$),
        filter((r) => r?.filters),
      )
      .subscribe(() => this.clearFilters());

    this.filteredData$ = combineLatest([this.filterState.selectFilteredData(), this.formFilter$]).pipe(
      map(([assignments]) => assignments),
    );

    // set isCourseInProgress map based on filtered data
    // this comes before the creation of the dropdown items since they are dependent on this data
    this.filteredData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((assignments: Assignment[]) => {
      this.mostRecentAssignmentMap = assignments.reduce((map, assignment) => {
        const key = assignment?.course?.id;
        const assignedDate = Date.parse(assignment?.assignedDate);
        const currAssignedDate = isNaN(Date.parse(map[key]?.assignedDate)) ? -1 : Date.parse(map[key]?.assignedDate);
        map[key] = assignedDate > currAssignedDate ? assignment : map[key];
        return map;
      }, {});
    });

    this.tableData$ = this.filteredData$.pipe(
      takeUntil(this.unsubscribeAll$),
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
      takeUntil(this.unsubscribeAll$),
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
        takeUntil(this.unsubscribeAll$),
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
    this.assignmentHistoryStateService.removeAllFilters();
    this.onBuiltInSearch();
  }

  onBuiltInSearch(filter = '') {
    this.onFilter({ searchBy: filter || '' }, FilterType.SEARCH);
  }

  onFilter(filterValues: any, filterType: FilterType) {
    this.assignmentHistoryStateService.onFilter(filterValues, filterType);
  }

  onRowSelect(event) {
    this.openEnrollmentDetails(event.data as AssignmentHistory);
  }

  private createDropdownMenu(assignmentHistory: AssignmentHistory): DropdownItem[] {
    const courseId = assignmentHistory.courseId;
    const isUserEnrolledInAssignment = !HISTORICAL_STATUSES.includes(
      this.mostRecentAssignmentMap[courseId].status as unknown as AssignmentEnrollmentStatus,
    );
    return this.dropdownMenuService
      .addViewEnrollmentDetails({
        action: () => this.openEnrollmentDetails(assignmentHistory),
      })
      .addViewDetails({
        action: () => {
          this.goToLearningPath(assignmentHistory);
        },
      })
      .addReEnroll({
        visible: !isUserEnrolledInAssignment,
        action: () => {
          if (!assignmentHistory) {
            return;
          }

          this.reenrollInCourse(assignmentHistory);
        },
      })
      .addBookmarkItem(this.bookmarksStateService.isContentBookmarked(courseId), courseId)
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
        width: '624px',
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
    if (assignmentHistory.status === AssignmentEnrollmentStatus.Dropped) {
      this.showNoCertificateCourseDroppedDialog(assignmentHistory);
    } else {
      this.enrollmentService
        .getCertificateAvailable(assignmentHistory.id, assignmentHistory.courseId)
        .pipe(take(1))
        .subscribe((result) => {
          const certificate = result;

          if (!certificate) {
            this.showNoCertificateDialog();
          } else if (
            certificate.reasonUnavailable === CertificateUnavailableReason.NOT_COMPLETE ||
            certificate.reasonUnavailable === CertificateUnavailableReason.FAILED_QUIZ
          ) {
            this.showNoCertificateCourseIncompleteDialog(assignmentHistory);
          } else if (!certificate.useAsDefault) {
            this.showNoCertificateDialog();
          } else if (certificate.useAsDefault) {
            this.showCertificateDialog(assignmentHistory);
          }
        });
    }
  }

  private showNoCertificateDialog() {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('assignments.certificate-not-available-friction-title'),
      content: this.translationService.getTranslationFileData('assignments.certificate-not-available-friction-body'),
      buttonType: 'normal',
      positiveButton: this.translationService.getTranslationFileData('common.close'),
    };

    this.dialogService
      .open(InformationDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe(() => {
        // Do nothing.
      });
  }

  private showNoCertificateCourseDroppedDialog(assignmentHistory: AssignmentHistory) {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('assignments.certificate-not-available-friction-title'),
      content: this.translationService.getTranslationFileData(
        'assignments.certificate-not-available-course-dropped-friction-body',
      ),
      buttonType: 'primary',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('assignments.re-enroll-in-course'),
    };

    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.reenrollInCourse(assignmentHistory);
        }
      });
  }

  private showNoCertificateCourseIncompleteDialog(assignmentHistory: AssignmentHistory) {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('assignments.certificate-not-available-friction-title'),
      content: this.translationService.getTranslationFileData(
        'assignments.certificate-not-available-course-incomplete-friction-body',
      ),
      buttonType: 'primary',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('assignments.re-enroll-in-course'),
    };

    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.reenrollInCourse(assignmentHistory);
        }
      });
  }

  private reenrollInCourse(assignmentHistory: AssignmentHistory) {
    const { learningPathId, courseId, name: courseName } = assignmentHistory;
    this.openEnrollSingle(learningPathId, courseId, courseName).subscribe({
      next: (success) => {
        if (!success) {
          return;
        }

        // update newly enrolled courses map value to true so re-enroll does not show up anymore
        this.mostRecentAssignmentMap[courseId].status =
          AssignmentEnrollmentStatus[AssignmentEnrollmentStatus.Not_Started];

        // refresh this dropdown menu
        this.dropdownMenusMap.set(assignmentHistory.id, this.createDropdownMenu(assignmentHistory));
      },
      error: (err) => {
        console.error('reenrollInCourse error: ', err);
      },
    });
  }

  private showCertificateDialog(assignmentHistory: AssignmentHistory) {
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

  private openEnrollSingle(learningPathId: string, courseId: string, courseName: string): Observable<any> {
    return this.dialogService
      .open(EnrollSingleContentComponent, {
        data: {
          config: { width: 'auto', height: 'auto' },
          learningPathId,
          courseId,
          courseName,
        },
      })
      .afterClosed();
  }

  private rowFactory(assignment: Assignment): any {
    const type: 'course' | 'assessment' =
      assignment.assessment && Object.keys(assignment.assessment)?.length ? 'assessment' : 'course';
    const factoryMap = {
      course: () => this.constructCourseRow(assignment),
      assessment: () => this.constructAssessmentRow(assignment),
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
