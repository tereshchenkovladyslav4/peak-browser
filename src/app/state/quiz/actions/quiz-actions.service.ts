import { Injectable } from '@angular/core';
import { QuizStateService } from '../quiz-state.service';
import { LayoutStateService } from '../../layout/layout-state.service';
import { EMPTY, take } from 'rxjs';
import { LearningPathStateService } from '../../learning-path/learning-path-state.service';
import { ContentDetails, Quiz, QuizQuestionType } from 'src/app/resources/models/content';
import { QuizEffectsService } from '../effects/quiz-effects.service';
import { QuizStatus } from 'src/app/resources/models/content/quiz';
import { isChosenAnswerCorrect } from 'src/app/resources/functions/content/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizActionsService {

  constructor(
    private quizState: QuizStateService,
    private quizEffects: QuizEffectsService,
    private layoutState: LayoutStateService,
    private learningPathState: LearningPathStateService
  ) { 
    this.layoutState.selectIsFullScreen$.subscribe(isFullscreen => {
      // quiz closed after leaving full screen
      if (!isFullscreen) {
        this.quizState.reset();
      }
    })
  }

  quizOpenedFromLP(contentDetails: ContentDetails, retakeQuiz: boolean = false) {
    this.quizState.updateQuiz(contentDetails as Quiz);
    this.quizState.updateIsQuizOpen(true);
    const enrollId = this.learningPathState.activeEnrolledCourse?.enrollmentId;
    this.quizEffects
      .getQuizSessions(enrollId, contentDetails?.id, retakeQuiz)
      .pipe(
        take(1)
      )
      .subscribe();
  }

  retakeQuiz() {
    // set quiz session in state to undefined to trigger loading in component(s)
    this.quizState.updateQuizSession(undefined);

    const enrollId = this.learningPathState.activeEnrolledCourse?.enrollmentId;
    const quizId = this.quizState.snapshot.quiz?.id;

    // create new quiz session
    this.quizEffects
      .createQuizSession(enrollId, quizId)
      .pipe(
        take(1)
      )
      .subscribe();
  }

  endQuiz() {
    this.quizState.reset();
  }

  incrementQuestionIndex() {
    this.quizState.updateQuestionIndex(++this.quizState.snapshot.questionIndex);
  }

  answerSelected(answer: string) {
    this.quizState.updateQueuedAnswer(answer);

    this.quizState.updateAnswerActivelySelected(true);
  }

  answerDeselected() {
    this.quizState.updateQueuedAnswer('');
    this.quizState.updateAnswerActivelySelected(false);
  }

  submitAnswer() {
    // take queued answer and update tracked question data on server
    const { questionIndex, queuedAnswer, mappedQuizQuestions, quizSession, totalUserAttempts } = this.quizState.snapshot;
    const activeTrackedQuestion = quizSession?.questions[questionIndex];

    // safe to update tracked question obj that exists in state without guarunteed sync from backend
    activeTrackedQuestion.isCorrect = isChosenAnswerCorrect(queuedAnswer, mappedQuizQuestions[activeTrackedQuestion.questionId]?.answers, activeTrackedQuestion?.questionType);
    activeTrackedQuestion.givenAnswer = queuedAnswer;
    activeTrackedQuestion.isAnswered = true;
    activeTrackedQuestion.answerDatetime = new Date();

    if (activeTrackedQuestion.isCorrect) {
      quizSession.quizAnswersCorrect += 1;
    }

    this.quizEffects.updateTrackedQuestion(activeTrackedQuestion);
    
    // cleanup
    this.answerDeselected();
    
    // IF last question was submitted
    if (questionIndex === quizSession.questions?.length - 1) {
      // update total user attempts
      const totalAttempts = totalUserAttempts + 1;
      this.quizState.updateTotalUserAttempts(totalAttempts);

      // update total quiz attempts at LP state level
      const { courses, activeContentIndex } = this.learningPathState.snapshot;
      const mutatedCourses = courses.map(course => ({
        ...course,
        content: course?.content?.map((content, i) => ({
          ...content,
          quizData: i === activeContentIndex
            ? ({
              ...content?.quizData,
              totalAttempts: totalAttempts
            })
            : content?.quizData
        }))
      }))
      this.learningPathState.updateCourses(mutatedCourses);

      // update quiz session
      quizSession.endDatetime = new Date();
      quizSession.isComplete = true;
      quizSession.quizStatus = quizSession.quizAnswersCorrect >= quizSession.quizAnswersPass ? QuizStatus.Pass : QuizStatus.Fail;
      // Quiz Session should be updated to reflect the quiz status immediately if it happens to be the last question.
      this.quizState.updateQuizSession(quizSession);
    }

    // Should call the function updateQuizSession to store quizAnswersCorrect, even if the quiz isn't complete yet.
    this.quizEffects.updateQuizSession(quizSession);

    // quiz is considered finished when question index === num of questions
    this.incrementQuestionIndex();
  }
}

