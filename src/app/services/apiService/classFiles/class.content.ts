export enum ContentType_T {
	cheatsheet = 0,
	learningpath = 1,
	course = 2,
	quiz = 3,
	video = 4,
	workflow = 5,
	process = 6,
	task = 7,
    step = 8,
    chatLog = 9,
	workgroup = 10,
    trainingclass = 11,
    scormcourse = 12,
    bentleycourse = 13,
    extendedSearch = 99
}

export enum ContentFilter_T {
    tenantOnly,
    tenantAndSubscription
}


export enum DescriptionFilter_T {
	formatted = 0,
	unformatted = 1,
	none = 2
}

export enum QuizQuestionType_T {
	multipleChoiceMultiSelect = 0,
	multipleChoiceSingleSelect = 1,
	trueFalse = 2,
	fillInBlank = 3
}

export enum QuizStatus_T {
	pass = 0,
	fail =1
}

export enum ToolType_T {
	Hyperlink = 0,
	EPCommand = 1,
	CadCommand = 2,
	PSContent = 3,
	Civil3DCommand = 4,
	AppCommand = 5,
	Application = 6
}

export enum DiagramFillType_T {
    solid,
    gradientVert,
    gradientVertFull,
    gradientHorz,
    gradientHorzFull
};


export enum DiagramAlignHorz_T {
    left,
    center,
    right
}

export enum DiagramAlignVert_T {
    top,
    center,
    bottom
}

export enum DiagramTextOrient_T {
    horizontal,
    vertical
}

export enum DiagramTextSize_T {
    largest,
    large,
    medium,
    small
}

export class Content {
	contentId: string = "";
	contentType: ContentType_T = ContentType_T.cheatsheet;
	name: string = "";
	description: string = "";
    providedBy: string = "";
  imageURL: string = "";
    bisCustom: boolean = false;
    docURL: string = "";
    bisDownloadable: boolean = false;
    userHasAccess: boolean = false;
}

export class ContentUsedProduct {
  ID: string = "";
  Name: string = "";
  Versions: Array<ContentUsedProductVersion> = new Array<ContentUsedProductVersion>();
  TenantID: string = "";
  ImageURL: string = "";
}

export class ContentUsedProductVersion {
  ID: string = "";
  Name: string = "";
  ProductId: string = "";
  TenantId: string = "";
}

export class ChatLog {
    public chatId: string = "";
    public name: string = "";
    public messages: ChatLogMessage[] = [];
}
export class ChatLogMessage {
    public displayName: string = "";
    public email: string = "";
    public timeSent: Date = new Date();
    public message: string = "";
    public imageURL: string = "";
}

export class Workflow {
	workflowId: string = "";
	name: string = "";
	description: string = "";
	publishDate: Date = new Date();
	providedBy: string = "";
}

export class Process {
	processId: string = "";
	workflowId: string = "";
	departmentId: string = "";
	name: string = "";
	description: string = "";
	sequence: number = 0;
	providedBy: string = "";
}

export class Task {
	taskId: string = "";
	processId: string = "";
	roleId: string = "";
	name: string = "";
	description: string = "";
	isMilestone: boolean = false;
	sequence: number = 0;
    providedBy: string = "";
    isDoc: boolean = false; 
    docID: string = "";
    isDownloadable: boolean = false;
    externalURL: string = "";
}

export class Step {
	stepId: string = "";
	taskId: string = "";
	name: string = "";
	description: string = "";
	sequence: number = 0;
    providedBy: string = "";
    isDoc: boolean = false;
    docID: string = "";
    isDownloadable: boolean = false;
    externalURL: string = "";
}

export class CheatSheet {
	cheatId: string = "";
	name: string = "";
	description: string = "";
    useExternalDoc: boolean = false;
	externalDocURL: string = "";
	publishDate: Date = new Date();
  providedBy: string = "";
    bisCustom: boolean = false;
    bisDownloadable: boolean = false;
}

export class Video {
    public videoId: string = "";
    public name: string = "";
    public description: string = "";
    public videoURL: string = "";
    public transcriptURL: string = "";
    public bookmarkURL: string = "";
    public hasTranscript: boolean = false;
    public hasBookmark: boolean = false;
    public videoPosition: number = 0;
    public publishDate: Date = new Date();
    public providedBy: string = "";
}

export class Bookmark {
	bookmarkId: string = "";
	videoID: string = "";
	name: string = "";
	videoPosition: number = 0;
}

