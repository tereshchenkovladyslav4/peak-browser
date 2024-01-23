import { AssignmentEnrollmentStatus } from "src/app/resources/models/assignment";
import { CourseViewContent } from "./course-view-content";
import { CourseSettings } from "./course-settings";
import { ContentType } from "src/app/resources/models/content";
import { QuizStatus } from "src/app/resources/models/content/quiz";

export interface CourseViewData {
  learningPathId: string;
  courseId: string;
  enrollmentId: string;
  name: string;
  plainDesc: string;
  htmlDesc: string;
  duration: string;
  content: CourseViewContent[];
  progress: number;
  status: AssignmentEnrollmentStatus;
  settings: CourseSettings;
  isEnrolled: boolean; // view logic
  contentIconUrl: string; // view logic
  actionBtnText: string; //view logic
}

export function getContentIndexToResume(course: CourseViewData) {
  return course?.content?.findIndex(c => 
    c.status !== AssignmentEnrollmentStatus.Completed
    || (c.contentType === ContentType.Quiz
      && course?.settings?.mustViewContentInOrder
      && course?.settings?.mustPassQuiz
      && c.quizData?.settings?.requirePassingScore
      && c.quizData.status !== QuizStatus.Pass));
}

export function hasToDropCourse(course: CourseViewData) {
  if (!course?.settings?.mustPassQuiz) return false;

  return course?.content?.some(c => c.contentType === ContentType.Quiz 
    && c.quizData.settings.requirePassingScore
    && c.quizData.status === QuizStatus.Fail
    && c?.quizData?.totalAttempts === course?.settings.maxQuizAttempts)
}

export function hasRequiredQuizAttemptsRemaining(course: CourseViewData) {
  if (!course?.settings?.mustPassQuiz) return false;

  return course?.content?.some(c => c?.contentType === ContentType.Quiz 
    && c?.quizData?.settings?.requirePassingScore
    && c?.quizData?.status !== QuizStatus.Pass
    && c?.quizData?.totalAttempts < course?.settings.maxQuizAttempts)
}

export function hasFailedAnyQuiz(course: CourseViewData) {
  return course?.content?.some(c => c?.contentType === ContentType.Quiz && c?.quizData?.status === QuizStatus.Fail)
}