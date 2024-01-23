import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Observable, Subject, combineLatest, tap} from "rxjs";
import {Tab} from "src/app/components/horizontal-tabs/horizontal-tabs.component";
import {AssignmentEnrollmentStatus} from "src/app/resources/models/assignment";
import {ContentDetails, LearningPath,} from "src/app/resources/models/content";
import {DropdownItem} from "src/app/resources/models/dropdown-item";
import {DropdownMenuService} from "src/app/services/dropdown-menu.service";
import {TranslationService} from "src/app/services/translation.service";
import {LearningPathActionsService} from "src/app/state/learning-path/actions/learning-path-actions.service";
import {LearningPathStateService} from "src/app/state/learning-path/learning-path-state.service";
import {DialogService} from "../../../../../services/dialog/dialog.service";
import {CourseViewData, getContentIndexToResume} from "../models/course-view-data";
import {Location} from "@angular/common";
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { EnrollAllComponent } from '../../../../../components/dialog/enroll-all/enroll-all.component';
import { EnrollSingleContentComponent } from "src/app/components/dialog/enroll-single-content/enroll-single-content.component";
import { ToastrService } from 'ngx-toastr';
import { FlexibleFrictionComponent } from '../../../../../components/dialog/flexible-friction/flexible-friction.component';
import { DialogConfig } from '../../../../../components/dialog/dialog-base/dialog-base.component';
import { Select, Store } from "@ngxs/store";
import { CourseState } from "src/app/state/courses/courses.state";
import { CourseActions } from "src/app/state/courses/courses.actions";

