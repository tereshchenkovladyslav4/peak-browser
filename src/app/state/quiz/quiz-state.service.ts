import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, filter, map, tap } from 'rxjs';
import { selectFrom, nameof } from 'src/app/resources/functions/state/state-management';
import { Quiz, QuizQuestion, QuizQuestionType } from 'src/app/resources/models/content';
import { QuizSession, QuizStatus } from 'src/app/resources/models/content/quiz';
import { LearningPathStateService } from '../learning-path/learning-path-state.service';
import { QuizResults } from 'src/app/modules/content/components/quiz/ui/quiz-results/quiz-results.component';
import { isAnswerSelectedByUser } from 'src/app/resources/functions/content/quiz';

export interface QuestionData {
  index: number;
  count: number;
  question: QuizQuestion;
}

interface QuizState {
  answerActivelySelected: boolean;
  isQuizOpen: boolean;
  quiz: Quiz;
  questionIndex: number;
  mappedQuizQuestions: { [questionId: string]: QuizQuestion };
  totalUserAttempts: number;
  hasUserPassed: boolean;
  queuedAnswer: string; // store answer string for current question user is on which then gets sent to server on answer submission
  quizSession: QuizSession; // REF SHOULD ONLY change when it initially gets put into state and when it is reset
}

const DEFAULT_STATE: QuizState = {
  answerActivelySelected: false,
  isQuizOpen: false,
  quiz: null,
  questionIndex: null,
  mappedQuizQuestions: {},
  totalUserAttempts: 0,
  hasUserPassed: false,
  queuedAnswer: null,
  quizSession: null
}

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {

  private state$ = new BehaviorSubject<QuizState>(DEFAULT_STATE);

  test$: Observable<any> = this.state$.pipe(map(x => x.questionIndex));

  // state selectors
  isQuizOpen$: Observable<boolean> = selectFrom(this.state$, nameof<QuizState>('isQuizOpen'));
  quiz$: Observable<Quiz> = selectFrom(this.state$, nameof<QuizState>('quiz'));
  questionIndex$: Observable<number> = selectFrom(this.state$, nameof<QuizState>('questionIndex'));
  mappedQuizQuestions$: Observable<{ [x: string]: QuizQuestion }> = selectFrom(this.state$, nameof<QuizState>('mappedQuizQuestions'));
  answerActivelySelected$: Observable<boolean> = selectFrom(this.state$, nameof<QuizState>('answerActivelySelected'));
  quizSession$: Observable<QuizSession> = selectFrom(this.state$, nameof<QuizState>('quizSession'));

  // complex selectors
  isQuizLoaded$: Observable<boolean> = this.quizSession$.pipe(
    map(quizSession => !!quizSession)
  );
  questionData$: Observable<QuestionData> = combineLatest([
    this.questionIndex$,
    this.mappedQuizQuestions$,
    this.quizSession$
  ]).pipe(
    filter(([questionIndex, mappedQuizQuestions, quizSession]) => questionIndex !== undefined && questionIndex >= 0 && !!mappedQuizQuestions && !!quizSession),
    map(([questionIndex, mappedQuizQuestions, quizSession]) => {
      const activeTrackedQuestion = quizSession?.questions[questionIndex];
      return questionIndex === quizSession?.questions?.length
          ? undefined
          : {
            index: questionIndex,
            count: quizSession?.questions?.length,
            question: mappedQuizQuestions[activeTrackedQuestion?.questionId]
          }
    })
  )
  isQuizFinished$: Observable<boolean> = this.questionIndex$.pipe(
    map(questionIndex => this.isQuizFinished(questionIndex))
  );
  quizResults$: Observable<QuizResults> = combineLatest([this.isQuizFinished$, this.quizSession$]).pipe(
    filter(([isQuizFinished, quizSession]) => !!isQuizFinished),
    tap(([_, quizSession]) => {
      this.updateHasUserPassed(quizSession?.quizStatus === QuizStatus.Pass)
    }),
    map(([_, quizSession]) => {
      const { mappedQuizQuestions, quiz } = this.snapshot;
      return {
        percentage: Math.floor(quizSession?.quizAnswersCorrect / quizSession?.quizAnswersPossible * 100),
        isPassFail: quiz?.requirePassingScore,
        passed: quizSession?.quizStatus === QuizStatus.Pass,
        endDatetime: quizSession.endDatetime,
        questions: quizSession?.questions?.map(q => ({
          text: q?.questionText,
          type: q?.questionType,
          imageUrl: mappedQuizQuestions[q?.questionId]?.imageUrl,
          userAnsweredCorrectly: q?.isCorrect,
          givenAnswer: q?.givenAnswer,
          answers: mappedQuizQuestions[q?.questionId]?.answers?.map((a, index) => ({
            answerText: a?.answerText,
            answerImgUrl: a?.imageUrl,
            isCorrect: a?.isCorrectAnswer,
            selectedByUser: isAnswerSelectedByUser(q?.givenAnswer, a, index),
            rowId: [QuizQuestionType.ChooseSingleAnswer, QuizQuestionType.ChooseMultipleAnswers].includes(q?.questionType)
              ? String.fromCharCode(index + 65) // convert index to A, B, C, D...
              : ''
          }))
        }))
      }
    })
  )

  constructor(private learningPathState: LearningPathStateService) {}

  reset() {
    this.state$.next(DEFAULT_STATE);
  }

  // snapshot
  get snapshot(): QuizState {
    return this.state$.getValue();
  }

  get canQuizBeRetaken(): boolean {
    const { allowQuizRetakes, maxQuizAttempts } = this.learningPathState.activeEnrolledCourse?.settings
    const { totalUserAttempts } = this.snapshot;
    return allowQuizRetakes && totalUserAttempts < maxQuizAttempts
  }

  isQuizFinished(questionIndex: number): boolean {
    return questionIndex === this.snapshot.quizSession?.questions?.length;
  }

  updateIsQuizOpen(isQuizOpen: boolean) {
    this.state$.next({
      ...this.snapshot,
      isQuizOpen: isQuizOpen
    })
  }

  updateQuiz(quiz: Quiz) {
    this.state$.next({
      ...this.snapshot,
      quiz: quiz
    })
  }

  updateQuestionIndex(questionIndex: number) {
    this.state$.next({
      ...this.snapshot,
      questionIndex: questionIndex
    })
  }

  updateAnswerActivelySelected(answerActivelySelected: boolean) {
    this.state$.next({
      ...this.snapshot,
      answerActivelySelected: answerActivelySelected
    })
  }

  updateMappedQuizQuestions(mappedQuizQuestions: { [x: string]: QuizQuestion }) {
    this.state$.next({
      ...this.snapshot,
      mappedQuizQuestions: mappedQuizQuestions
    })
  }

  updateTotalUserAttempts(totalUserAttempts: number) {
    this.state$.next({
      ...this.snapshot,
      totalUserAttempts: totalUserAttempts
    })
  }

  updateHasUserPassed(hasUserPassed: boolean) {
    this.state$.next({
      ...this.snapshot,
      hasUserPassed: hasUserPassed
    })
  }

  updateQueuedAnswer(queuedAnswer: string) {
    this.state$.next({
      ...this.snapshot,
      queuedAnswer: queuedAnswer
    })
  }

  updateQuizSession(quizSession: QuizSession) {
    this.state$.next({
      ...this.snapshot,
      quizSession: quizSession
    })
  }
}
