import { ContentType, QuizQuestionType } from '../content';

export class VideoTrackingItem {
  enrollmentId: string = '';
  contentId: string = '';
  lastVideoPosition: number = 0;
  isComplete: boolean = false;
}

export class CourseTracking {
  trackingId: string;
  courseId: string;
  contentId: string;
  startTime: Date;
  endTime: Date | null;
  contentType: ContentType;
  lastVideoTime: number;
  viewDuration: number;
  tenantId: string;
  enrollId: string;
  isComplete: boolean;
  quizAnswersCorrect: number;
  quizAnswersPossible: number;
  quizStatus: QuizStatus;
  quizAnswersPass: number;
  videoLength: number;
}

export class GetEnrollmentQuizTrackingItemResponse {
  quizAttemptsCount: number;
  mostRecentSession: QuizSession;
}

export class QuizSessionSimpleDTO {
  quizSessionId: string;
  isComplete: boolean;
}

export class QuizSession {
  quizSessionId: string = '00000000-0000-0000-0000-000000000000';
  quizId: string = '';
  enrollId: string = ''; //
  userId: string = '';
  startDatetime: Date = new Date();
  endDatetime: Date = new Date();
  isComplete: boolean = false;
  quizAnswersCorrect: number = 0;
  quizAnswersPossible: number = 0;
  quizAnswersPass: number = 0;
  quizStatus: QuizStatus;
  tenantId: string = '';
  questions: Array<TrackedQuestion> = new Array<TrackedQuestion>();
}

export class TrackedQuestion {
  quizTrackId: string = '';
  quizSessionId: string = ''; //
  questionId: string = '';
  tenantId: string = '';
  questionType: QuizQuestionType;
  isCorrect: boolean = false;
  questionText: string = '';
  givenAnswer: string = '';
  correctAnswer: string = '';
  seq: number = 0;
  isAnswered: boolean = false;
  answerDatetime: Date = new Date();
  explanation: string = '';
}

export class QuizProgress {
  totalQuestionsComplete: number;
  totalQuizQuestions: number;
}

export enum QuizStatus {
  Pass,
  Fail,
  InProgress,
  NotStarted,
  None,
}

export interface QuizSummary {
  id: string;
  name: string;
  courseName: string;
  attempts: number;
  quizAnswersPossible: number;
  quizAnswersCorrect: number;
  lastCompletionDate: Date;
  sessions: QuizSession[];
}
