import { Injectable } from '@angular/core';
import { EMPTY, Observable, switchMap, take, tap } from 'rxjs';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { QuizStateService } from '../quiz-state.service';
import { QuizSession, QuizStatus, TrackedQuestion } from 'src/app/resources/models/content/quiz';
import { LearningPathActionsService } from '../../learning-path/actions/learning-path-actions.service';
import { LearningPathStateService } from '../../learning-path/learning-path-state.service';
import { CourseViewContent } from "src/app/modules/content/components/learning-path/models/course-view-content";

@Injectable({
  providedIn: 'root'
})
export class QuizEffectsService {

  constructor(
    private quizState: QuizStateService,
    private enrollmentService: EnrollmentService,
    private learningPathState: LearningPathStateService
  ) {

  }

  getQuizSessions(enrollId: string, quizId: string, retakeQuiz: boolean = false): Observable<any> {
    return this.enrollmentService
    .getQuizSessions(enrollId, quizId)
    .pipe(
      switchMap((quizSessions: QuizSession[]) => {
        const mostRecentlyPassedQuizSession = quizSessions?.find(qs => qs.quizStatus === QuizStatus.Pass)
        const hasUserPassQuiz = !!mostRecentlyPassedQuizSession
        this.quizState.updateTotalUserAttempts(quizSessions?.length);
        this.quizState.updateHasUserPassed(hasUserPassQuiz);
        
        const mostRecentQuizSession = quizSessions[0];
        const activeQuizSession = mostRecentQuizSession?.quizStatus !== QuizStatus.Pass 
          && mostRecentQuizSession?.quizStatus !== QuizStatus.Fail;
        if (!quizSessions?.length || (retakeQuiz && !hasUserPassQuiz && !activeQuizSession)) {
          return this.createQuizSession(enrollId, quizId);
        } else {
          if (mostRecentlyPassedQuizSession) {
            // set most recently passed quiz session as the active so the results show properly
            this.updateQuizSessionInState(mostRecentlyPassedQuizSession)
          } else {
            // otherwise set most recent (failed/in-progress) quiz session as active
            this.updateQuizSessionInState(quizSessions[0]);
          }
          return EMPTY;
        }
      })
    );
  }

  createQuizSession(enrollId: string, quizId: string) {
    return this.enrollmentService
      .createQuizSession(enrollId, quizId)
      .pipe(
        tap(quizSession => this.updateQuizSessionInState(quizSession)),
        tap(quizSession => {
          // DUPLICATED CODE FROM LP ACTIONS
          // SHOULD MOVE
          // ideally action/effect/state style logic for LP & Quiz is refactored
          // as well as the component structure for the content module...
          const { activeEnrolledCourse, activeEnrolledCourseContent } = this.learningPathState;
          const courseId = activeEnrolledCourse?.courseId;
          const mutatedContent: CourseViewContent = {
            ...activeEnrolledCourseContent,
            quizData: {
              ...activeEnrolledCourseContent.quizData,
              progress: {
                totalQuestionsComplete: 0,
                totalQuizQuestions: quizSession?.questions?.length
              }
            }
          };

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
        })
      )
  }

  updateQuizSession(quizSession: QuizSession) {
    this.enrollmentService
      .updateQuizSession(quizSession)
      .pipe(
        take(1)
      )
      .subscribe();
  }

  updateTrackedQuestion(trackedQuestion: TrackedQuestion) {
    this.enrollmentService
    .updateTrackedQuestion(trackedQuestion)
    .pipe(
      take(1)
    )
    .subscribe();
  }

  private updateQuizSessionInState(quizSession: QuizSession) {
    this.quizState.updateQuizSession(quizSession);
    // set question index based on what questions have already been answered
    // default to questions length which indicates end of quiz
    const { questions } = quizSession;
    let questionIndex = questions?.length;
    for (let i = 0; i < questions?.length; i++) {
      const question = questions[i];
      if (!question.isAnswered) {
        questionIndex = i;
        break;
      }
    }
    this.quizState.updateQuestionIndex(questionIndex);

    // create mapping of questionId -> QuizQuestion (ref) so tracked questions can access quiz data quicker
    // and avoid looping quiz questions arr all the time
    this.quizState.updateMappedQuizQuestions(
      this.quizState.snapshot.quiz?.questions?.reduce((acc, q) => ({
        ...acc,
        [q.questionId]: q
      }), {})
    )
  }
}
