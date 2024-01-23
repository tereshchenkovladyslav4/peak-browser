import { ContentType_T } from "./class.content";

export class TenantSetting {
  settingName: string = "";
  settingType: string = "";
  settingValue: string | number = null;
}

export class GetAllTenantSettingsResponse {
  public settings: TenantSetting[];
}

export class UserExpertise {
    public expertiseId: string = "";
    public expertiseName: string = "";
}

export class GetExpertiseResponse {
    public expertise: UserExpertise[];
} 


export class ModifyUserExpertiseRequest {
    public expertiseIdsToRemove: string[];
    public expertiseIdsToAdd: string[];
}

export class ModifyUserExpertiseResponse {
    public expertiseAdded: string[];
    public expertiseRemoved: string[];
}

export class GetKnowledgeSmartResponse {
    public knowledgeSmartConfiguration: KnowledgeSmartConfiguration;
}

export class KnowledgeSmartConfiguration {
    public knowledgeSmartAPI_Key: string = "";
    public useKnowledgeSmartIntegration: boolean = false;        
    public assessmentSelfEnroll: boolean = false;
}



export class KS_UI_Options {
    public id: number = 0;
    public displaySkipQuestionButton: boolean = false; 
    public displayRequestTrainingButton: boolean = false;
    public displayUserDataCapturePage1Start: boolean = false;
    public displayUserDataCapturePage2End: boolean = false;
    public hideTestLogoutLink: boolean = false;
    public enableUserPageAccess: boolean = false;
    public showDigitalProctoringMessage: boolean = false;
}

export class GetAllAssessmentsResponse {
    public KSAssessments: Array<KSAssessment> = [];
}

export class KSAssessment {
    public testID: number = 0;
    public name: string = "";
    public fullName: string = "";
    public description: string = "";
    public timeLimitMins: string = "";
    public offTheShelf: boolean = false;
    public published: boolean = false;
}

export class GetAssignmentResultsForUserResponse {
    public ksResults: Array<KSResult> = [];
}

export class KSResult {
    public userId: string = "";
    public forename: string = "";
    public surname: string = "";
    public userStatus: string = "";
    public loweredEmail: string = "";
    public score: number = 0;
    public testDate: Date = new Date();
    public lastKnownTime: Date = new Date();
    public totalElapsedTimeMins: number = 0;
    public testName: string = "";
    public resultID: number = 0;
    public timeMins: number = 0;
    public testId: number = 0;
    public assessmentID: number = 0;
    public isExam: boolean = false;
    public showScore: boolean = false;

}

export class GetAssignmentsNotStartedForUserResponse {
    public ksAssignments: Array<KSAssignment> = [];
}
export class GetAssignmentsInProgressForUserResponse {
    public ksAssignments: Array<KSAssignment> = [];
}

export class KSAssignment {
    public assessmentID: number = 0;
    public testID: number = 0;
    public sentDate: Date = new Date();
    public expiryDate: Date = new Date();
    public testName: string = "";
    public status: string = "";
    public userId: string = "";
    public forename: string = "";
    public surname: string = "";
    public email: string = "";
}

export class GetContentFromAssessmentResponse {
    public actionIds: Array<string> = [];
    public assessmentAction: AssessmentActionType;
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

export class GetAssessmentsFromContentResponse {
    public templateMappings: Array<KSMappedAssessment> = [];
}

export enum AssessmentActionType {
    Enroll,
    Navigate,
    None
}


export class KSUser {
    public userInfoForAccountID: number = 0;
    public accountID: number = 0;
    public  applicationId: string = "";
    public  userID: string = "";
    public  userName: string = "";
    public  loweredUserName: string = "";
    public  mobileAlias: string = "";
    public isAnonymous: boolean = false;
    public  email: string = "";
    public  forename: string = "";
    public  surname: string = "";
    public  status: string = "";
    public companyName: string = "";
}

export class AssignAssessmentResponse {
    public assessmentId: number = 0;
}
export class AssignAssessmentRequest {
    public userEmail: string = "";
    public testID: number = 0;
    public displayName: string = "";
    public status: string = "";
    public hasExpiryDate:boolean
    public expiryDate: Date = new Date();
}

export class TermsAndConditionsAcceptedKSResponse {
    public policyId: string = "";
    public acceptedTermsAndConditions: boolean = false;

    public termsAndConditionsType: string = "";
    public acceptedDate: string
}
