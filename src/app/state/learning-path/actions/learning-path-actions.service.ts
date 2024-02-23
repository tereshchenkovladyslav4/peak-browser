import { Injectable } from '@angular/core';
import { EMPTY, Observable, mergeMap, of, take, concatMap } from 'rxjs';
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { ContentDetails, ContentType } from 'src/app/resources/models/content';
import { LayoutStateService } from '../../layout/layout-state.service';
import { LearningPathEffectsService } from '../effects/learning-path-effects.service';
import { LearningPathStateService, EnrollmentContentTracking, EnrollmentVideoTracking, EnrollmentQuizTracking } from '../learning-path-state.service';
import { QuizStatus } from 'src/app/resources/models/content/quiz';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";
import { CourseViewData, getContentIndexToResume } from 'src/app/modules/content/components/learning-path/models/course-view-data';
import { getCourseAssignmentStatusText } from 'src/app/resources/functions/content/course';
import { TranslationService } from 'src/app/services/translation.service';
import { Store } from '@ngxs/store';
import { Content } from '../../../resources/models/managed-content/content';

const ACTIVE_COURSE_KEY = 'activeCourseIndex';
const ACTIVE_CONTENT_KEY = 'activeContentIndex';

@Injectable({
  providedIn: 'root'
})
export class LearningPathActionsService {

  constructor(
    private learningPathState: LearningPathStateService,
    private learningPathEffects: LearningPathEffectsService,
    private sessionStorage: SessionStorageService,
    private layoutState: LayoutStateService,
    private translationService: TranslationService,
    private store: Store
  ) { 
    this.layoutState.selectIsFullScreen$.subscribe(isFullscreen => {
      // lp closed after leaving full screen
      if (!isFullscreen) {
        this.learningPathState.updateIsLearningPathOpen(false);
        this.learningPathState.updateActiveCourseContentDetails(null);
        this.learningPathState.updateIsCourseSummaryOpen(false);
      }
    })
  }

  reset() {
    this.sessionStorage.removeItem(ACTIVE_COURSE_KEY);
    this.sessionStorage.removeItem(ACTIVE_CONTENT_KEY);
    this.learningPathState.reset();
  }

  openLearningPathCoursesAction(learningPathId: string) {
    this.learningPathState.isLoading$.next(true);
    this.learningPathEffects
      .getLearningPathCourseEnrollmentsEffect(learningPathId)
      .pipe(
        take(1)
      )
      .subscribe(res => this.learningPathState.isLoading$.next(false))
  }

  openLearningPathFromOverviewAction(courseIndex: number, contentIndex: number) {
    // set index in storage when opening from overview as fallback from page load func
    const enrolledCourseIndex = this.convertCourseIndexToEnrolledCourseIndex(courseIndex);
    this.setActiveEnrolledCourseIndexInSession(enrolledCourseIndex);
    this.setActiveContentIndexInSession(contentIndex);
  }

  openLearningPathWorkflowAfterPageLoad() {
    const courseSessionIndexStr: string = this.sessionStorage.getItem(ACTIVE_COURSE_KEY);
    const contentSessionIndexStr: string = this.sessionStorage.getItem(ACTIVE_CONTENT_KEY);
    // if course or content index haven't been set, then just get the earliest non completed course and its earliest non completed content
    if (!!courseSessionIndexStr && !!contentSessionIndexStr) {
      this
      .openLearningPath(Number(courseSessionIndexStr), Number(contentSessionIndexStr))
      .subscribe(res => this.learningPathState.isLoading$.next(false));
    }
  }

  openLearningPathAfterPageLoad(learningPathId: string) {
    // call side effect & update state
    this.learningPathState.isLoading$.next(true);
    this.learningPathEffects.getLearningPathCourseEnrollmentsEffect(learningPathId).pipe(
      mergeMap(courses => {
        // get last piece of content and it's course's index from web storage
        const enrolledCourseSessionIndex = this.sessionStorage.getItem(ACTIVE_COURSE_KEY);
        const enrolledContentSessionIndex = this.sessionStorage.getItem(ACTIVE_CONTENT_KEY);
        //is all content within a course complete?
        if (Number(enrolledContentSessionIndex) === -1) {
          this.learningPathState.updateIsCourseSummaryOpen(true);          
        }
        //if both aren't null, then we should convert to a number. Otherwise, if we convert null to a number, it sets it to 0
        if (enrolledCourseSessionIndex && enrolledContentSessionIndex) {
          return this.openLearningPath(Number(enrolledCourseSessionIndex), Number(enrolledContentSessionIndex));
        } else {
          //Either get most recent non-completed content OR a quiz that has been taken and failed but has retakes
          const courseIndex = courses.findIndex(c => !!c?.enrollmentId && c.status !== AssignmentEnrollmentStatus.Completed);
          const contentIndex = getContentIndexToResume(courses[courseIndex]);

          // FALLBACK if course or content in session has been corrupted
          const enrolledCourseIndex = this.convertCourseIndexToEnrolledCourseIndex(courseIndex);
          return this.openLearningPath(enrolledCourseIndex, contentIndex);
        }
      }),
    ).subscribe(res => this.learningPathState.isLoading$.next(false))
  }