export class ClassContentItem {
    public classId: string = "";
    public name: string = "";
    public description: string = "";
    public archivedVideoURL: string = "";
    public hasTranscript: boolean = false;
    public transcriptURL: string = "";
    public duration: number = 0;
}

export class LearningPath {
	learningPathId: string = "";
	name: string = "";
	description: string = "";
	isPublic: boolean = false;
	publishDate: Date = new Date();
	providedBy: string = "";
}

export class Course {
	courseId: string = "";
	learningPathId: string = "";
	name: string = "";
	version: string = "";
	description: string = "";
	sequence: number = 0;
    providedBy: string = "";
    isScormCourse: boolean = false;
    scormPackagePath: string = "";
    scormPackageUploadDateTime: Date = new Date();
    duration: number = 0;
}

export class CourseWithContent {
    courseId: string = "";
    learningPathId: string = "";
    name: string = "";
    version: string = "";
    description: string = "";
    sequence: number = 0;
    providedBy: string = "";
    content: Array<Content> = new Array<Content>();
    isScormCourse: boolean = false;
    scormPackagePath: string = "";
    scormPackageUploadDateTime: Date = new Date();
    duration: number = 0;
}

export class Quiz {
	quizId: string = "";
	name: string = "";
	description: string = "";
	usePassingNumber: boolean = false;
	passingNumber: number = 0;
	publishDate: Date = new Date();
    providedBy: string = "";
    //072019 q-enh
    useLimitedQs: boolean = false;
    limitedQs: number = 0;
    randomOrder: boolean = false;
    status: string = ""; // added for passing from quizcontent->learningcentercourseviewer. Don't rely on this from anywhere else
}

export class QuizQuestion {
	questionId: string = "";
  quizId: string = "";
  questionType: QuizQuestionType_T = QuizQuestionType_T.multipleChoiceMultiSelect;
    questionText: string = "";
	useImage: boolean = false;
	imageURL: string = "";
    sequence: number = 0;
    //072019 q-enh
    explanation: string = "";
}

export class QuizAnswer {
	answerId: string = "";
	questionId: string = "";
	answerText: string = "";
	isAnswer: boolean = false;
    sequence: number = 0;
    //072019 q-enh
    hasImage: boolean = false;
    imageUrl: string = "";
}

export class Tool {
	toolId: string = "";
	parentId: string = "";
  name: string = "";
  toolType: ToolType_T = ToolType_T.AppCommand;
	command: string = "";
	sequence: number = 0;
}

export class Comment {
    public commentId: string = "";
    public contentId: string = "";
    public contentType: ContentType_T = ContentType_T.cheatsheet;
    public userId: string = "";
    public name: string = "";
    public imageURL: string = "";
  public commentText: string = "";
  public publishDate: Date = new Date();
}

export class DiagramObject {
    contentId: string = "";
    name: string = "";
    assignedTo: string = "";
    contentType: ContentType_T = ContentType_T.cheatsheet;
    description: string = "";
    color1: number = 0;
    color2: number = 0;
    basePtX: number = 0;
    basePtY: number = 0;
    textColor: number = 0;
    borderColor: number = 0;
    sizeX: number = 0;
    sizeY: number = 0;
  isDisabled: boolean = false;
  textAlignHorz: DiagramAlignHorz_T = DiagramAlignHorz_T.center;
  textAlignVert: DiagramAlignVert_T = DiagramAlignVert_T.center;
  textOrient: DiagramTextOrient_T = DiagramTextOrient_T.horizontal;
  textSize: DiagramTextSize_T = DiagramTextSize_T.medium;
    isDecision: boolean = false;
    isMilestone: boolean = false;
    isSwimlane: boolean = false;
    seq: number = 0;
  seqPrefix: string = "";
  FillType: DiagramFillType_T = DiagramFillType_T.solid;
}

export class DiagramPoint {
    x: number = 0;
    y: number = 0;
}


export class DiagramLine {
    objectId1: string = "";
    objectId2: string = "";
    gripIndex1: number = 0;
    gripIndex2: number = 0;
    label: string = "";
    linePoints: Array<DiagramPoint> = [];
  arrowPoints: Array<DiagramPoint> = [];
  labelPoints: DiagramPoint = new DiagramPoint();
  labelAnchor: string = "";
}


export class DiagramView{
    viewId: string = "";
    topLeftX: number = 0;
    topLeftY: number = 0;
    zoomFactor: number = 0;
    objects: Array<DiagramObject> = [];
  lines: Array<DiagramLine> = [];
}

