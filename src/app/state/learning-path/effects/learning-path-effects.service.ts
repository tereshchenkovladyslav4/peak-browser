import { Injectable } from '@angular/core';
import { Observable, map, tap, of, filter, take } from 'rxjs';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";
import { CourseViewData } from "src/app/modules/content/components/learning-path/models/course-view-data";
import { LearningPathUserAssignmentsResponse, CourseAssignment, AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { ContentDetails, ContentType } from 'src/app/resources/models/content';
import { PostEnrollmentTrackingItemRequest } from 'src/app/resources/models/enrollment';
import { ContentTypesService } from 'src/app/services/content-types.service';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { formatDurationShort } from 'src/app/resources/functions/content/content';
import { TranslationService } from 'src/app/services/translation.service';
import { LP_WORKFLOW_ENROLL_ID_KEY, LP_WORKFLOW_CONTENT_ID_KEY } from '../../workflow/workflow-state.service';
import { LearningPathStateService, EnrollmentContentTracking, EnrollmentVideoTracking, EnrollmentQuizTracking } from '../learning-path-state.service';
import { QuizActionsService } from '../../quiz/actions/quiz-actions.service';
import { QuizSession } from 'src/app/resources/models/content/quiz';
import { AssignmentsService } from 'src/app/services/assignments/assignments.service';
import { getCourseAssignmentStatusText } from 'src/app/resources/functions/content/course';
import { isEmptyHtml } from '../../../resources/functions/is-empty-html/is-empty-html';

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
   * @param retakeQuiz boolean in order to retake quiz
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

  /**
   * This function should be called to cache the completion status of the content when invoking the update enrollment tracking API.
   * The cached status will then be utilized to promptly display a green checkmark in the course list in consumptive state.
   *
   * @param contentId ID of a course content item
   * @param courseId ID of a course
   * @param quizSession The latest quiz session. This will be passed for only quiz content
   */
  private updateCachedContentToMarkComplete(contentId: string, courseId: string, quizSession?: QuizSession) {
    this.learningPathState.updateCachedContentToMarkComplete({
      completedContent: {
        contentId: contentId,
        progress: 100,
        assignmentStatus: AssignmentEnrollmentStatus.Completed,
        quizStatus: quizSession?.quizStatus
      },
      courseId: courseId
    });
  }

  postEnrollmentContentTracking(tracking: EnrollmentContentTracking) {
 
    if (tracking.isComplete) {
      this.updateCachedContentToMarkComplete(tracking.contentId, tracking.courseId);
    }

    // create request
    const request: PostEnrollmentTrackingItemRequest = {
      courseId: tracking.courseId,
      contentId: tracking.contentId,
      contentType: tracking.contentType,
      startDate: tracking.startTime,
      isComplete: tracking.isComplete,
      endDate: tracking.endTime,
      isExternalVideo: false,
      videoLength: 0,
      lastVideoPosition: 0,
      quizSessionItem: null
    }

    this.enrollmentService
      .postEnrollmentTrackingItem(tracking.enrollmentId, request)
      .subscribe();
  }

  postEnrollmentQuizTracking(tracking: EnrollmentQuizTracking) {

    if (tracking.isComplete) {
      this.updateCachedContentToMarkComplete(tracking.contentId, tracking.courseId, tracking.quizSessionItem);
    }

    // create request
    const request: PostEnrollmentTrackingItemRequest = {
      courseId: tracking.courseId,
      contentId: tracking.contentId,
      contentType: tracking.contentType,
      startDate: tracking.startTime,
      isComplete: tracking.isComplete,
      endDate: tracking.endTime,
      isExternalVideo: false,
      videoLength: 0,
      lastVideoPosition: 0,
      quizSessionItem: tracking.quizSessionItem
    }

    this.enrollmentService
      .postEnrollmentTrackingItem(tracking.enrollmentId, request)
      .subscribe();
  }

  postEnrollmentVideoTracking(tracking: EnrollmentVideoTracking) {

    if (tracking.isComplete) {
      this.updateCachedContentToMarkComplete(tracking.contentId, tracking.courseId);
    }

    // create request
    const request: PostEnrollmentTrackingItemRequest = {
      courseId: tracking.courseId,
      contentId: tracking.contentId,
      contentType: tracking.contentType,
      startDate: tracking.startTime,
      isComplete: tracking.isComplete,
      endDate: tracking.endTime,
      isExternalVideo: tracking.isExternalVideo,
      videoLength: tracking.videoLength,
      lastVideoPosition: tracking.lastVideoPosition,
      quizSessionItem: null
    }

    this.enrollmentService
      .postEnrollmentTrackingItem(tracking.enrollmentId, request)
      .subscribe();
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
      hasDesc: !isEmptyHtml(courseAssignment?.courseDetails?.description) || !!courseAssignment?.courseDetails?.plainDescription,
      duration: formatDurationShort(courseAssignment?.duration),
      content: courseAssignment?.contentDetails?.map((c) => ({
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
