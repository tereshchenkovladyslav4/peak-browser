import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, filter, map } from 'rxjs';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";
import { CourseViewData, hasFailedAnyQuiz, hasRequiredQuizAttemptsRemaining, hasToDropCourse } from "src/app/modules/content/components/learning-path/models/course-view-data";
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { ContentDetails } from 'src/app/resources/models/content';
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';
import { QuizStatus } from 'src/app/resources/models/content/quiz';

export enum FinishCourseState {
  Completed = "Completed",
  PartiallyCompleted = "Partially Completed",
  UnfinishedQuizzes = "Unfinished Quizzes",
  HasToDrop = "Has to Drop",
  Error = "Error"
}

export interface CachedContent {
  completedContent: {
    contentId: string,
    progress: number,
    assignmentStatus: AssignmentEnrollmentStatus,
    quizStatus: QuizStatus
  },
  courseId: string
}

interface CourseContentTracking {
  startTime: Date;
  isComplete: boolean;
  // VIDEO
  hasPlayedVideo: boolean;
  isExternalVideo: boolean;
  videoLength: number; // seconds
  lastVideoPosition: number; // seconds
}

interface LearningPathState {
  learningPathId: string;
  isLearningPathOpen: boolean;
  courses: CourseViewData[];
  activeEnrolledCourseIndex: number;
  activeContentIndex: number;
  activeCourseContentDetails: ContentDetails;
  courseContentTracking: CourseContentTracking;
  cachedContentToMarkComplete: CachedContent; // cached content progress data that will be applied to the relevant content obj in state after user navigates away from the related piece of content
  isCourseSummaryOpen: boolean;
}

export const DEFAULT_COURSE_CONTENT_TRACKING: CourseContentTracking = {
  startTime: new Date(),
  isComplete: false,
  hasPlayedVideo: false,
  isExternalVideo: false,
  videoLength: 0,
  lastVideoPosition: 0
};

const DEFAULT_STATE: LearningPathState = {
  learningPathId: null,
  isLearningPathOpen: false,
  courses: null,
  activeEnrolledCourseIndex: -1,
  activeContentIndex: -1,
  activeCourseContentDetails: null,
  courseContentTracking: DEFAULT_COURSE_CONTENT_TRACKING,
  cachedContentToMarkComplete: null,
  isCourseSummaryOpen: false
}

@Injectable({
  providedIn: 'root'
})
export class LearningPathStateService {

  private state$ = new BehaviorSubject<LearningPathState>(DEFAULT_STATE);

  // state selectors
  isLearningPathOpen$: Observable<boolean> = selectFrom(this.state$, nameof<LearningPathState>('isLearningPathOpen'));
  activeEnrolledCourseIndex$: Observable<number> = selectFrom(this.state$, nameof<LearningPathState>('activeEnrolledCourseIndex'));
  activeContentIndex$: Observable<number> = selectFrom(this.state$, nameof<LearningPathState>('activeContentIndex'));
  courses$: Observable<CourseViewData[]> = selectFrom(this.state$, nameof<LearningPathState>('courses'));
  activeCourseContentDetails$: Observable<ContentDetails> = selectFrom(this.state$, nameof<LearningPathState>('activeCourseContentDetails'));
  courseContentTracking$: Observable<CourseContentTracking> = selectFrom(this.state$, nameof<LearningPathState>('courseContentTracking'));
  cachedContentToMarkComplete$: Observable<CachedContent> = selectFrom(this.state$, nameof<LearningPathState>('cachedContentToMarkComplete'));
  isCourseSummaryOpen$: Observable<boolean> = selectFrom(this.state$, nameof<LearningPathState>('isCourseSummaryOpen'));

  // custom selectors
  enrolledCourses$: Observable<CourseViewData[]> = this.courses$.pipe(
    map(courses => courses?.filter(c => c?.status === AssignmentEnrollmentStatus.Not_Started || c?.status === AssignmentEnrollmentStatus.In_Progress)
  ));

  activeEnrolledCourse$: Observable<CourseViewData> = combineLatest([
    this.enrolledCourses$,
    this.activeEnrolledCourseIndex$
  ]).pipe(
    filter(([enrolledCourses, activeEnrolledCourseIndex]) => !!enrolledCourses && activeEnrolledCourseIndex >= 0),
    map(([enrolledCourses, activeEnrolledCourseIndex]) => enrolledCourses[activeEnrolledCourseIndex])
  )

  activeEnrolledCourseContent$: Observable<CourseViewContent> = combineLatest([
    this.activeEnrolledCourse$,
    this.activeContentIndex$
  ]).pipe(
    filter(([activeEnrolledCourse, activeContentIndex]) => activeEnrolledCourse?.content?.length && activeContentIndex >= 0),
    map(([activeEnrolledCourse, activeContentIndex]) => activeEnrolledCourse?.content[activeContentIndex])
  )