@Component({
  selector: 'ep-learning-path-view',
  templateUrl: './learning-path-view.component.html',
  styleUrls: ['./learning-path-view.component.scss']
})
export class LearningPathViewComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly AssignmentEnrollmentStatus = AssignmentEnrollmentStatus;
  @Input() content: ContentDetails = null;

  @ViewChild('courseContainer') courseContainer: ElementRef;
  @ViewChildren('courseScrollTarget') courseScrollTargets: QueryList<ElementRef<HTMLDivElement>>;

  learningPathContent: LearningPath;
  courseTabsMap = {}; // { [courseId] = Tab[] }
  activeCourseTabsMap = {}; // { [courseId] = TabKey as string }
  courseListCollapsed: boolean = true;
  @Select(CourseState.courses) courses$: Observable<CourseViewData[]>;
  notEnrolledCourses: CourseViewData[];
  dropdownItems: DropdownItem[];
  openCourseViewData: CourseViewData = null;
  showCourseContentDropdown: boolean = false;
  openCourseDropdownTopPos: number = 0;
  openCourseDropdownLeftPos: number = 0;

  expandedCourses$ = new BehaviorSubject<boolean[]>([]);
  expandedCourses: boolean[] = [];

  isLearningPathOpen$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private dropdownMenuService: DropdownMenuService,
    private translationService: TranslationService,
    private learningPathState: LearningPathStateService,
    private learningPathActions: LearningPathActionsService,
    private router: Router,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private location: Location,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private store: Store
  ) {
    
  }

  ngOnInit(): void {
    if (!this.evaluateBackActionAndSkipLoad()) {
      this.learningPathContent = this.content as LearningPath;
      this.setCourses();
      this.evaluateResumeAction();
      this.buildDropdownMenu();
      this.setIsLearningPathOpen();
      this.setExpandedCourses();
    }
  }

  ngAfterViewInit(): void {
    this.handleScrollToCourseOnPageLoad();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setCourses(): void {
    this.courses$.pipe(
      tap((courses: CourseViewData[]) => {
        if (courses) {
          courses.forEach(c => this.setTabs(c));
          this.notEnrolledCourses = courses.filter(c => !c.isEnrolled || c.status === AssignmentEnrollmentStatus.Completed || c.status === AssignmentEnrollmentStatus.Dropped);
          const courseToExpandId = this.route.snapshot.queryParamMap.get('courseId');
          const expandedCourses = courses.map(course => {
            if (course?.courseId === courseToExpandId) {
              // course list should be expanded when a course is expanded
              this.courseListCollapsed = false;
              return true;
            }
            return false;
          })
          this.expandedCourses$.next(expandedCourses);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setTabs(course: CourseViewData): void {
    // setup tabs for courses
    const courseContentText = this.translationService.getTranslationFileData('learning-path-view.course-content');
    const detailsText = this.translationService.getTranslationFileData('learning-path-view.details');

    let tabs: Tab[] = [{key: 'Course Content', label: courseContentText}];
    if (course?.htmlDesc?.length || course?.plainDesc?.length) {
      tabs = [{key: 'Details', label: detailsText}, ...tabs];
    }

    // setup map; key: course id -> value: tab name as string
    this.courseTabsMap = {
      ...this.courseTabsMap,
      [course?.courseId]: tabs
    }

    if (tabs?.length > 0) {
      // setup map; key: course id -> value: active tab name as string
      this.activeCourseTabsMap = {
        ...this.activeCourseTabsMap,
        [course?.courseId]: tabs[0]?.key
      };
    }
  }

  private evaluateResumeAction() {
    const params = this.route.snapshot.queryParams;

    this.courses$.pipe(
      filter(data => !!data),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // resume
      if (params?.['r']) {
        this.updateUrlAndOpenCourse();
      }
    });
  }

  private buildDropdownMenu(): void {
    this.dropdownItems = this.dropdownMenuService.buildShareMenu();
  }

  private setIsLearningPathOpen() {
    this.isLearningPathOpen$ = this.learningPathState.isLearningPathOpen$;
  }

  private setExpandedCourses() {
    this.expandedCourses$
        .pipe(
          tap(expandedCourses => this.expandedCourses = expandedCourses),
          takeUntil(this.destroy$)
        ).subscribe()
  }

  private handleScrollToCourseOnPageLoad() {
    combineLatest([
      this.expandedCourses$,
      this.courseScrollTargets.changes
    ]).pipe(
      tap(([expandedCourses, queryList]) => {
        const activeIndex = expandedCourses.findIndex(ec => !!ec);
        if (activeIndex > -1) {
          const courseScrollTargetEl = queryList.get(activeIndex)?.nativeElement;
          this.updateCourseContainerScrollTop(courseScrollTargetEl.offsetTop);
        }
      }),
      take(1) // only needs to occur once after page and relevant observables are all 'loaded'
    ).subscribe();
  }

  enrollInAll(): void {
    // self enroll in all non-enrolled courses

    this.dialogService
      .open(EnrollAllComponent, {
        data: {
          config: { width: '100%', height: '100%' },
          courses: this.notEnrolledCourses,
          learningPath: this.learningPathContent,
        }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe()
  }

  resume(): void {
    // open LP fullscreen with the FIRST enrolled course that isn't completed
    const courseIndex = this.learningPathState.snapshot.courses?.findIndex(c => !!c?.enrollmentId && (c.status === AssignmentEnrollmentStatus.Not_Started || c.status === AssignmentEnrollmentStatus.In_Progress));
    if (courseIndex > -1) {
      const course = this.learningPathState.snapshot.courses[courseIndex];
      this.openCourse(courseIndex, course);
    }
  }

  courseActionBtnClicked(courseIndex: number, course: CourseViewData): void {
    const isEnrolled = course.status === AssignmentEnrollmentStatus.Not_Started || course.status === AssignmentEnrollmentStatus.In_Progress;
    const isNotEnrolled = course.status === AssignmentEnrollmentStatus.Completed 
      || course.status === AssignmentEnrollmentStatus.Dropped
      || course.status === undefined 
      || course.status === null;
    if (isEnrolled) {
      this.openCourse(courseIndex, course);
    } else if (isNotEnrolled) {
      this.enrollInSingleCourse(course);
    }
  }

  courseDropBtnClicked(course: CourseViewData): void {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('content-container.drop-course-friction-title'),
      content: this.translationService.getTranslationFileData('content-container.drop-course-friction-body')?.replace('[COURSE_NAME]', course.name),
      buttonType: 'danger',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.drop')
    }

    this.dialogService.open(FlexibleFrictionComponent, {
      data: {
        config: dialogConfig
      }
    }).afterClosed().pipe(
      map(result => !!result),
      take(1)
    ).subscribe((confirmed) => {
      if(confirmed) {
        this.store.dispatch(new CourseActions.DropCourse(course));
      }
    });
  }

  private enrollInSingleCourse(course: CourseViewData) {
    this.dialogService
      .open(EnrollSingleContentComponent, {
        data: {
          config: { width: 'auto', height: 'auto' },
          course: course
        }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private openCourse(courseIndex: number, course: CourseViewData) {
    // get the first uncompleted content
    const contentIndex = getContentIndexToResume(course);
    this.learningPathActions.openLearningPathFromOverviewAction(courseIndex, contentIndex);
    this.router.navigate(['/content/learning-path', this.content.id])
  }

  toggleCourse(scrollTargetEl: HTMLElement, extendedDetailsEl: HTMLElement, courseIndex: number): void {
    // expand course list if it is in tiny mode
    if (this.courseListCollapsed) {
      this.courseListCollapsed = false;
    }

    this.closeExpandedCourses(!this.expandedCourses[courseIndex] ? courseIndex : null);

    if (this.expandedCourses[courseIndex]) {
      // perform scroll to opened course after the transition has ended
      // implemented this way to avoid incorrect ending scroll position
      this.renderer.listen(extendedDetailsEl, 'transitionend', () => {
        this.updateCourseContainerScrollTop(scrollTargetEl.offsetTop);
        extendedDetailsEl.removeAllListeners('transitionend');
      })
    }
  }

  private updateCourseContainerScrollTop(value: number) {
    this.renderer.setProperty(this.courseContainer.nativeElement, 'scrollTop', value);
  }

  onTabChange(key, courseId) {
    this.activeCourseTabsMap[courseId] = key;
  }

  toggleCourseList(): void {
    // reset some stuff
    this.courseContainer.nativeElement.scrollTop = 0;
    this.closeExpandedCourses();

    this.courseListCollapsed = !this.courseListCollapsed;
  }

  dropdownMenuClick(shareIcon: HTMLElement) {
    this.showCourseContentDropdown = true;

    // set the top & left values for the dropdown menu to open
    // Note: this implementation only works while we have ONLY 1 course content dropdown menu open at a time
    const {top, left} = shareIcon.getBoundingClientRect();
    this.openCourseDropdownTopPos = top + 25;
    this.openCourseDropdownLeftPos = left - 230;
  }

  closeDropdownMenu() {
    this.showCourseContentDropdown = false;
  }

  onScroll() {
    this.closeDropdownMenu();
  }

  // do this so the absolutely positioned course content dropdown doesn't show up in weird spot after window resize
  @HostListener('window:resize')
  onResize() {
    this.closeDropdownMenu();
  }

  private closeExpandedCourses(courseIndex: number = null): void {
    this.expandedCourses$.next(this.expandedCourses.map((c, index) => courseIndex === index));
  }

  private evaluateBackActionAndSkipLoad(): boolean {
    const params = this.route.snapshot.queryParams;

    // back
    if (params?.['b']) {
      this.updateUrlAndResetStateAndNavBack();
      return true;
    }

    return false;
  }

  private updateUrlAndResetStateAndNavBack() {
    this.updateQueryParams('r');
    this.learningPathState.reset();
    this.location.back();
  }

  private updateUrlAndOpenCourse() {
    this.updateQueryParams('b');
    this.resume();
  }

  private updateQueryParams(arg: string) {
    // this changes query params to trigger logic in evaluate query params when user navs with browser back/fwd
    this.location.replaceState(`${this.router.url.substring(0, this.router.url.indexOf("?"))}?${arg}=true`);
  }
}
