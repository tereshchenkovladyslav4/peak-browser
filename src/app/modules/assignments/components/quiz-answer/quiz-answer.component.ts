import { Component, Input } from '@angular/core';
import { QuizResultsQuestion } from '../../../content/components/quiz/ui/quiz-results/quiz-results.component';
import { QuizQuestionType } from '../../../../resources/models/content';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'ep-quiz-answer',
  templateUrl: './quiz-answer.component.html',
  styleUrls: ['./quiz-answer.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule],
})
export class QuizAnswerComponent {
  @Input() question: QuizResultsQuestion;
  protected readonly QuizQuestionType = QuizQuestionType;
}