  activeCourseProgress$ = combineLatest([
    this.enrolledCourses$,
    this.activeEnrolledCourseIndex$
  ]).pipe(
    filter(([enrolledCourses, activeEnrolledCourseIndex]) => enrolledCourses?.length > 0 && activeEnrolledCourseIndex > -1),
    map(([enrolledCourses, activeEnrolledCourseIndex]) => {
      let totalItems = 0;
      let totalCompletedItems = 0;
      if (activeEnrolledCourseIndex < enrolledCourses?.length) {
        const course = enrolledCourses[activeEnrolledCourseIndex];
        for (let j = 0; j < course?.content?.length; j++) {
          const content = course?.content[j];
          if (content?.status === AssignmentEnrollmentStatus.Completed) {
            totalCompletedItems++;
          }

          totalItems++;
        }
      }

      const percentComplete = totalItems > 0 ? totalCompletedItems / totalItems * 100 : 0;
      return Math.floor(percentComplete);
    })
  )

  finishCourseState$ = this.activeCourseProgress$.pipe(
    map(activeCourseProgress => {
      if (activeCourseProgress === null || activeCourseProgress === undefined) return FinishCourseState.Error;

      if (hasToDropCourse(this.activeEnrolledCourse)) {
        return FinishCourseState.HasToDrop;
      }

      if (hasRequiredQuizAttemptsRemaining(this.activeEnrolledCourse)) {
        return FinishCourseState.UnfinishedQuizzes;
      }
      
      if (activeCourseProgress < 100 || hasFailedAnyQuiz(this.activeEnrolledCourse)) {
        return FinishCourseState.PartiallyCompleted
      }

      return FinishCourseState.Completed;
    })
  )

  isLoading$ = new BehaviorSubject<boolean>(false);

  reset() {
    this.state$.next(DEFAULT_STATE);
  }

  // SNAPSHOT
  get snapshot(): LearningPathState {
    return this.state$.getValue();
  }

  get enrolledCourses(): CourseViewData[] {
    return this.snapshot.courses?.filter(c => c?.status === AssignmentEnrollmentStatus.Not_Started || c?.status === AssignmentEnrollmentStatus.In_Progress);
  }

  get activeEnrolledCourse(): CourseViewData {
    if (!this.enrolledCourses?.length) return undefined;
    return this.enrolledCourses[this.snapshot?.activeEnrolledCourseIndex];
  }

  get activeEnrolledCourseContent(): CourseViewContent {
    return this.activeEnrolledCourse?.content[this.snapshot?.activeContentIndex];
  }

  get isActiveEnrolledCourseComplete(): boolean {
    return this.activeEnrolledCourse?.content?.every(c => c.status === AssignmentEnrollmentStatus.Completed);
  }

  get cachedContent(): CachedContent {
    return this.snapshot.cachedContentToMarkComplete;
  }

  // STATE FUNCS
  updateLearningPathId(learningPathId: string) {
    this.state$.next({
      ...this.snapshot,
      learningPathId: learningPathId
    })
  }

  updateIsLearningPathOpen(isLearningPathOpen: boolean) {
    this.state$.next({
      ...this.snapshot,
      isLearningPathOpen: isLearningPathOpen
    })
  }

  updateCourses(courses: CourseViewData[]) {
    this.state$.next({
      ...this.snapshot,
      courses: courses
    })
  }

  updateActiveEnrolledCourseIndex(courseIndex: number) {
    this.state$.next({
      ...this.snapshot,
      activeEnrolledCourseIndex: courseIndex
    })
  }

  updateActiveContentIndex(contentIndex: number) {
    this.state$.next({
      ...this.snapshot,
      activeContentIndex: contentIndex
    })
  }

  updateActiveCourseContentDetails(contentDetails: ContentDetails) {
    this.state$.next({
      ...this.snapshot,
      activeCourseContentDetails: contentDetails
    })
  }

  updateCourseContentTracking(courseContentTracking: CourseContentTracking) {
    this.state$.next({
      ...this.snapshot,
      courseContentTracking: courseContentTracking
    })
  }

  updateCachedContentToMarkComplete(cachedContentToMarkComplete: CachedContent) {
    this.state$.next({
      ...this.snapshot,
      cachedContentToMarkComplete: cachedContentToMarkComplete
    })
  }

  updateIsCourseSummaryOpen(isCourseSummaryOpen: boolean) {
    this.state$.next({
      ...this.snapshot,
      isCourseSummaryOpen: isCourseSummaryOpen
    })
  }
}
