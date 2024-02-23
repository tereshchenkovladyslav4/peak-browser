import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, filter, map } from 'rxjs';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";
import { CourseViewData, hasFailedAnyQuiz, hasRequiredQuizAttemptsRemaining, hasToDropCourse } from "src/app/modules/content/components/learning-path/models/course-view-data";
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { ContentDetails, ContentType } from 'src/app/resources/models/content';
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';
import { QuizSession, QuizStatus } from 'src/app/resources/models/content/quiz';
import { Content } from '../../services/apiService/classFiles/class.content';
import { getLocaleDateTimeFormat } from '@angular/common';
import { Enrollment } from '../../services/apiService/classFiles/class.enrollments';
import { NumericLiteral } from 'typescript';

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

interface LearningPathState {
  learningPathId: string;
  isLearningPathOpen: boolean;
  courses: CourseViewData[];
  activeEnrolledCourseIndex: number;
  activeContentIndex: number;
  activeCourseContentDetails: ContentDetails;
  cachedContentToMarkComplete: CachedContent; // cached content progress data that will be applied to the relevant content obj in state after user navigates away from the related piece of content
  isCourseSummaryOpen: boolean;
}


export class DEFAULT_STATE implements LearningPathState {
  learningPathId: null;
  isLearningPathOpen: false;
  courses: null;
  activeEnrolledCourseIndex: -1;
  activeContentIndex: -1;
  activeCourseContentDetails: null;
  cachedContentToMarkComplete: null;
  isCourseSummaryOpen: false
}

export class EnrollmentContentTracking {
  contentId: string;
  contentType: ContentType;
  courseId: string;
  enrollmentId: string;
  startTime: Date;
  endTime: Date;
  isComplete: boolean;

  constructor(contentId: string, contentType: ContentType, courseId: string, enrollmentId: string) {
    this.contentId = contentId;
    this.courseId = courseId;
    this.contentType = contentType;
    this.enrollmentId = enrollmentId;
    this.isComplete = false;
    this.startTime = new Date();
  }
}

export class EnrollmentQuizTracking extends EnrollmentContentTracking {
  quizSessionItem: QuizSession;

  constructor(contentId: string, courseId: string, enrollmentId: string, quizSessionItem: QuizSession) {
    super(contentId, ContentType.Quiz, courseId, enrollmentId);

    this.quizSessionItem = quizSessionItem;
  }
}

export class EnrollmentVideoTracking extends EnrollmentContentTracking {
  canUpdateProgress: boolean;
  isExternalVideo: boolean;
  overrideRequiredToWatchPercentage: boolean;
  requiredToWatchPercentage: number;
  watchedPercentage: number;
  videoLength: number;

  private _lastVideoPosition: number;

  constructor(contentId: string, courseId: string, enrollmentId: string,
    isExternalVideo: boolean, overrideRequiredToWatchPercentage: boolean,
    requiredToWatchPercentage: number, videoLength: number) {

    super(contentId, ContentType.Video, courseId, enrollmentId);

    this.contentType = ContentType.Video;
    this.isExternalVideo = isExternalVideo;
    this.overrideRequiredToWatchPercentage = overrideRequiredToWatchPercentage;
    this.requiredToWatchPercentage = requiredToWatchPercentage;
    this.videoLength = Math.floor(videoLength); // remove decimals (ms) from value (180.34 (180s 340ms) => 180 (180s 0ms))
  }

  get isRequiredToWatchVideo(): boolean {
    return this.overrideRequiredToWatchPercentage && this.requiredToWatchPercentage > 0;
  }

  get lastVideoPosition(): number {
    return this._lastVideoPosition;
  }

  updateLastVideoPosition(newPosition: number, courseProgress: number) {
    this._lastVideoPosition = Math.floor(newPosition); // remove decimals (MS) from value (180.34 (180s 340ms) => 180 (180s 0ms));

    this.canUpdateProgress = false; // only want to update progress if watch % is greater than current progress val
    if (this.isRequiredToWatchVideo && this.videoLength > 0) {
      this.watchedPercentage = this._lastVideoPosition / this.videoLength * 100;
      this.canUpdateProgress = this.watchedPercentage > courseProgress

      if (this.watchedPercentage >= this.requiredToWatchPercentage && !this.isComplete) {
        this.isComplete = true;
      }
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class LearningPathStateService {

  private state$ = new BehaviorSubject<LearningPathState>(new DEFAULT_STATE());

  // state selectors
  isLearningPathOpen$: Observable<boolean> = selectFrom(this.state$, nameof<LearningPathState>('isLearningPathOpen'));
  activeEnrolledCourseIndex$: Observable<number> = selectFrom(this.state$, nameof<LearningPathState>('activeEnrolledCourseIndex'));
  activeContentIndex$: Observable<number> = selectFrom(this.state$, nameof<LearningPathState>('activeContentIndex'));
  courses$: Observable<CourseViewData[]> = selectFrom(this.state$, nameof<LearningPathState>('courses'));
  activeCourseContentDetails$: Observable<ContentDetails> = selectFrom(this.state$, nameof<LearningPathState>('activeCourseContentDetails'));
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
    this.state$.next(new DEFAULT_STATE());
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