export class ExtensionDataObject {

}

//export class ContentProduct {
//  ExtensionData: ExtensionDataObject;
//  ID: string = "";
//  ImageURL: string = "";
//  Name: string = "";
//  TenantID: string = "";
//  Versions: Array<ContentProductVersion> = [];
//  ischecked: boolean = false;
//}

//export class ContentProductVersion {
//  extensionData: ExtensionDataObject;
//  ID: string = "";
//  Name: string = "";
//  ProductID: string = "";
//  TenantID: string = "";
//  ischecked: boolean = false;
//}

export class ContentProduct {
  ID: string = "";
  Name: string = "";
  Versions: Array<ContentProductVersion> = new Array<ContentProductVersion>();
  TenantID: string = "";
  ImageURL: string = "";
  ischecked: boolean = false;
}

export class ContentProductVersion {
  ID: string = "";
  Name: string = "";
  ProductId: string = "";
  TenantId: string = "";
  ischecked: boolean = false;
}

export class WebVideoTextTracksCue {
  count: string = "";
  end: string = "";
  start: string = "";
  text: string = "";
  focus: boolean = false;
}

export enum PSType_1310 {
    PS_Folder,
    PS_Swimlane,
    PS_Workflow,
    PS_Process,
    PS_Task,
    PS_Milestone,
    PS_Step,
    PS_VidTutorial,
    PS_VidArchive,
    PS_VidUser,
    PS_Cheat,
    PS_ChatLog,
    PS_Favorite,
    PS_History,
    PS_Tool,
    PS_Class,
    PS_LearningPath,
    PS_Course,
    PS_Quiz,
    PS_PeerChat,
    PS_ExpertChat,
    PS_ExpertEmail,
    PS_ExpertPhone,
    PS_Document,
    PS_Workgroup
};

export class ContentPrerequisiteInfo {
    // The ID of the content requiring the prerequisites (guid)
    contentID: string = "";
    // The type of the content requiring the prerequisites (pstype_1310)
  //contentType: string = "";
  contentType: PSType_1310 = PSType_1310.PS_Cheat;
    // The name of the content requiring the prerequisite
    contentName: string = "";
    // The ID of the content's LP if the content is a course, Guid.Empty if not (guid)
    courseLPID: string = "";
    // The name of the content's LP if the content is a course, empty string if not
    courseLPName: string = "";
    // The content items being required
    prerequisites: Array<ContentPrerequisite> = new Array<ContentPrerequisite>();
  }

export class ContentPrerequisite {
    // The unique ID of the record in lp_course_prerequisites (Guid)
    ID: string = "";
    // The ID of the content requiring the prerequisite (Guid)
    contentID: string = "";
    // The type of the content requiring the prerequisite (PSType_1310)
    contentType: string = "";
    // The ID of the prerequisite item (Guid)
    prereqID: string = "";
    // The type of the prerequisite item (PSType_1310)
    //prereqType: string = "";
    prereqType: PSType_1310 = PSType_1310.PS_Cheat;
    // The name of the prerequisite item, empty string if not
    prereqName: string = "";
    // The ID of the prerequisite's LP if the prerequisite is a course, Guid.Empty if not (Guid)
    prereqLPID: string = "";
    // The name of the prerequisite's LP if the prerequisite is a course, empty string if not
    prereqLPName: string = "";
}

export class ContentAuthoring {
    contentId: string = "";
    lastModBy: string = "";
    lastModDate: Date = new Date(); 
    lastModDateStr: string = "";
}

export class ScormDataModel {
    cmi: ScormCMI = new ScormCMI();

    isCompleted(): boolean {
        if (this.cmi.core.credit == "credit"
            || this.cmi.core.lesson_status == "passed"
            || this.cmi.core.lesson_status == "completed"
            || this.cmi.core.lesson_status == "failed")
            return true;
        else
            return false;
    }

