import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, combineLatest, map } from 'rxjs';
import { ButtonOptions, NextQuestionButton, SubmitQuizBtn } from '../../../../../../resources/models/button/button';
import { LearningPathActionsService } from '../../../../../../state/learning-path/actions/learning-path-actions.service';
import { QuizStateService } from '../../../../../../state/quiz/quiz-state.service';
import { QuizActionsService } from '../../../../../../state/quiz/actions/quiz-actions.service';

@Component({
  selector: 'ep-quiz-buttons',
  templateUrl: './quiz-buttons.component.html',
  styleUrls: ['./quiz-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizButtonsComponent implements OnInit, OnDestroy {
  buttons$: Observable<ButtonOptions[]>;

  buttonMap: { [key: string]: Function };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private learningPathActions: LearningPathActionsService,
    private quizState: QuizStateService,
    private quizActions: QuizActionsService,
  ) {}

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
      [NextQuestionButton.label]: () => this.handleNextQuestionClick(),
      [SubmitQuizBtn.label]: () => this.handleSubmitQuizBtnClick(),
    };
  }

  private setButtons() {
    this.buttons$ = combineLatest([
      this.quizState.isQuizOpen$,
      this.quizState.questionIndex$,
      this.quizState.answerActivelySelected$,
      this.quizState.isQuizFinished$,
    ]).pipe(
      map(([isQuizOpen, questionIndex, answerActivelySelected, isQuizFinished]) => {
        if (isQuizOpen) {
          const { quizSession } = this.quizState.snapshot;
          if (!isQuizFinished) {
            // if user is on last question
            if (questionIndex === quizSession?.questions?.length - 1) {
              SubmitQuizBtn.disabled = !answerActivelySelected;
              return [SubmitQuizBtn];
            } else {
              NextQuestionButton.disabled = !answerActivelySelected;
              return [NextQuestionButton];
            }
          }
        }
        return [];
      }),
    );
  }

  onButtonClick(buttonOptions: ButtonOptions) {
    const key = buttonOptions?.label;
    if (key === null || key === undefined) return;

    this.buttonMap[key]();
  }

  handleNextQuestionClick() {
    this.learningPathActions.submitQuizAnswer();
    this.quizActions.submitAnswer();
  }

  handleSubmitQuizBtnClick() {
    this.learningPathActions.submitQuizAnswer();
    this.quizActions.submitAnswer();
  }
}
