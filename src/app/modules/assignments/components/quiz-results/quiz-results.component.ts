import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogBaseComponent, DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { SharedModule } from '../../../shared/shared.module';
import { QuizStatus, QuizSummary } from '../../../../resources/models/content/quiz';
import { CircleProgressComponent } from '../../../../components/circle-progress/circle-progress.component';
import { CommonModule } from '@angular/common';
import { Quiz, QuizQuestionType } from '../../../../resources/models/content';
import { Observable, Subject, tap } from 'rxjs';
import { QuizStateService } from '../../../../state/quiz/quiz-state.service';
import { QuizResults } from '../../../content/components/quiz/ui/quiz-results/quiz-results.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { LabelValue } from '../../../../resources/models/label-value';
import { TranslationService } from '../../../../services/translation.service';
import { CalendarModule } from 'primeng/calendar';
import { QuizAnswerComponent } from '../quiz-answer/quiz-answer.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';

@Component({
  selector: 'ep-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss'],
  standalone: true,
  imports: [
    DialogBaseComponent,
    SharedModule,
    CircleProgressComponent,
    CommonModule,
    DropdownModule,
    FormsModule,
    CalendarModule,
    QuizAnswerComponent,
    LoadingComponent,
  ],
})
export class QuizResultsComponent extends DialogBaseComponent implements OnInit {
  readonly QuizQuestionType = QuizQuestionType;
  readonly QuizStatus = QuizStatus;
  quizResults$: Observable<QuizResults>;
  attemptIndex: number;
  attemptOptions: LabelValue[];
  isLoaded$ = new Subject<boolean>();
  @ViewChild('questions') questionsElement: ElementRef;

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public override data: {
      config?: DialogConfig;
      quizSummary: QuizSummary;
      enrollId: string;
      courseId: string;
    },
    private enrollmentService: EnrollmentService,
    private quizState: QuizStateService,
    private translationService: TranslationService,
  ) {
    super(dialogRef, data);
  }

  ngOnInit() {
    this.initState();
    this.initAttemptOptions();
    this.getEnrollmentContent();
  }

  initState() {
    this.quizState.reset();
    this.quizResults$ = this.quizState.quizResults$;
  }

  initAttemptOptions() {
    this.attemptOptions = (this.data.quizSummary?.sessions || [])
      .map((session, index) => {
        return {
          label: `${this.translationService.getTranslationFileData('assignments.attempt')} ${index + 1}`,
          value: index,
        };
      })
      .reverse();
  }

  getEnrollmentContent() {
    this.enrollmentService
      .getEnrollmentContentItem(this.data.enrollId, this.data.quizSummary.id)
      .pipe(
        tap((quiz: Quiz) => {
          this.quizState.updateQuiz(quiz);
          const mappedQuizQuestions = quiz?.questions?.reduce(
            (acc, q) => ({
              ...acc,
              [q.questionId]: q,
            }),
            {},
          );
          this.quizState.updateMappedQuizQuestions(mappedQuizQuestions);
          // Most recent quiz attempt is selected by default
          this.attemptIndex = this.data.quizSummary.sessions?.length - 1;
          this.updateSession();
          this.isLoaded$.next(true);
        }),
      )
      .subscribe();
  }

  updateSession() {
    const session = this.data.quizSummary.sessions[this.attemptIndex];
    this.quizState.updateQuizSession(session);
    // Ensure the quiz is marked as completed by updating the index with the latest question.
    this.quizState.updateQuestionIndex(session?.questions?.length);
  }

  handleChangeAttempt() {
    if (this.questionsElement?.nativeElement) this.questionsElement.nativeElement.scrollTop = 0;
    this.updateSession();
  }
}