    get(): any {
        try {
            let result = {
                cmi: {
                    core: {
                        credit: this.cmi.core.credit,
                        entry: this.cmi.core.entry,
                        exit: this.cmi.core.exit,
                        lesson_location: this.cmi.core.lesson_location,
                        lesson_mode: this.cmi.core.lesson_mode,
                        lesson_status: this.cmi.core.lesson_status,
                        score: {
                            max: this.cmi.core.score.max,
                            min: this.cmi.core.score.min,
                            raw: this.cmi.core.score.raw
                        },
                        student_id: this.cmi.core.student_id,
                        student_name: this.cmi.core.student_name,
                        session_time: this.cmi.core.session_time,
                        total_time: this.cmi.core.total_time
                    },
                    comments: this.cmi.comments,
                    comments_from_lms: this.cmi.comments_from_lms,
                    interactions: [],
                    objectives: [],
                    student_data: {
                        mastery_score: this.cmi.student_data.mastery_score,
                        max_time_allowed: this.cmi.student_data.max_time_allowed,
                        time_limit_action: this.cmi.student_data.time_limit_action
                    },
                    student_preference: {
                        audio: this.cmi.student_preference.audio,
                        language: this.cmi.student_preference.language,
                        speed: this.cmi.student_preference.speed,
                        text: this.cmi.student_preference.text
                    },
                    suspend_data: this.cmi.suspend_data
                }
            };
            for (let i = 0; i < this.cmi.interactions.length; i++) {
                result.cmi.interactions[i] = {
                    correct_responses: [],
                    id: this.cmi.interactions[i].id,
                    latency: this.cmi.interactions[i].latency,
                    objectives: [],
                    result: this.cmi.interactions[i].result,
                    student_response: this.cmi.interactions[i].student_response,
                    time: this.cmi.interactions[i].time,
                    type: this.cmi.interactions[i].type,
                    weighting: this.cmi.interactions[i].weighting
                };
                for (let j = 0; j < this.cmi.interactions[i].correct_responses.length; j++) {
                    result.cmi.interactions[i].correct_responses[j] = {
                        pattern: this.cmi.interactions[i].correct_responses[j].pattern
                    };
                }
                for (let j = 0; j < this.cmi.interactions[i].objectives.length; j++) {
                    result.cmi.interactions[i].objectives[j] = {
                        id: this.cmi.interactions[i].objectives[j].id
                    };
                }
            }
            for (let i = 0; i < this.cmi.objectives.length; i++) {
                result.cmi.objectives[i] = {
                    id: this.cmi.objectives[i].id,
                    score: {
                        max: this.cmi.objectives[i].score.max,
                        min: this.cmi.objectives[i].score.min,
                        raw: this.cmi.objectives[i].score.raw
                    },
                    status: this.cmi.objectives[i].status
                };
            }
            return result;
        }
        catch (err) {
            return null;
        }
    }

