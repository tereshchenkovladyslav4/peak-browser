import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Observable, Subscription, filter, take, tap } from 'rxjs';
import { Quiz, QuizAnswer, QuizQuestionType } from 'src/app/resources/models/content';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { QuizActionsService } from 'src/app/state/quiz/actions/quiz-actions.service';
import { QuestionData, QuizStateService } from 'src/app/state/quiz/quiz-state.service';
import { QuizResults } from '../../ui/quiz-results/quiz-results.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { ImageViewerComponent } from 'src/app/components/dialog/image-viewer/image-viewer.component';

@Component({
  selector: 'ep-quiz-view',
  templateUrl: './quiz-view.component.html',
  styleUrls: ['./quiz-view.component.scss']
})
export class QuizViewComponent implements OnInit, OnDestroy {
  @Input() quizContent: Quiz;

  @ViewChildren('textAnswer') activeTextAnswers: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChild('fillInTextarea') fillInTextarea: ElementRef<HTMLTextAreaElement>;

  QuizQuestionType = QuizQuestionType;

  isQuizLoaded$: Observable<boolean>;
  isQuizOpen$: Observable<boolean>;
  isQuizFinished$: Observable<boolean>;
  isFullScreen$: Observable<boolean>;
  questionData$: Observable<QuestionData>;
  quizResults$: Observable<QuizResults>;

  // multi q answers local state
  usersSelectedMultiAnswersIndices: { [key: number]: boolean };

  // textarea local state
  isTextareaFocused: boolean = false;
  isTextareaValueEmpty: boolean = true;

  totalCheckboxSelected: number = 0;

  private subscription = new Subscription();

  constructor(
    private layoutState: LayoutStateService,
    private quizState: QuizStateService,
    private quizActions: QuizActionsService,
    private dialogService: DialogService,
    private renderer2: Renderer2
  ) {
    
  }
  
  ngOnInit(): void {
    this.setIsQuizLoaded();
    this.setIsQuizOpen();
    this.setIsQuizFinished();
    this.manageLayout();
    this.setQuestionData();
    this.setQuizResults();
    this.resetTextarea();
  }

  ngOnDestroy(): void {
    this.quizActions.endQuiz();
    this.subscription.unsubscribe();
  }

  private setIsQuizLoaded() {
    this.isQuizLoaded$ = this.quizState.isQuizLoaded$;
  }

  private setIsQuizOpen() {
    this.isQuizOpen$ = this.quizState.isQuizOpen$;
  }

  private setIsQuizFinished() {
    this.isQuizFinished$ = this.quizState.isQuizFinished$;
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private setQuestionData() {
    this.questionData$ = this.quizState.questionData$.pipe(
      tap(questionData => {
        // reset multi answer local state when not a multi choice question
        if (questionData?.question?.questionType !== QuizQuestionType.ChooseMultipleAnswers) {
          this.usersSelectedMultiAnswersIndices = undefined;
        } else {
          this.usersSelectedMultiAnswersIndices = questionData?.question?.answers?.reduce((accObj, _, answerIndex) => {
            accObj[answerIndex] = false
            return accObj;
          }, {})
        }
      })
    );
  }

  private setQuizResults() {
    this.quizResults$ = this.quizState.quizResults$;
  }

  private resetTextarea() {
    const sub = this.quizState.questionIndex$
    .pipe(
      filter(_ => !!this.fillInTextarea),
      tap(_ => this.fillInTextarea.nativeElement.value = '')
    )
    .subscribe();

    this.subscription.add(sub);
  }

  checkboxAnswerSelected(element: HTMLElement, answerIndex: number) {
    const inputChild = element.querySelector('input') as HTMLInputElement
    inputChild.checked = !inputChild.checked;
    // update checked class on parent
    if (inputChild.checked) {
      this.renderer2.addClass(element, 'checked');
    } else {
      this.renderer2.removeClass(element, 'checked');
    }


    // update local state that tracks checked multiple choice answers
    this.usersSelectedMultiAnswersIndices[answerIndex] = inputChild.checked

    // iterate through keys of map that tracks checked multiple choice answers to create a single piped answer string
    const answerStr = Object
    .keys(this.usersSelectedMultiAnswersIndices)
    ?.filter(answerIndex => this.usersSelectedMultiAnswersIndices[answerIndex])
    ?.reduce((answerStr, answerIndex) => {
      const { mappedQuizQuestions, quizSession, questionIndex } = this.quizState.snapshot;
      const questionId = quizSession?.questions[questionIndex]?.questionId;
      const answer: QuizAnswer = mappedQuizQuestions[questionId]?.answers[answerIndex];
      const answerText = answer?.imageUrl ? `Image${Number(answerIndex) + 1}` : answer?.answerText;
      return answerStr + (answerStr ? '|' : '') + answerText;
    }, '')

    if (answerStr) {
      this.quizActions.answerSelected(answerStr);
    } else {
      this.quizActions.answerDeselected();
    }

    // post quiz tracking info?
  }

  radioAnswerSelected(element: HTMLElement) {
    const inputChild = element.querySelector('input') as HTMLInputElement

    // reset checked class from all textAnswer elements 
    this.activeTextAnswers.forEach(el => this.renderer2.removeClass(el.nativeElement, 'checked'));

    inputChild.checked = !inputChild.checked;
    if (inputChild.checked) {
      this.renderer2.addClass(element, 'checked');

      const value = inputChild?.value;
      // trigger state update
      this.quizActions.answerSelected(value);
    } else {
      this.quizActions.answerDeselected();
    }
  }

  textareaFocus(event: FocusEvent) {
    this.isTextareaFocused = true;
  }

  textareaBlur(event: FocusEvent) {
    this.isTextareaFocused = false;
  }

  textareaInputEvent(event: Event) {
    const textareaValue = (event.target as HTMLTextAreaElement)?.value;
    this.isTextareaValueEmpty = !textareaValue;
    if (!this.isTextareaValueEmpty) {
      this.quizActions.answerSelected(textareaValue);
    } else {
      this.quizActions.answerDeselected();
    }
  }

  openImageDialog(event: Event, imageName: string, imageUrl: string) {
    event?.stopPropagation();

    this.dialogService
    .open(ImageViewerComponent, {
      data: {
        config: {
          width: 'fit-content',
          height: 'fit-content',
          title: imageName,
          content: imageUrl
        }
      }
    })
    .afterClosed()
    .pipe(
      take(1)
    )
    .subscribe();
  }
}
