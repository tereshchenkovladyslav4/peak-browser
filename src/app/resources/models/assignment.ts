import { QuizSettings } from "src/app/modules/content/components/quiz/models/quiz-settings";
import { Course, CourseContentSummary, CourseSummary } from "./content";
import { QuizProgress, QuizStatus } from "./content/quiz";

export class AssignmentEnrollment {
  enrollmentId: string;
  status: AssignmentEnrollmentStatus;
  progress: number;
}

export class CourseContentAssignmentEnrollment extends CourseContentSummary {
  assignmentDetails: AssignmentEnrollment;
  quizStatus: QuizStatus;
  quizProgress: QuizProgress;
  quizSettings: QuizSettings;
  totalQuizAttempts: number;
}

export class CourseAssignment extends CourseSummary {
  courseDetails: Course;
  assignmentDetails: AssignmentEnrollment;
  contentDetails: CourseContentAssignmentEnrollment[];
}

export class LearningPathUserAssignmentsResponse {
  courseAssignments: CourseAssignment[];
}

export enum AssignmentStatusFilter {
  All,
  CurrentlyEnrolled,
  Completed,
  Dropped,
  Expired
}

export enum AssignmentEnrollmentStatus {
  Not_Started,
  In_Progress,
  Completed,
  Dropped,
  Expired
}

export interface AssignmentAssignor {
  userId: string;
  imageUrl: string;
  displayName: string;
  email: string
}

export interface Assignment {
  user: {
    userId: string;
    imageUrl: string;
    displayName: string;
    email: string
  },
  enrollmentId: string;
  contentDetails: {
    id: string;
    tenantId: string;
    type: string;
    documentType: string;
    name: string;
    plainDescription: string;
    created: string;
    imageUrl: string
  },
  assignors: AssignmentAssignor[],
  assignedDate: string;
  dueDate: string;
  completedDate: string;
  droppedDate: string;
  status: string;
  progress: number;
  fromAssessment: true
  assessment: {
    userStatus: string;
    user: {
      userId: string;
      imageUrl: string;
      displayName: string;
      email: string
    },
    assessmentID: number;
    testID: number;
    sentDate: string;
    expiryDate: string;
    testName: string;
    status: string;
    userId: string;
    forename: string;
    surname: string;
    email: string;
  },
  learningPath: {
    associatedTopics: any,
    blobURL: any,
    certificate: any,
    courses: any[],
    created: any,
    description: any,
    difficulty: number,
    documentType: any,
    duration: number,
    id: string,
    imageUrl: any,
    keywords: any,
    language: any,
    lastModified: any,
    lastModifiedBy: any,
    lastTouched: any,
    libraries: any,
    name: any,
    parentId: string,
    plainDescription: any,
    prerequisites: any,
    publisher: any,
    relatedLearningCommands: any,
    status: number,
    statusBy: { userId: string, imageUrl: string, displayName: string, email: string },
    statusDate: any,
    tenantId: string,
    type: number,
    userCanEdit: boolean,
    userCanPublish: boolean,
  }
  course: Course,
  hasMultiple?: boolean,
  siblings: Assignment[],
  contentType: string
}

export interface AssignmentHistory {
  id: any;
  name: string;
  learningPathId: string;
  learningPathName: string;
  courseId: string;
  contentType: any;
  status: AssignmentEnrollmentStatus;
  statusLabel: string;
  statusStyles: {
    color: string;
    ['background-color']: string;
  },
  statusIcon: string;
  statusDate: any;
  dropdownItems: any;
  progress: number;
  assignedBy: string;
  duration: string;
}

export interface CreateAssignmentOfContentResult {
  assigneeId: string;
  contentId: string;
}

export interface CreateAssignmentOfContentResponse {
  userContentIdsAdded: CreateAssignmentOfContentResult[];
  userContentIdsNotAdded: CreateAssignmentOfContentResult[];
}