    set(newData: any): ScormDataModel {
        try {
            //console.log("newData: ", newData);
            if (newData.cmi.core.credit != undefined)
                this.cmi.core.credit = newData.cmi.core.credit;
            if (newData.cmi.core.entry != undefined)
                this.cmi.core.entry = newData.cmi.core.entry;
            if (newData.cmi.core.exit != undefined)
                this.cmi.core.exit = newData.cmi.core.exit;
            if (newData.cmi.core.lesson_location != undefined)
                this.cmi.core.lesson_location = newData.cmi.core.lesson_location;
            if (newData.cmi.core.lesson_mode != undefined)
                this.cmi.core.lesson_mode = newData.cmi.core.lesson_mode;
            if (newData.cmi.core.lesson_status != undefined)
                this.cmi.core.lesson_status = newData.cmi.core.lesson_status;
            if (newData.cmi.core.score.max != undefined)
                this.cmi.core.score.max = newData.cmi.core.score.max;
            if (newData.cmi.core.score.min != undefined)
                this.cmi.core.score.min = newData.cmi.core.score.min;
            if (newData.cmi.core.score.raw != undefined)
                this.cmi.core.score.raw = newData.cmi.core.score.raw;
            if (newData.cmi.core.student_id != undefined)
                this.cmi.core.student_id = newData.cmi.core.student_id;
            if (newData.cmi.core.student_name != undefined)
                this.cmi.core.student_name = newData.cmi.core.student_name;
            if (newData.cmi.core.session_time != undefined)
                this.cmi.core.session_time = newData.cmi.core.session_time;
            if (newData.cmi.core.total_time != undefined)
                this.cmi.core.total_time = newData.cmi.core.total_time;
            if (newData.cmi.comments != undefined)
                this.cmi.comments = newData.cmi.comments;
            this.cmi.interactions = [];
            if (newData.cmi.interactions != undefined) {
                for (let i = 0; i < newData.cmi.interactions.length; i++) {
                    let temp = new ScormInteraction();
                    temp.correct_responses = [];
                    let values;
                    if (newData.cmi.interactions[i].correct_responses != undefined) {
                        values = Object.values(newData.cmi.interactions[i].correct_responses);
                        for (let j = 0; j < values.length; j++) {
                            let temp2 = new ScormCorrectResponse();
                            temp2.pattern = (values[j] as any).pattern;
                            temp.correct_responses.push(temp2);
                        }
                    }
                    if (newData.cmi.interactions[i].id != undefined)
                        temp.id = newData.cmi.interactions[i].id;
                    if (newData.cmi.interactions[i].latency != undefined)
                        temp.latency = newData.cmi.interactions[i].latency;
                    temp.objectives = [];
                    if (newData.cmi.interactions[i].objectives != undefined) {
                        values = Object.values(newData.cmi.interactions[i].objectives);
                        for (let j = 0; j < values.length; j++) {
                            let temp2 = new ScormObjective();
                            if (values[j].id != undefined) {
                                temp2.id = (values[j] as any).id;
                                temp.objectives.push(temp2);
                            }
                        }
                    }
                    if (newData.cmi.interactions[i].result != undefined)
                        temp.result = newData.cmi.interactions[i].result;
                    if (newData.cmi.interactions[i].student_response != undefined)
                        temp.student_response = newData.cmi.interactions[i].student_response;
                    if (newData.cmi.interactions[i].time != undefined)
                        temp.time = newData.cmi.interactions[i].time;
                    if (newData.cmi.interactions[i].type != undefined)
                        temp.type = newData.cmi.interactions[i].type;
                    if (newData.cmi.interactions[i].weighting != undefined)
                        temp.weighting = newData.cmi.interactions[i].weighting;
                    this.cmi.interactions.push(temp);
                }
            }
            this.cmi.objectives = [];
            let values = [];
            if (newData.cmi.objectives != undefined)
                values = Object.values(newData.cmi.objectives);
            for (let i = 0; i < values.length; i++) {
                let temp = new ScormObjective();
                if (values[i] != undefined)
                    temp.id = (values[i] as any).id;
                if (values[i].score != undefined) {
                    if (values[i].score.max != undefined)
                        temp.score.max = (values[i] as any).score.max;
                    if (values[i].score.min != undefined)
                        temp.score.min = (values[i] as any).score.min;
                    if (values[i].score.raw != undefined)
                        temp.score.raw = (values[i] as any).score.raw;
                }
                if (values[i].status != undefined)
                    temp.status = (values[i] as any).status;
                this.cmi.objectives.push(temp);
            }
            if (newData.cmi.student_data != undefined) {
                if (newData.cmi.student_data.mastery_score != undefined)
                    this.cmi.student_data.mastery_score = newData.cmi.student_data.mastery_score;
                if (newData.cmi.student_data.max_time_allowed != undefined)
                    this.cmi.student_data.max_time_allowed = newData.cmi.student_data.max_time_allowed;
                if (newData.cmi.student_data.time_limit_action != undefined)
                    this.cmi.student_data.time_limit_action = newData.cmi.student_data.time_limit_action;
            }
            if (newData.cmi.student_preference != undefined) {
                if (newData.cmi.student_preference.audio != undefined)
                    this.cmi.student_preference.audio = newData.cmi.student_preference.audio;
                if (newData.cmi.student_preference.language != undefined)
                    this.cmi.student_preference.language = newData.cmi.student_preference.language;
                if (newData.cmi.student_preference.speed != undefined)
                    this.cmi.student_preference.speed = newData.cmi.student_preference.speed;
                if (newData.cmi.student_preference.text != undefined)
                    this.cmi.student_preference.text = newData.cmi.student_preference.text;
            }
            if (newData.cmi.suspend_data != undefined)
                this.cmi.suspend_data = newData.cmi.suspend_data;
            if (newData.cmi.launch_data != undefined)
                this.cmi.launch_data = newData.cmi.launch_data;
            return this;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
}

export class ScormCMI {
    core: ScormCore = new ScormCore();
    suspend_data: string = "";
    launch_data: string = "";
    comments: string = "";
    comments_from_lms: string = "";
    objectives: ScormObjective[] = [];
    student_data: ScormStudentData = new ScormStudentData();
    student_preference: ScormStudentPreference = new ScormStudentPreference();
    interactions: ScormInteraction[] = [];
}

export class ScormCore {
    student_id: string = "";
    student_name: string = "";
    lesson_location: string = "";
    credit: string = ""; // "credit", "no-credit"
    lesson_status: string = ""; // "passed", "completed", "failed", "incomplete", "browsed", "not attempted"
    entry: string = ""; // "ab-initio", "resume", ""
    score: ScormScore = new ScormScore();
    total_time: string = "";
    lesson_mode: string = ""; // "browse", "normal", "review"
    exit: string = ""; // "time-out", "suspend", "logout"
    session_time: string = "";
}

export class ScormScore {
    raw: number = 0;
    max: number = 0;
    min: number = 0;
}

export class ScormObjective {
    id: string = "";
    score: ScormScore = new ScormScore();
    status: string = ""; // "passed", "completed", "failed", "incomplete", "browsed", "not attempted"
}

export class ScormStudentData {
    mastery_score: number = 0;
    max_time_allowed: string = "";
    time_limit_action: string = ""; // "exit,message", "exit,no message", "continue,message", "continue,no message"
}

export class ScormStudentPreference {
    audio: number = 0;
    language: string = "";
    speed: number = 1;
    text: number = 0;
}

export class ScormInteraction {
    id: string = "";
    objectives: ScormObjective[] = [];
    time: string = "";
    type: string = ""; // "true-false", "choice", "fill-in", "matching", "performance", "sequencing", "likert", "numeric"
    correct_responses: ScormCorrectResponse[] = [];
    weighting: number = 1;
    student_response: string = "";
    result: string = ""; // "correct", "wrong", "unanticipated", "neutral", "X.X [CMIDecimal]"
    latency: string = "";
}

export class ScormCorrectResponse {
    pattern: string = "";
}



export class ScormDataModel2004 {
    cmi: ScormCMI2004 = new ScormCMI2004();

    isComplete(): boolean {
        if (this.cmi.credit == "credit"
            || this.cmi.completion_status == "completed"
            || this.cmi.completion_threshold == 1
            || this.cmi.progress_measure == 1
            || this.cmi.success_status == "passed")
            return true;
        else
            return false;
    }

    get(): any {
        try {
            let result = {
                cmi: {
                    comments_from_learner: [],
                    comments_from_lms: [],
                    completion_status: this.cmi.completion_status,
                    completion_threshold: this.cmi.completion_threshold,
                    credit: this.cmi.credit,
                    entry: this.cmi.entry,
                    exit: this.cmi.exit,
                    interactions: [],
                    learner_id: this.cmi.learner_id,
                    learner_name: this.cmi.learner_name,
                    learner_preference: {
                        audio_captioning: this.cmi.learner_preference.audio_captioning,
                        audio_level: this.cmi.learner_preference.audio_level,
                        delivery_speed: this.cmi.learner_preference.delivery_speed,
                        language: this.cmi.learner_preference.language
                    },
                    location: this.cmi.location,
                    max_time_allowed: this.cmi.max_time_allowed,
                    mode: this.cmi.mode,
                    objectives: [],
                    progress_measure: this.cmi.progress_measure,
                    scaled_passing_score: this.cmi.scaled_passing_score,
                    score: {
                        max: this.cmi.score.max,
                        min: this.cmi.score.min,
                        raw: this.cmi.score.raw,
                        scaled: this.cmi.score.scaled
                    },
                    session_time: this.cmi.session_time,
                    success_status: this.cmi.success_status,
                    suspend_data: this.cmi.suspend_data,
                    time_limit_action: this.cmi.time_limit_action,
                    total_time: this.cmi.total_time
                }
            };
            for (let i = 0; i < this.cmi.comments_from_learner.length; i++) {
                result.cmi.comments_from_learner[i] = {
                    comment: this.cmi.comments_from_learner[i].comment,
                    location: this.cmi.comments_from_learner[i].location,
                    timestamp: this.cmi.comments_from_learner[i].timestamp
                };
            }
            for (let i = 0; i < this.cmi.comments_from_lms.length; i++) {
                result.cmi.comments_from_lms[i] = {
                    comment: this.cmi.comments_from_lms[i].comment,
                    location: this.cmi.comments_from_lms[i].location,
                    timestamp: this.cmi.comments_from_lms[i].timestamp
                };
            }
            for (let i = 0; i < this.cmi.interactions.length; i++) {
                result.cmi.interactions[i] = {
                    id: this.cmi.interactions[i].id,
                    type: this.cmi.interactions[i].type,
                    objectives: [],
                    timestamp: this.cmi.interactions[i].timestamp,
                    correct_responses: [],
                    weighting: this.cmi.interactions[i].weighting,
                    learner_response: this.cmi.interactions[i].learner_response,
                    result: this.cmi.interactions[i].result,
                    latency: this.cmi.interactions[i].latency,
                    description: this.cmi.interactions[i].description
                };
                for (let j = 0; j < this.cmi.interactions[i].objectives.length; j++) {
                    result.cmi.interactions[i].objectives[j] = {
                        id: this.cmi.interactions[i].objectives[j].id
                    };
                }
                for (let j = 0; j < this.cmi.interactions[i].correct_responses.length; j++) {
                    result.cmi.interactions[i].correct_responses[j] = {
                        pattern: this.cmi.interactions[i].correct_responses[j].pattern
                    };
                }
            }
            for (let i = 0; i < this.cmi.objectives.length; i++) {
                result.cmi.objectives[i] = {
                    id: this.cmi.objectives[i].id,
                    score: {
                        max: this.cmi.objectives[i].score.max,
                        min: this.cmi.objectives[i].score.min,
                        raw: this.cmi.objectives[i].score.raw,
                        scaled: this.cmi.objectives[i].score.scaled
                    },
                    success_status: this.cmi.objectives[i].success_status,
                    completion_status: this.cmi.objectives[i].completion_status,
                    progress_measure: this.cmi.objectives[i].progress_measure,
                    description: this.cmi.objectives[i].description
                };
            }
            return result;
        }
        catch (err) {
            return null;
        }
    }

    set(newData: any): ScormDataModel2004 {
        try {
            this.cmi.comments_from_learner = [];
            for (let i = 0; i < newData.cmi.comments_from_learner.length; i++) {
                let temp = new ScormComment2004();
                temp.comment = newData.cmi.comments_from_learner[i].comment;
                temp.location = newData.cmi.comments_from_learner[i].location;
                temp.timestamp = newData.cmi.comments_from_learner[i].timestamp;
                this.cmi.comments_from_learner.push(temp);
            }
            this.cmi.comments_from_lms = [];
            for (let i = 0; i < newData.cmi.comments_from_lms.length; i++) {
                let temp = new ScormComment2004();
                temp.comment = newData.cmi.comments_from_lms[i].comment;
                temp.location = newData.cmi.comments_from_lms[i].location;
                temp.timestamp = newData.cmi.comments_from_lms[i].timestamp;
                this.cmi.comments_from_lms.push(temp);
            }
            this.cmi.completion_status = newData.cmi.completion_status;
            this.cmi.completion_threshold = newData.cmi.completion_threshold;
            this.cmi.credit = newData.cmi.credit;
            this.cmi.entry = newData.cmi.entry;
            this.cmi.exit = newData.cmi.exit;
            this.cmi.interactions = [];
            for (let i = 0; i < newData.cmi.interactions.length; i++) {
                let temp = new ScormInteraction2004();
                temp.correct_responses = [];
                let values = Object.values(newData.cmi.interactions[i].correct_responses);
                for (let j = 0; j < values.length; j++) {
                    let temp2 = new ScormCorrectResponse2004();
                    temp2.pattern = (values[j] as any).pattern;
                    temp.correct_responses.push(temp2);
                }
                temp.description = newData.cmi.interactions[i].description;
                temp.id = newData.cmi.interactions[i].id;
                temp.latency = newData.cmi.interactions[i].latency;
                temp.learner_response = newData.cmi.interactions[i].learner_response;
                temp.objectives = [];
                values = Object.values(newData.cmi.interactions[i].objectives);
                for (let j = 0; j < values.length; j++) {
                    let temp2 = new ScormObjective2004();
                    temp2.id = (values[j] as any).id;
                    temp.objectives.push(temp2);
                }
                temp.result = newData.cmi.interactions[i].result;
                temp.timestamp = newData.cmi.interactions[i].timestamp;
                temp.type = newData.cmi.interactions[i].type;
                temp.weighting = newData.cmi.interactions[i].weighting;
                this.cmi.interactions.push(temp);
            }
            this.cmi.learner_id = newData.cmi.learner_id;
            this.cmi.learner_name = newData.cmi.learner_name;
            this.cmi.learner_preference.audio_captioning = newData.cmi.learner_preference.audio_captioning;
            this.cmi.learner_preference.audio_level = newData.cmi.learner_preference.audio_level;
            this.cmi.learner_preference.delivery_speed = newData.cmi.learner_preference.delivery_speed;
            this.cmi.learner_preference.language = newData.cmi.learner_preference.language;
            this.cmi.location = newData.cmi.location;
            this.cmi.max_time_allowed = newData.cmi.max_time_allowed;
            this.cmi.mode = newData.cmi.mode;
            this.cmi.objectives = [];
            let values = Object.values(newData.cmi.objectives);
            for (let i = 0; i < values.length; i++) {
                let temp = new ScormObjective2004();
                temp.completion_status = (values[i] as any).completion_status;
                temp.description = (values[i] as any).description;
                temp.id = (values[i] as any).id;
                temp.progress_measure = (values[i] as any).progress_measure;
                temp.score.max = (values[i] as any).score.max;
                temp.score.min = (values[i] as any).score.min;
                temp.score.raw = (values[i] as any).score.raw;
                temp.score.scaled = (values[i] as any).score.scaled;
                temp.success_status = (values[i] as any).success_status;
                this.cmi.objectives.push(temp);
            }
            this.cmi.progress_measure = newData.cmi.progress_measure;
            this.cmi.scaled_passing_score = newData.cmi.scaled_passing_score;
            this.cmi.score.max = newData.cmi.score.max;
            this.cmi.score.min = newData.cmi.score.min;
            this.cmi.score.raw = newData.cmi.score.raw;
            this.cmi.score.scaled = newData.cmi.score.scaled;
            this.cmi.session_time = newData.cmi.session_time;
            this.cmi.success_status = newData.cmi.success_status;
            this.cmi.suspend_data = newData.cmi.suspend_data;
            this.cmi.time_limit_action = newData.cmi.time_limit_action;
            this.cmi.total_time = newData.cmi.total_time;
            return this;
        }
        catch (err) {
            return null;
        }
    }
}

export class ScormCMI2004 {
    comments_from_learner: ScormComment2004[] = [];
    comments_from_lms: ScormComment2004[] = [];
    completion_status: string = ""; // "completed", "incomplete", "not attempted", "unknown"
    completion_threshold: number = 0;
    credit: string = ""; // "credit", "no-credit"
    entry: string = ""; // "ab-initio", "resume"
    exit: string = ""; // "timeout", "suspend", "logout", "normal"
    interactions: ScormInteraction2004[] = [];
    learner_id: string = "";
    learner_name: string = "";
    learner_preference: ScormLearnerPreference2004 = new ScormLearnerPreference2004();
    location: string = "";
    max_time_allowed: string = "";
    mode: string = ""; // "browse", "normal", "review"
    objectives: ScormObjective2004[] = [];
    progress_measure: number = 0;
    scaled_passing_score: number = 0;
    score: ScormScore2004 = new ScormScore2004();
    session_time: string = "";
    success_status: string = ""; // "passed", "failed", "unknown"
    suspend_data: string = "";
    launch_data: string = "";
    time_limit_action: string = ""; // "exit,message", "exit,no message", "continue,message", "continue,no message"
    total_time: string = "";
}

export class ScormComment2004 {
    comment: string = "";
    location: string = ""
    timestamp: string = "";
}

export class ScormInteraction2004 {
    id: string = "";
    type: string = ""; // "true-false", "choice", "fill-in", "matching", "performance", "sequencing", "likert", "numeric"
    objectives: ScormObjective2004[] = [];
    timestamp: string = "";
    correct_responses: ScormCorrectResponse2004[] = [];
    weighting: number = 1;
    learner_response: string = "";
    result: any = ""; // "correct", "incorrect", "unanticipated", "neutral", OR number
    latency: string = "";
    description: string = "";
}

export class ScormObjective2004 {
    id: string = "";
    score: ScormScore2004 = new ScormScore2004();
    success_status: string = ""; // "passed", "failed", "unknown"
    completion_status: string = ""; // "completed", "incomplete", "not attempted", "unknown"
    progress_measure: number = 0;
    description: string = "";
}

export class ScormCorrectResponse2004 {
    pattern: string = "";
}

export class ScormLearnerPreference2004 {
    audio_level: number = 0;
    language: string = "";
    delivery_speed: number = 1;
    audio_captioning: string = ""; // "-1", "0", "1"
}

export class ScormScore2004 {
    scaled: number = 0;
    raw: number = 0;
    max: number = 0;
    min: number = 0;
}
