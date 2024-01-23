import { AssignmentEnrollmentStatus } from "src/app/resources/models/assignment";
import { ContentType } from "src/app/resources/models/content";
import { QuizProgress, QuizStatus } from "src/app/resources/models/content/quiz";
import { QuizSettings } from "../../quiz/models/quiz-settings";

export interface CourseViewContent {
  contentId: string;
  name: string;
  contentType: ContentType;
  contentIconUrl: string;
  progress: number;
  status: AssignmentEnrollmentStatus;
  quizData: {
    settings: QuizSettings;
    progress: QuizProgress;
    status: QuizStatus;
    totalAttempts: number;
  }
}
