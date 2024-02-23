import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CourseViewData } from "../../models/course-view-data";
import { Observable, Subject, combineLatest, filter, map, mergeMap, takeUntil, first } from 'rxjs';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { ContentViewerComponent } from 'src/app/components/dialog/content-viewer/content-viewer.component';
import { WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { BreakpointObserver } from '@angular/cdk/layout'
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { ContentType } from 'src/app/resources/models/content';
import { QuizStatus } from 'src/app/resources/models/content/quiz';
import { QuizStateService } from '../../../../../../state/quiz/quiz-state.service';

@Component({
  selector: 'ep-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursesListComponent implements OnInit, OnDestroy {
  @ViewChild("courseContainer") courseContainerElement: ElementRef<HTMLDivElement>;
  @ViewChildren("course") courseElements: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren("courseContentContainer") courseContentContainers: QueryList<ElementRef<HTMLDivElement>>;

  enrolledCourses$: Observable<CourseViewData[]>;
  activeCourseIndex$: Observable<number>;
  activeContentIndex$: Observable<number>;
  activeCourseName$: Observable<string>;
  activeCourseProgress$: Observable<number>;
  isCourseExpanded$: Observable<boolean>;
  activeCourseDisabledContent$: Observable<boolean[]>;
  responsiveMode$: Observable<boolean>;
  isFullScreen$: Observable<boolean>;
  isCourseSummaryOpen$: Observable<boolean>;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private learningPathState: LearningPathStateService,
    private learningPathActions: LearningPathActionsService,
    private dialogService: DialogService,
    private workflowState: WorkflowStateService,
    private responsive: BreakpointObserver,
    private layoutState: LayoutStateService,
    private quizState: QuizStateService
  ) {

  }

  ngOnInit(): void {
    this.setCourses();
    this.setActiveCourseIndex();
    this.setIsCourseExpanded();
    this.setDisabledCourseContent();
    this.setActiveContentIndex();
    this.setProgress();
    this.listenForOpenContentViewer();
    this.setActiveCourseName();
    this.manageLayout();
    this.setIsCourseSummaryOpen();
    this.setBreakpointObserver();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setCourses(): void {
    this.enrolledCourses$ = this.learningPathState.enrolledCourses$;
  }

  private setActiveCourseIndex() {
    this.activeCourseIndex$ = this.learningPathState.activeEnrolledCourseIndex$;
  }

  private setIsCourseExpanded() {
    this.isCourseExpanded$ = this.learningPathState.activeEnrolledCourseIndex$
    .pipe(
      map(courseIndex => courseIndex > -1)
    )
  }

  private setActiveContentIndex() {
    this.activeContentIndex$ = this.learningPathState.activeContentIndex$;
  }

  private setDisabledCourseContent() {
    this.activeCourseDisabledContent$ = combineLatest([
      this.learningPathState.enrolledCourses$,
      this.learningPathState.activeEnrolledCourseIndex$,
      this.learningPathState.activeContentIndex$
    ]).pipe(
      map(([enrolledCourses, activeEnrolledCourseIndex, activeContentIndex]) => {
        if (!enrolledCourses?.length) return [];

        return enrolledCourses[activeEnrolledCourseIndex]?.content.map((courseContent, index, arr) => {
          // logic is split into multiple if statements for improved readability
          // instantly return false for each piece of content if Sequential View Mode is not set for the course
          const { settings } = enrolledCourses[activeEnrolledCourseIndex];
          if (!settings?.mustViewContentInOrder) return false;

          // always allow first content to be enabled
          if (index === 0) return false;

          if (courseContent?.status === AssignmentEnrollmentStatus.Completed) return false;

          const previousContent = arr[index - 1];
          // disable content if last piece of content was a PASS/FAIL quiz, Course Sequential View Mode is enabled, & Course Must Pass Quiz is enabled
          if (previousContent?.contentType === ContentType.Quiz 
            && previousContent?.quizData?.settings?.requirePassingScore
            && settings?.mustPassQuiz
            && previousContent?.quizData?.status !== QuizStatus.Pass) return true;

          // don't want to disable this piece of content if it is completed OR the previous piece of content is completed
          if (previousContent?.status === AssignmentEnrollmentStatus.Completed) return false;

          // default to true as we can be more restrictive knowing we are in Course Sequential View Mode
          return true;
        })
      })
    )
  }

  private setProgress() {
    this.activeCourseProgress$ = this.learningPathState.activeCourseProgress$;
  }

  private listenForOpenContentViewer() {
    this.workflowState.contentViewer$.pipe(
      filter(contentViewerData => !!contentViewerData?.contentId),
      mergeMap(({ dialogConfig, contentId, contentType }) => {
        return this.dialogService.open(ContentViewerComponent, {
            data: {
              config: {
                ...dialogConfig,
                contentViewer: {
                  contentId: contentId,
                  contentType: contentType
                }
              }
            }
          }
        )
        .afterClosed()
        .pipe(
          takeUntil(this.unsubscribe$)
        );
      }),
      takeUntil(this.unsubscribe$)
    )
    .subscribe()
  }

  private setActiveCourseName() {
    this.activeCourseName$ = combineLatest([
      this.learningPathState.enrolledCourses$,
      this.learningPathState.activeEnrolledCourseIndex$
    ]).pipe(
      filter(([enrolledCourses, activeEnrolledCourseIndex]) => enrolledCourses?.length && activeEnrolledCourseIndex >= 0),
      map(([enrolledCourses, activeEnrolledCourseIndex]) => enrolledCourses[activeEnrolledCourseIndex]?.name)
    );
  }

  private setBreakpointObserver() {
    const key = '(max-width: 1400px)';
    this.responsiveMode$ = this.responsive
      .observe([key])
      .pipe(
        map(breakpointState => !!breakpointState?.breakpoints[key])
      )
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private setIsCourseSummaryOpen() {
    this.isCourseSummaryOpen$ = this.learningPathState.isCourseSummaryOpen$;
  }

  toggleCourse(courseIndex: number) {
    if (this.learningPathState.snapshot.activeEnrolledCourseIndex !== courseIndex) {
      this.learningPathActions.openEnrolledCourseAction(courseIndex);
    }
  }

  openCourseDescModal(data: { event: MouseEvent, course: CourseViewData }) {
    data.event?.stopPropagation(); // prevent course dropdown from expanding/collapsing
    this.workflowState.openContentViewer('Course', data.course?.courseId);
  }

  openCourseContent(contentIndex: number) {
    this.learningPathActions.openCourseContentAction(contentIndex);
  }

  openFinishCourse() {
    this.learningPathActions.openCourseSummary();
    // Should reset quiz if it's open when clicking "Finish Course"
    this.quizState.isQuizOpen$.pipe(first(), takeUntil(this.unsubscribe$)).subscribe((isQuizOpen) => {
      if (isQuizOpen) {
        this.quizState.reset();
      }
    });
  }
}
