import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { CourseViewData } from "src/app/modules/content/components/learning-path/models/course-view-data";
import { AssignmentsService } from "src/app/services/assignments/assignments.service";
import { AssignmentEnrollmentStatus, CourseAssignment, CreateAssignmentOfContentResult, LearningPathUserAssignmentsResponse } from "src/app/resources/models/assignment";
import { formatDurationShort } from "src/app/resources/functions/content/content";
import { getCourseAssignmentStatusText } from "src/app/resources/functions/content/course";
import { ContentTypesService } from "src/app/services/content-types.service";
import { TranslationService } from "src/app/services/translation.service";
import { debounceTime, delay, map, tap } from "rxjs";
import { CourseActions } from "./courses.actions";
import { ToastrService } from "ngx-toastr";
import { LearningPathStateService } from "../learning-path/learning-path-state.service";

export interface CourseStateModel {
  courses: CourseViewData[];
  isCoursesLoading: boolean;
}

const DEFAULT_STATE: CourseStateModel = {
  courses: null,
  isCoursesLoading: true
}

@State<CourseStateModel>({
  name: 'courses',
  defaults: DEFAULT_STATE
})
@Injectable()
export class CourseState {
  constructor(
    private assignmentsService: AssignmentsService,
    private contentTypesService: ContentTypesService,
    private translationService: TranslationService,
    private toastr: ToastrService,
    private store: Store,
    private oldLpState: LearningPathStateService
  ) {}

  // SELECTORS

  @Selector()
  static courses(state: CourseStateModel) {
    return state.courses;
  }

  @Selector()
  static isCoursesLoading(state: CourseStateModel) {
    return state.isCoursesLoading;
  }

  // ACTIONS

  @Action(CourseActions.GetCourses, { cancelUncompleted: true })
  getCourses({ patchState }: StateContext<CourseStateModel>, action: CourseActions.GetCourses) {
    patchState({ isCoursesLoading: true });
    this.oldLpState.isLoading$.next(true); // ONLY DOING this until we fully deprecate old state structure; LP consumption still using this old way
    return this.assignmentsService.getLearningPathUserAssignments(action.learningPathId).pipe(
      map((res: LearningPathUserAssignmentsResponse) => 
        res?.courseAssignments?.map((courseAssignment: CourseAssignment) => this.mapLearningPathResponseToViewObj(courseAssignment, action.learningPathId))
      ),
      tap((courses: CourseViewData[]) => {
        patchState({ 
          courses,
          isCoursesLoading: false
        });
      }),
      tap((courses: CourseViewData[]) => {
        // ONLY DOING this until we fully deprecate old state structure; LP consumption still using this old way
        this.oldLpState.updateCourses(courses);
        this.oldLpState.isLoading$.next(false)
      })
    )
  }

  @Action(CourseActions.EnrollCourse)
  enrollCourse(_: any, { course, dueDate}: CourseActions.EnrollCourse) {
    return this.assignmentsService
      .createAssignment([course.courseId], dueDate)
      .pipe(
        tap((res) => {
          const successfulResult = res.userContentIdsAdded.find(r => r.contentId === course.courseId);
          if (!!successfulResult) {
            
            const newStatus = AssignmentEnrollmentStatus.Not_Started;
            const translationTextKey = getCourseAssignmentStatusText(newStatus);
            const mutatedCourse: CourseViewData = {
              ...course,
              status: newStatus,
              actionBtnText: this.translationService.getTranslationFileData(translationTextKey)
            }

            this.store
              .dispatch(new CourseActions.GetCourses(course.learningPathId))
              .subscribe(_ => this.toastr.success('Enrollment successful.'));

            // ONLY DOING this until we fully deprecate old state structure; LP consumption still using this old way
            const oldUpdatedCourses = this.oldLpState.snapshot.courses.map(course => course?.courseId === mutatedCourse.courseId ? mutatedCourse : course);
            this.oldLpState.updateCourses(oldUpdatedCourses);
          }
        })
      )
  }

  @Action(CourseActions.EnrollCourses)
  enrollCourses( { getState }: StateContext<CourseStateModel>, { learningPathId, courseIds, dueDate }: CourseActions.EnrollCourses) {
    // patchState({ isCoursesLoading: true });
    return this.assignmentsService
      .createAssignment(courseIds, dueDate)
      .pipe(
        tap(res => {
          this.store
            .dispatch(new CourseActions.GetCourses(learningPathId))
            .subscribe(_ => this.toastr.success(`Enrolled in ${ res.userContentIdsAdded.length } Course(s).`, ''));
        }),
      )
  }

  @Action(CourseActions.DropCourse)
  dropCourse({ getState, patchState }: StateContext<CourseStateModel>, { course }: CourseActions.DropCourse) {
    this.oldLpState.updateIsCourseSummaryOpen(false); // ONLY DOING this until we fully deprecate old state structure; LP consumption still using this old way
    patchState({ isCoursesLoading: true });
    return this.assignmentsService
      .removeAssignments([course.enrollmentId])
      .pipe(
        delay(300), // delay a little to show loading spinner
        tap(dropAssignmentsResponse => {
          // if guid you passed is in succeeded list, then we can mark course as dropped in LP state
          const responseEnrollId = dropAssignmentsResponse?.succeeded.find(s => s === course.enrollmentId);
          if (!responseEnrollId) {
            this.toastr.error(this.translationService.getTranslationFileData('course-state.drop-fail'))

            patchState({
              isCoursesLoading: false
            })

            return;
          };

          const updatedCourses = getState().courses.map(course => {
            if (course?.enrollmentId === responseEnrollId) {
              const newStatus = AssignmentEnrollmentStatus.Dropped;
              const translationTextKey = getCourseAssignmentStatusText(newStatus);
              return {
                ...course,
                enrollmentId: undefined,
                status: newStatus,
                actionBtnText: this.translationService.getTranslationFileData(translationTextKey)
              }
            } else {
              return course;
            }
          });

          patchState({
            courses: updatedCourses,
            isCoursesLoading: false
          })

          this.toastr.success(
            this.translationService
              .getTranslationFileData('content-container.dropped-message')
              ?.replace('[NAME]', course.name)
          );
        })
      )
  }

  // UTILS

  private mapLearningPathResponseToViewObj(courseAssignment: CourseAssignment, lpId: string): CourseViewData {
    const status = courseAssignment?.assignmentDetails?.status;
    const translationTextKey = getCourseAssignmentStatusText(status);
    return {
      learningPathId: lpId,
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