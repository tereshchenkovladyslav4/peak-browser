import { CourseContentAssignmentEnrollment } from "./assignment";
import { ContentType } from "./content";
import { QuizSession } from "./content/quiz";

export class PostEnrollmentTrackingItemRequest {
  courseId: string;
  contentId: string;
  contentType: ContentType;
  isComplete: boolean;
  startDate: Date;
  endDate: Date;
  // VIDEO
  isExternalVideo: boolean;
  videoLength: number;
  lastVideoPosition: number;
  // QUIZ
  quizSessionItem: QuizSession;
}

export class PostEnrollmentTrackingItemResponse {
  courseContentDetails: CourseContentAssignmentEnrollment;
}