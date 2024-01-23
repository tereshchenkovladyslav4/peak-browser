import { ContentType } from 'src/app/resources/models/content';
import { QuizStatus_T, ContentType_T, Content } from './class.content';
import { UserMultiSelect} from './class.users';
import { Observable } from 'rxjs';


export enum EnrollmentStatus_T {
    assigned = 0,
    inProgress = 1,
    completed = 2,
    dropped = 3
}

export enum EnrollmentFilter_T {
    all = 0,
    assigned = 1,
    inProgress = 2,
    completed = 3,
    dropped = 4
}

export class Enrollment {
    public enrollmentId: string = "";
    public courseId: string = "";
    public imageURL: string = "";
    public courseName: string = "";
    public learningPathName: string = "";
    public userId: string = "";
    public percentComplete: number = 0;
    public enrollmentStatus: EnrollmentStatus_T;
    public statusDate: Date = new Date();
    public hasDueDate: boolean = false;
    public dueDate: Date = new Date();
    public assignerUserId: string = "";
    public assignerDisplayName: string = "";
    public assignedDate: Date = new Date();
    public description: string = "";
    public isSelfEnrolled: boolean = false;
    public learningPathId: string = "";
    public subscriptionId: string = "";
    public sequence: number = 0;
    public isCustom: boolean = false;
    public childCourses: number = 0;
}

export interface CurrentEnrollment {
    learningPathName: string,
    courseName: string,
    userId: string,
    employeeID: string,
    userName: string,
    userEmail: string,
    enrollmentStatus: string,
    enrollmentProgress: number,
    enrollmentDueDate: Date,
    assignedByUser: string
}

export class EnrollmentPost {
    courseId: string = "";
    userId: string = "";
    hasDueDate: boolean = false;
    dueDate: Date = new Date();
}

export class EnrollmentTrackingItem {
    enrollmentId: string = "";
    contentId: string = "";
    contentType: ContentType_T = ContentType_T.cheatsheet;
    name: string = "";
    isComplete: boolean = false;
    classSessionDate: Date = new Date();
    classRegId: string = "";
    classSessionId: string = "";
    isClassRegistered: boolean = false;
    isCustomPassed: boolean = false;
    sequence: number = 0;
    URL: string = "";
    isTreeCollapsed: boolean = false;
    AllowQuizRetakes: boolean = false;
    MaxQuizAttempts: number = 1;
    ForceViewSequential: boolean = false;
    EnrollAttemptCount: number = 0;
    requireQuizzesPassed: boolean = false;
    quizStatus: string = "";
    quizQuestionsCorrect: number = 0;
    quizQuestionsPass: number = 0;
    quizQuestionsPossible: number = 0;
    scormRequireComplete: boolean = false;
    scormRequireScore: boolean = false;
    scormScoreToComplete: number = 0;
    contentObject: Content = new Content();
}

export class ClassSession {
    public sessionId: string = "";
    public classId: string = "";
    public className: string = "";
    public classDescription: string = "";
    public sessionDateTime: Date = new Date();
    public sessionURL: string = "";
    public sessionLocation: string = "";
    public sessionTenantId: string = "";
}

export class ClassRegistrant {
    public regId: string = "";
    public sessionId: string = "";
    public userId: string = "";
    public regTenantId: string = "";
    public orgName: string = "";
    public orgId: string = "";
    public displayName: string = "";
    public email: string = "";
    public attended: boolean = false;
}
export class ClassRegistrantPost {
    public sessionId: string = "";
    public attended: boolean = false;
}

export class EnrollmentTrackingItemPost {
    contentId: String = "";
    contentType: ContentType_T = ContentType_T.cheatsheet;
    isComplete: boolean = false;
    startDate: Date = new Date();
    endDate: Date = new Date();
}

export class EnrollmentQuizTrackingItemPost {
    contentId: String = "";
    isComplete: boolean = false;
    startDate: Date = new Date();
    endDate: Date = new Date();
    quizAnswersCorrect: number = 0;
    quizSessionItem: any; //quizSessionItem: Array<QuizSessionItem> = new Array<QuizSessionItem>(); 
}
export class EnrollmentVideoTrackingItemPost {
    contentId: String = "";
    isComplete: boolean = false;
    startDate: Date = new Date();
    endDate: Date = new Date();
    vidLength: number = 0;
    viewDuration: number = 0;
    lastVideoPosition: number = 0;
}

export class EnrollmentInBulk {
    bulkContent: Array<Content> = new Array<Content>();
    bulkUsers: Array<UserMultiSelect> = new Array<UserMultiSelect>();
    hasDueDate: boolean = false;
    dueDateStr: String = "";
}

export class BulkNotEnrolled {
    assignedToUserId: String = "";
    userName: String = "";
    reason: String = "";
    courseId: String = "";
    name: String = "";
}

export class CreateEnrollmentFromAssessmentRequest {
    public assignmentId: number = 0;
    public assessmentId: number = 0;
    public assessmentName: string = "";
    public bHasDueDate: boolean = false;
    public dueDate: Date = new Date();
    public templateMappings: Array<KSMappedAssessment> = [];
}


export class AssignTrainingForAssessmentCompletionRequest {
    public assignmentId: number = 0;
    public assessmentId: number = 0;
    public assessmentName: string = "";
    public bHasDueDate: boolean = false;
    public dueDate: Date = new Date();
    public templateMappings: Array<KSMappedAssessment> = [];

}


export class KSMappedAssessment {
    public ksAssessmentId: number = 0;
    public ksAssessmentName: string = "";
    public templateId: string = "";
    public templatePathAndName: string = "";
    public templateType: ContentType_T = ContentType_T.cheatsheet;
    public templateSubId: string = "";
    public templatePath: string = "";
}
