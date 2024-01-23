import { Injectable } from '@angular/core';
import { Observable, map, tap, mergeMap, of, filter, take, takeUntil, Subject } from 'rxjs';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";
import { CourseViewData } from "src/app/modules/content/components/learning-path/models/course-view-data";
import { LearningPathUserAssignmentsResponse, CourseAssignment, AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { ContentDetails, ContentType, Quiz } from 'src/app/resources/models/content';
import { PostEnrollmentTrackingItemRequest, PostEnrollmentTrackingItemResponse } from 'src/app/resources/models/enrollment';
import { ContentTypesService } from 'src/app/services/content-types.service';
import { ContentService } from 'src/app/services/content.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { formatDurationShort } from 'src/app/resources/functions/content/content';
import { TranslationService } from 'src/app/services/translation.service';
import { LP_WORKFLOW_ENROLL_ID_KEY, LP_WORKFLOW_CONTENT_ID_KEY } from '../../workflow/workflow-state.service';
import { LearningPathStateService, DEFAULT_COURSE_CONTENT_TRACKING } from '../learning-path-state.service';
import { QuizActionsService } from '../../quiz/actions/quiz-actions.service';
import { QuizStateService } from '../../quiz/quiz-state.service';
import { QuizStatus } from 'src/app/resources/models/content/quiz';
import { AssignmentsService } from 'src/app/services/assignments/assignments.service';
import { getCourseAssignmentStatusText } from 'src/app/resources/functions/content/course';

@Injectable({
  providedIn: 'root'
})
export class LearningPathEffectsService {

  constructor(
    private learningPathState: LearningPathStateService,
    private enrollmentService: EnrollmentService,
    private contentTypesService: ContentTypesService,
    private sessionStorage: SessionStorageService,
    private translationService: TranslationService,
    private quizActions: QuizActionsService,
    private quizState: QuizStateService,
    private assignmentsService: AssignmentsService
  ) { 

  }

  getLearningPathCourseEnrollmentsEffect(learningPathId: string): Observable<CourseViewData[]> {
    this.learningPathState.updateLearningPathId(learningPathId);
    return this.assignmentsService.getLearningPathUserAssignments(learningPathId).pipe(
      map((res: LearningPathUserAssignmentsResponse) => 
        res?.courseAssignments?.map((courseAssignment: CourseAssignment) => this.mapLearningPathResponseToViewObj(courseAssignment))
      ),
      tap((courses: CourseViewData[]) => this.learningPathState.updateCourses(courses))
    )
  }

  /**
   * Retrieves the related content details from server
   * @param enrolledCourseIndex index of enrolled course contained in LP State
   * @param contentIndex index of content in active enrolled course
   * @returns content details for the active enrolled courses active piece of content
   */
  getEnrollmentContentItemEffect(enrolledCourseIndex: number, contentIndex: number, retakeQuiz: boolean = false): Observable<ContentDetails> {
    if (enrolledCourseIndex === -1 || contentIndex === -1) return of(null);

    let course: CourseViewData = undefined;
    let content: CourseViewContent = undefined;
    if (this.learningPathState.enrolledCourses) {
      course = this.learningPathState.enrolledCourses[enrolledCourseIndex];
      content = this.learningPathState.enrolledCourses[enrolledCourseIndex]?.content[contentIndex];
    }

    const enrollmentId: string = course?.enrollmentId || this.sessionStorage.getItem(LP_WORKFLOW_ENROLL_ID_KEY);
    const contentId: string = content?.contentId || this.sessionStorage.getItem(LP_WORKFLOW_CONTENT_ID_KEY);

    // trigger quiz end when switching to a different piece of content
    this.quizActions.endQuiz();

    this.learningPathState.isLoading$.next(true);
    return this.enrollmentService.getEnrollmentContentItem(enrollmentId, contentId).pipe(
      map(contentDetails => ({
        ...contentDetails,
        typeIcon: this.contentTypesService.getContentInfoIconUrl(contentDetails?.type, contentDetails?.documentType)
      })),
      tap(contentDetails => this.learningPathState.updateActiveCourseContentDetails(contentDetails)),
      tap(contentDetails => {
        if (contentDetails?.type === ContentType.Quiz) {
          this.quizActions.quizOpenedFromLP(contentDetails, retakeQuiz);
        }
      })
    )
  }

  postEnrollmentTrackingItemEffect(courseIndex: number, contentIndex: number) {
    // get enrollment id
    const enrolledCourse = this.learningPathState.enrolledCourses[courseIndex];
    const enrolledCourseContent = enrolledCourse?.content[contentIndex];

    // don't send tracking request if it is a video and video length is 0
    if (enrolledCourseContent?.contentType === ContentType.Video && this.learningPathState.snapshot.courseContentTracking.videoLength === 0) {
      this.learningPathState.updateCourseContentTracking(DEFAULT_COURSE_CONTENT_TRACKING);
      return;
    }

    const { 
      startTime, 
      isComplete, 
      videoLength, 
      lastVideoPosition
    } = this.learningPathState.snapshot.courseContentTracking;
    const { quizSession, hasUserPassed } = this.quizState.snapshot;

    // create request
    const request: PostEnrollmentTrackingItemRequest  = {
      courseId: enrolledCourse?.courseId,
      contentId: enrolledCourseContent?.contentId,
      contentType: enrolledCourseContent?.contentType,
      startDate: startTime,
      isComplete: isComplete,
      endDate: new Date(),
      isExternalVideo: false,
      videoLength: videoLength,
      lastVideoPosition: lastVideoPosition,
      quizSessionItem: quizSession
    }

    if (isComplete) {
      this.learningPathState.updateCachedContentToMarkComplete({
        completedContent: {
          contentId: enrolledCourseContent?.contentId,
          progress: 100,
          assignmentStatus: AssignmentEnrollmentStatus.Completed,
          quizStatus: quizSession // weird logic to keep the quiz status as PASS if the user has passed the quiz at least once
            ? hasUserPassed
              ? QuizStatus.Pass
              : quizSession?.quizStatus
            : QuizStatus.None
        },
        courseId: enrolledCourse?.courseId
      })
    }

    this.enrollmentService
      .postEnrollmentTrackingItem(enrolledCourse?.enrollmentId, request)
      .subscribe(_ => this.learningPathState.updateCourseContentTracking(DEFAULT_COURSE_CONTENT_TRACKING));
  }

  markCourseAsComplete(enrollId: string): Observable<any> {
    return this.assignmentsService
      .markAssignmentAsCompleted(enrollId)
      .pipe(
        tap(_ => {
          // can mark course as complete in LP state
          const updatedCourses = this.learningPathState.snapshot.courses.map(course => {
            if (course?.enrollmentId === enrollId) {
              return {
                ...course,
                status: AssignmentEnrollmentStatus.Completed
              }
            } else {
              return course;
            }
          });

          this.learningPathState.updateCourses(updatedCourses);
        }),
        take(1)
      );
  }

  dropSingleCourseEnrollment(enrollId: string): Observable<any> {
    return this.assignmentsService
      .removeAssignments([enrollId])
      .pipe(
        filter(dropAssignmentsResponse => !!dropAssignmentsResponse),
        tap(dropAssignmentsResponse => {
          // if guid you passed is in succeeded list, then we can mark course as dropped in LP state
          const responseEnrollId = dropAssignmentsResponse?.succeeded.find(s => s === enrollId);
          if (!responseEnrollId) return;

          const updatedCourses = this.learningPathState.snapshot.courses.map(course => {
            if (course?.enrollmentId === responseEnrollId) {
              return {
                ...course,
                status: AssignmentEnrollmentStatus.Dropped
              }
            } else {
              return course;
            }
          });

          this.learningPathState.updateCourses(updatedCourses);
        }),
        take(1)
      );
  }

  private mapLearningPathResponseToViewObj(courseAssignment: CourseAssignment): CourseViewData {
    const status = courseAssignment?.assignmentDetails?.status;
    const translationTextKey = getCourseAssignmentStatusText(status);
    return {
      learningPathId: '',
      courseId: courseAssignment?.id,
      enrollmentId: courseAssignment?.assignmentDetails?.enrollmentId,
      name: courseAssignment?.name,
      plainDesc: courseAssignment?.courseDetails?.plainDescription,
      htmlDesc: courseAssignment?.courseDetails?.description,
      duration: formatDurationShort(courseAssignment?.duration),
      content: courseAssignment?.contentDetails?.map((c, index, arr) => ({
        contentId: c?.id,
        name: c?.name,
        contentType: c?.type,
        contentIconUrl: this.contentTypesService.getContentInfoIconUrl(c?.type, c?.documentType),
        progress: c?.assignmentDetails?.progress,
        status: c?.assignmentDetails?.status,
        quizData: {
          settings: c?.quizSettings,
          progress: c?.quizProgress,
          status: c?.quizStatus,
          totalAttempts: c?.totalQuizAttempts
        }
      })),
      progress: courseAssignment?.assignmentDetails?.progress,
      status: status,
      settings: {
        mustViewContentInOrder: courseAssignment?.courseDetails?.mustViewContentInOrder,
        allowQuizRetakes: courseAssignment?.courseDetails?.specifyMaxQuizAttempts,
        maxQuizAttempts: courseAssignment?.courseDetails?.maxQuizAttempts,
        mustPassQuiz: courseAssignment?.courseDetails?.mustPassQuiz,
        overrideReqVidWatchPct: courseAssignment?.courseDetails?.overrideReqVidWatchPct,
        reqVidWatchPct: courseAssignment?.courseDetails?.reqVidWatchPct ?? 0
      },
      isEnrolled: !!courseAssignment?.assignmentDetails,
      contentIconUrl: this.contentTypesService.getContentInfoIconUrl(courseAssignment?.type, courseAssignment?.documentType),
      actionBtnText: this.translationService.getTranslationFileData(translationTextKey)
    }
  }
}
