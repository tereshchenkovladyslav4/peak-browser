import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, combineLatest, map, startWith, takeUntil, tap } from 'rxjs';
import { FinishCourseState, LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { QuizActionsService } from 'src/app/state/quiz/actions/quiz-actions.service';
import { QuizStateService } from 'src/app/state/quiz/quiz-state.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { QuizStatus } from 'src/app/resources/models/content/quiz';
import { ButtonOptions, DropCourseBtn, FinishCourseBtn, NextBtn, PreviousBtn, TakeQuizBtn, RetakeQuizBtn } from 'src/app/resources/models/button/button';



@Component({
  selector: 'ep-course-nav-buttons',
  templateUrl: './course-nav-buttons.component.html',
  styleUrls: ['./course-nav-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseNavButtonsComponent implements OnInit, OnDestroy {
  buttons$: Observable<ButtonOptions[]>;

  buttonMap: { [key: string]: Function };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private learningPathState: LearningPathStateService,
    private learningPathActions: LearningPathActionsService,
    private quizState: QuizStateService,
    private quizActions: QuizActionsService
  ) {

  }

  ngOnInit(): void {
    this.setButtons();
    this.setButtonMap();
  }

  @HostListener('window:beforeunload', ['$event']) // Ensure this runs in all situations: https://wesleygrimes.com/angular/2019/03/29/making-upgrades-to-angular-ngondestroy
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setButtonMap() {
    this.buttonMap = {
      [PreviousBtn.label]: () => this.learningPathActions.goToPreviousCourseContent(),
      [NextBtn.label]: () => this.handleNextBtnClick(),
      [RetakeQuizBtn.label]: () => this.handleRetakeQuizBtnClick(),
      [TakeQuizBtn.label]: () => this.handleRetakeQuizBtnClick(),
      [FinishCourseBtn.label]: () => this.handleFinishCourseBtnClick(),
      [DropCourseBtn.label]: () => this.handleDropCourseBtnClick()
    };
  }

  private setButtons() {
    this.buttons$ = combineLatest([
      this.learningPathState.isLoading$,
      this.learningPathState.enrolledCourses$,
      this.learningPathState.activeEnrolledCourseIndex$,
      this.learningPathState.activeContentIndex$,
      this.learningPathState.isCourseSummaryOpen$,
      this.learningPathState.finishCourseState$,
      this.learningPathState.activeEnrolledCourse$,
      this.learningPathState.cachedContentToMarkComplete$.pipe(
        map(cachedContent => !cachedContent || !cachedContent?.completedContent || !cachedContent?.completedContent?.assignmentStatus 
          ? AssignmentEnrollmentStatus.Not_Started 
          : cachedContent.completedContent.assignmentStatus)
      ),
      this.learningPathState.activeEnrolledCourseContent$.pipe(startWith(null)),
      this.quizState.isQuizOpen$,
      this.quizState.isQuizFinished$,
    ])
    .pipe(
      map(([
        isLoading,
        enrolledCourses,
        activeEnrolledCourseIndex,
        contentIndex,
        isCourseSummaryOpen, 
        finishCourseState,
        activeEnrolledCourse,
        cachedContentAssignmentEnrollmentStatus,
        activeEnrolledCourseContent,
        isQuizOpen,
        isQuizFinished
      ]) => {
        if (isLoading) {
          PreviousBtn.disabled = true;
          NextBtn.disabled = true;
          return [PreviousBtn, NextBtn];
        }

        // LOCAL SCOPE
        PreviousBtn.disabled = contentIndex === 0;
        const mustViewContentInOrderAndContentNotComplete = activeEnrolledCourse?.settings?.mustViewContentInOrder 
          && cachedContentAssignmentEnrollmentStatus !== AssignmentEnrollmentStatus.Completed
          && activeEnrolledCourseContent !== null
          && activeEnrolledCourseContent?.status !== AssignmentEnrollmentStatus.Completed;
        const noSubsequentEnrolledCoursesAndAtEndOfLastEnrolledCourse = activeEnrolledCourseIndex === enrolledCourses?.length - 1
          && contentIndex === -1

        NextBtn.disabled = mustViewContentInOrderAndContentNotComplete || noSubsequentEnrolledCoursesAndAtEndOfLastEnrolledCourse;

        // QUIZ LOGIC
        if (isQuizOpen) {
          const { quiz, quizSession } = this.quizState.snapshot;
          if (isQuizFinished) {
            const { mustViewContentInOrder, mustPassQuiz } = activeEnrolledCourse.settings;
            const { canQuizBeRetaken } = this.quizState;

            const failedMustPassCourseQuizInOrder = mustViewContentInOrder 
              && mustPassQuiz 
              && quiz?.requirePassingScore
              && quizSession?.quizStatus !== QuizStatus.Pass;

            if (canQuizBeRetaken) {
              NextBtn.disabled = failedMustPassCourseQuizInOrder;
              return [PreviousBtn, NextBtn, RetakeQuizBtn];
            } 
            
            if (failedMustPassCourseQuizInOrder) {
              return [PreviousBtn, DropCourseBtn];
            }
          } else {
            return [];
          }
        }

        // COURSE SUMMARY LOGIC
        if (isCourseSummaryOpen) {
          if (finishCourseState === FinishCourseState.Completed) {
            return [PreviousBtn, NextBtn, FinishCourseBtn];
          } else if (finishCourseState === FinishCourseState.PartiallyCompleted) {
            return [PreviousBtn, NextBtn, FinishCourseBtn];
          } else if (finishCourseState === FinishCourseState.HasToDrop) {
            return [PreviousBtn, NextBtn, DropCourseBtn];
          } else if (finishCourseState === FinishCourseState.UnfinishedQuizzes) {
            return [PreviousBtn, NextBtn, TakeQuizBtn];
          } 
        }

        // DEFAULTS
        return [PreviousBtn, NextBtn];
      })
    )
  }

  onButtonClick(buttonOptions: ButtonOptions) {
    const key = buttonOptions?.label;
    if (key === null || key === undefined) return;

    this.buttonMap[key]();
  }

  private handleNextBtnClick() {
    this.learningPathActions.goToNextCourseContent();
  }

  private handleRetakeQuizBtnClick() {
    if (!this.learningPathState.snapshot.isCourseSummaryOpen) {
      this.quizActions.retakeQuiz()
    } else {
      
      this.learningPathActions.retakeEarliestRequiredQuiz()
    }
  }

  private handleFinishCourseBtnClick() {
    if (!this.learningPathState.snapshot.isCourseSummaryOpen) {
      this.learningPathActions.openCourseSummary();
    } else {
      this.learningPathActions
        .completeCourse(this.learningPathState.activeEnrolledCourse?.enrollmentId)
        .pipe(
          tap(_ => this.navigateToCourse()),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(); // http + take(1) in stream so no need to handle subscription manually
    }
  }

  private handleDropCourseBtnClick() {
    this.learningPathActions
    .dropCourse(this.learningPathState.activeEnrolledCourse?.enrollmentId)
    .pipe(
      tap(_ => this.navigateToCourse()),
      takeUntil(this.unsubscribe$)
    )
    .subscribe(); // http + take(1) in stream so no need to handle subscription manually
  }

  private navigateToCourse() {
    const { activeEnrolledCourseIndex } = this.learningPathState.snapshot;
    // compare to length as opposed to length - 1 because the enrolled courses list is -1 
    // due to the recently completed/dropped course being removed from the list
    if (activeEnrolledCourseIndex === this.learningPathState.enrolledCourses?.length) {
      this.learningPathActions.goToPreviousCourse();
    } else {
      this.learningPathActions.goToNextCourse();
    }
  }
}