  openEnrolledCourseAction(courseIndex: number) {
    if (courseIndex === this.learningPathState.snapshot.activeEnrolledCourseIndex) return;
    this.updateActiveEnrolledCourseIndex(courseIndex);

    const course = this.learningPathState.enrolledCourses[courseIndex];
    const contentIndex = getContentIndexToResume(course);
    this.openNewCourseContent(contentIndex);

    if (contentIndex > -1) {
      this.learningPathState.updateIsCourseSummaryOpen(false);
      // call effect
      this.learningPathEffects
        .getEnrollmentContentItemEffect(courseIndex, contentIndex)
        .subscribe(res => this.learningPathState.isLoading$.next(false));
    } else if (contentIndex === -1) {
      this.learningPathState.updateIsCourseSummaryOpen(true);
    }
  }

  openCourseContentAction(contentIndex: number) {
    if (contentIndex === this.learningPathState.snapshot.activeContentIndex) return;
    // reset course summary open
    this.learningPathState.updateIsCourseSummaryOpen(false);

    this.openNewCourseContent(contentIndex);

    // call effect
    this.learningPathEffects
    .getEnrollmentContentItemEffect(this.learningPathState.snapshot.activeEnrolledCourseIndex, contentIndex)
    .pipe(
      take(1)
    )
    .subscribe(res => this.learningPathState.isLoading$.next(false));
  }

  goToNextCourseContent() {
    const { activeEnrolledCourseIndex, activeContentIndex } = this.learningPathState.snapshot;
    const { enrolledCourses, activeEnrolledCourse } = this.learningPathState;
    // if on course summary page, go to next course if there is one
    if (activeContentIndex === -1 && activeEnrolledCourseIndex < enrolledCourses?.length - 1) {
      this.goToCourse(activeEnrolledCourseIndex + 1);
    } else if (activeContentIndex < activeEnrolledCourse?.content?.length - 1) {
      this.openCourseContentAction(activeContentIndex + 1);
    } else if (activeContentIndex === activeEnrolledCourse?.content?.length - 1) {
      this.openCourseSummary();
    }
  }

  goToPreviousCourseContent() {
    const { activeContentIndex } = this.learningPathState.snapshot;
    const { activeEnrolledCourse } = this.learningPathState;
    if (activeContentIndex === -1) {
      const lastContentIndex = activeEnrolledCourse?.content?.length - 1;
      this.openCourseContentAction(lastContentIndex);
    }

    if (activeContentIndex > 0) {
      this.openCourseContentAction(activeContentIndex - 1);
    }
  }

  goToNextCourse() {
    const { activeEnrolledCourseIndex } = this.learningPathState.snapshot;
    const { enrolledCourses } = this.learningPathState;
    if (activeEnrolledCourseIndex >= 0 && activeEnrolledCourseIndex < enrolledCourses?.length) {
      // enrolled course index stays the same here because the index of the 'next' 
      // course (relative to the last course the user just finished) will have the
      // same index after the last course the user just finished is removed from list
      // of enrolled courses
      this.goToCourse(activeEnrolledCourseIndex);
    }
  }

  goToPreviousCourse() {
    const { activeEnrolledCourseIndex } = this.learningPathState.snapshot;
    if (activeEnrolledCourseIndex > 0) {
      this.goToCourse(activeEnrolledCourseIndex - 1);
    }
  }

  private goToCourse(courseIndex: number) {
    // close course summary
    this.learningPathState.updateIsCourseSummaryOpen(false);

    this.updateActiveEnrolledCourseIndex(courseIndex);
    const course = this.learningPathState.enrolledCourses[courseIndex];
    const contentIndex = getContentIndexToResume(course);

    this.updateActiveContentIndex(contentIndex);

    // call effect
    this.learningPathEffects
      .getEnrollmentContentItemEffect(courseIndex, contentIndex)
      .subscribe(res => this.learningPathState.isLoading$.next(false));
  }

