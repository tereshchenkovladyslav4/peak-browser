import { Component, Input } from '@angular/core';
import { QuizQuestionType } from 'src/app/resources/models/content';
import { QuizStatus } from 'src/app/resources/models/content/quiz';

export interface QuizResultsAnswer {
  answerText: string;
  answerImgUrl: string;
  isCorrect: boolean;
  selectedByUser: boolean;
  rowId: string; // generated on init of this obj for ui purposes
}

export interface QuizResultsQuestion {
  text: string;
  type: QuizQuestionType;
  imageUrl: string;
  userAnsweredCorrectly: boolean;
  givenAnswer: string; // for FillInText questions
  answers: QuizResultsAnswer[];
}

export interface QuizResults {
  percentage: number;
  isPassFail: boolean;
  passed: boolean;
  endDatetime: Date;
  questions: QuizResultsQuestion[];
}

@Component({
  selector: 'ep-quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss']
})
export class QuizResultsComponent {
  @Input() quizResults: QuizResults;

  readonly QuizQuestionType = QuizQuestionType;
  readonly QuizStatus = QuizStatus;
}