  updateVideoTrackingAction(tracking: EnrollmentVideoTracking) {
    // update this videos course/content progress when required vid watch length is set so ui progress bar is updated accordingly
    if (tracking.isRequiredToWatchVideo && tracking.videoLength > 0 && tracking.canUpdateProgress) {
      const { activeEnrolledCourseContent } = this.learningPathState;
      this.updateCourseContentDetails(this.learningPathState.activeEnrolledCourse?.courseId, {
        ...activeEnrolledCourseContent,
        progress: tracking.watchedPercentage,
        status: tracking.isComplete ? AssignmentEnrollmentStatus.Completed : activeEnrolledCourseContent?.status,
        quizData: {
          ...activeEnrolledCourseContent.quizData,
          status: QuizStatus.None 
        }
      });
    }
  }

  /**
   * update permanently tracked quiz data when an answer is submitted
   * @param quizSession 
   */
  submitQuizAnswer() {
    const { activeEnrolledCourseContent } = this.learningPathState;
    const { totalQuestionsComplete, totalQuizQuestions } = activeEnrolledCourseContent.quizData.progress;
    //when on last question and submitted quiz, numerator (questions answered) isn't greater than denominator (questions amt in quiz)
    const onFinalQuestion = totalQuestionsComplete === totalQuizQuestions - 1;
    this.updateCourseContentDetails(this.learningPathState.activeEnrolledCourse?.courseId, {
      ...activeEnrolledCourseContent,
      quizData: {
        ...activeEnrolledCourseContent.quizData,
        progress: {
          ...activeEnrolledCourseContent.quizData.progress,
          totalQuestionsComplete: activeEnrolledCourseContent?.quizData.progress?.totalQuestionsComplete + (onFinalQuestion ? 0 : 1)
        }
      }
    })
  }

  openCourseSummary() {
    // reset some state
    this.changeActiveContentIndex(-1);
    this.learningPathState.updateActiveCourseContentDetails(null);

    this.learningPathState.updateIsCourseSummaryOpen(true);
  }

  completeCourse(enrollId: string): Observable<any> {
    this.learningPathState.updateIsCourseSummaryOpen(false);
    return this.learningPathEffects.markCourseAsComplete(enrollId);
  }

  /**
   * @deprecated since transition to ngxs started. will be removed after ngxs is fully implemented for LP state
   */
  dropCourse(enrollId: string): Observable<any> {
    this.learningPathState.updateIsCourseSummaryOpen(false);
    return this.learningPathEffects.dropSingleCourseEnrollment(enrollId);
  }

  retakeEarliestRequiredQuiz() {
    const { activeEnrolledCourse } = this.learningPathState;
    const { activeEnrolledCourseIndex } = this.learningPathState.snapshot;
    let quizIndex = activeEnrolledCourse.content?.findIndex(c => c?.quizData?.settings?.requirePassingScore
      && c?.quizData?.status === QuizStatus.Fail
      && c?.quizData?.totalAttempts < activeEnrolledCourse?.settings?.maxQuizAttempts)
    if (quizIndex === -1) {
      quizIndex = activeEnrolledCourse.content?.findIndex(c => c?.quizData?.settings?.requirePassingScore
        && c?.quizData?.status !== QuizStatus.Pass
        && c?.quizData?.totalAttempts < activeEnrolledCourse?.settings?.maxQuizAttempts);
    }
    if (quizIndex > 0 && quizIndex < activeEnrolledCourse?.content?.length) {
      this.learningPathState.updateIsCourseSummaryOpen(false);

      this.updateActiveContentIndex(quizIndex);

      // call effect
      this.learningPathEffects
        .getEnrollmentContentItemEffect(activeEnrolledCourseIndex, quizIndex, true)
        .subscribe(res => this.learningPathState.isLoading$.next(false));
    }
  }

  courseAssigned(course: CourseViewData) {
    const newStatus = AssignmentEnrollmentStatus.Not_Started;
    const translationTextKey = getCourseAssignmentStatusText(newStatus);
    this.updateCourse({
      ...course,
      status: newStatus,
      actionBtnText: this.translationService.getTranslationFileData(translationTextKey)
    })
  }

  // HELPERS

  private convertCourseIndexToEnrolledCourseIndex(courseIndex: number) {
    const courseId = this.learningPathState.snapshot.courses[courseIndex]?.courseId;
    return this.learningPathState.enrolledCourses.findIndex(ec => ec.courseId === courseId);
  }

  private openLearningPath(enrolledCourseIndex: number, contentIndex: number): Observable<ContentDetails> {
    //ngxs way
    //this.store.dispatch([
    //  new LearningPathActions.UpdateActiveEnrolledCourseIndex(enrolledCourseIndex),
    //  new LearningPathActions.UpdateActiveContentIndex(contentIndex),
    //  new LearningPathActions.ToggleLearningPathOpenStatus(true)
    //])

    //Old way of updating course index, content, and is LP open. REMOVE LATER
    this.learningPathState.updateActiveEnrolledCourseIndex(enrolledCourseIndex);
    this.learningPathState.updateActiveContentIndex(contentIndex);
    this.learningPathState.updateIsLearningPathOpen(true);

    // call side effect & update state
    return this.learningPathEffects.getEnrollmentContentItemEffect(enrolledCourseIndex, contentIndex);
  }

  private openNewCourseContent(contentIndex: number) {
    this.changeActiveContentIndex(contentIndex);
  }

  private changeActiveContentIndex(contentIndex: number) {
    this.updateActiveContentIndex(contentIndex);

    // update previous course content progress so completion status shows properly
    this.applyCachedContentToCourse();
  }

  private getActiveEnrolledCourseIndexFromSession(): number {
    return this.sessionStorage.getItem<number>(ACTIVE_COURSE_KEY);
  }

  private setActiveEnrolledCourseIndexInSession(enrolledCourseIndex: number) {
    this.sessionStorage.setItem(ACTIVE_COURSE_KEY, enrolledCourseIndex.toString());
  }

  /**
   * update index in state and session storage. index stored in storage so user is put onto their last
   * piece of content they had opened prior to page reload or leaving & returning to LP
   */
  private updateActiveEnrolledCourseIndex(enrolledCourseIndex: number) {
    this.setActiveEnrolledCourseIndexInSession(enrolledCourseIndex);

    this.learningPathState.updateActiveEnrolledCourseIndex(enrolledCourseIndex);
  }

  private getActiveContentIndexFromSession(): number {
    return this.sessionStorage.getItem<number>(ACTIVE_CONTENT_KEY);
  }

  private setActiveContentIndexInSession(contentIndex: number) {
    this.sessionStorage.setItem(ACTIVE_CONTENT_KEY, contentIndex.toString());
  }

  /**
   * update index in state and session storage. index stored in storage so user is put onto their last
   * piece of content they had opened prior to page reload or leaving & returning to LP
   */
  private updateActiveContentIndex(contentIndex: number) {
    this.setActiveContentIndexInSession(contentIndex);

    this.learningPathState.updateActiveContentIndex(contentIndex);
  }

  postEnrollmentContentTracking(documentTracking: EnrollmentContentTracking) {
    this.learningPathEffects.postEnrollmentContentTracking(documentTracking);
    this.applyCachedContentToCourse();
  }

  postEnrollmentQuizTracking(quizTracking: EnrollmentQuizTracking) {
    this.learningPathEffects.postEnrollmentQuizTracking(quizTracking);
    this.applyCachedContentToCourse();
  }

  postEnrollmentVideoTracking(videoTracking: EnrollmentVideoTracking) {
    // Do not post tracking if we have no video info:
    if (videoTracking.videoLength === 0) {
      return;
    }

    this.learningPathEffects.postEnrollmentVideoTracking(videoTracking);
    this.applyCachedContentToCourse();
  }

  private applyCachedContentToCourse() {
    const {cachedContent } = this.learningPathState;
    if (!cachedContent?.courseId || !cachedContent?.completedContent?.contentId) return;

    const { contentId, progress, assignmentStatus, quizStatus } = cachedContent?.completedContent;
    const courseContentToChange = this.learningPathState.activeEnrolledCourse.content?.find(c => c.contentId === contentId);
    this.updateCourseContentDetails(cachedContent.courseId, {
      ...courseContentToChange,
      progress: progress,
      status: assignmentStatus,
      quizData: {
        ...courseContentToChange?.quizData,
        status: quizStatus
      }
    });

    // reset cache
    this.learningPathState.updateCachedContentToMarkComplete(null);
  }

  /**
   * update a single course in state
   * @param mutatedCourse modified course obj
   */
  private updateCourse(mutatedCourse: CourseViewData) {
    const updatedCourses = this.learningPathState.snapshot.courses.map(course => course?.courseId === mutatedCourse.courseId ? mutatedCourse : course);
    this.learningPathState.updateCourses(updatedCourses);
  }

  /**
   * update a single piece of content within a course in state
   * @param courseId id of the course
   * @param mutatedContent modified course obj
   */
  private updateCourseContentDetails(courseId: string, mutatedContent: CourseViewContent) {
    const updatedCourses = this.learningPathState.snapshot.courses.map(course => {
      if (course?.courseId === courseId) {
        return {
          ...course,
          content: course?.content?.map(courseContent => 
            courseContent?.contentId === mutatedContent?.contentId ? mutatedContent : courseContent)
        }
      } else {
        return course;
      }
    });

    this.learningPathState.updateCourses(updatedCourses);
  }
}
