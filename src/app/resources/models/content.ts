import { UserMicro } from './user';
import { LibrarySummary, Library } from './library';
import { Topic } from './topic';
import { Certificate } from './certificate';
import { TrashValidationResult } from './managed-content/trash';



//Cleaner objects that better match the API objects



export class ContentSummary {
  public id: string;
  public type: ContentType;
  public documentType: ContentDocumentType | null;
  public name: string;
  public plainDescription: string;
  public created: Date | null;
  public imageUrl: string;
}

export class CourseContentSummary extends ContentSummary {
  public duration: number;
  public learningTags: Array<ContentTag>;
  public sequence: number;
}

export class CourseSummary extends ContentSummary {
  public duration: number;
  public sequence: number
}


export class ContentItem extends ContentSummary {
  public parentId: string;
  public publisher: ContentPublisher;
  public duration: number;
  public lastModified: Date | null;
  public lastModifiedBy: UserMicro;
  public difficulty: ContentDifficulty;
  public libraries: Array<Library>;
  public associatedTopics: Array<Topic>;
  public keywords: Array<string>;
  public status: ContentStatus = ContentStatus.Draft;
  public statusDate: Date | null;
  public statusBy: UserMicro;
  public lastTouched: Date | null;
}

export class ContentDetails extends ContentItem {
  public description: string;
  public language: string;
  public relatedLearningCommands: Array<ContentTag>;

  public selected: boolean;
  public typeIcon: string;
  public prerequisites?: Array<ContentSummary>;
  isBookmarked?: boolean;

}


export class LibraryContent extends ContentItem {
  public addedToLibraryDate: Date;
  public isSyncedContent: boolean;
}

export class LearningPath extends ContentDetails {

  public override type: ContentType = ContentType.LearningPath;

  public courses: Array<CourseSummary>;

  public certificate: Certificate;
}

export class CourseBase extends ContentDetails {

  public revision: string; //Max length 20


}

export class Course extends CourseBase {

  public override type: ContentType = ContentType.Course;

  public mustViewContentInOrder: boolean;

  public specifyMaxQuizAttempts: boolean;

  public maxQuizAttempts: number;

  public mustPassQuiz: boolean;

  public overrideReqVidWatchPct: boolean;

  public reqVidWatchPct: number;

  public content: Array<CourseContentSummary>;

}
export class GetManageContentItemsBySearchQueryResponse {
  public results: FolderStructureContent[];
}
export class ScormPackage extends CourseBase {
  public override type: ContentType = ContentType.ScormPackage;

  public requirePackageCompletion: boolean;

  public requireScorePercentage: boolean;

  public minScorePercentage: number;

  public packageUrl: string;

  public packageUploaded: Date | null;

  public ScormPackage() { }
}





export class Document extends ContentDetails {
  public override type: ContentType = ContentType.Document;

  public override documentType: ContentDocumentType = ContentDocumentType.Custom

  public documentUrl: string;

  public isExternal: boolean;

  public canDownload: boolean;

  /// <summary>
  /// KnowledgeSmart learning tags associated with the content.
  /// </summary>
  public learningTags: Array<ContentTag>;
}

export class Workflow extends ContentDetails {
  public override type: ContentType = ContentType.Workflow;

  /// <summary>
  /// KnowledgeSmart learning tags associated with the content.
  /// </summary>
  public learningTags: Array<ContentTag>;
}

export class Folder extends ContentDetails {
  public override type: ContentType = ContentType.Folder;

  public isRestricted: boolean;
}

export class VideoChapter {
  public chapterId: string;
  public name: string;
  public position: number;
}

export class LiveEventSessionSummary {
  public liveEventId: string;
  public sessionId: string;
  public name: string;
  public sessionStart: Date | null;
  public isRecurring: boolean;
}


export class Video extends ContentDetails {
  public videoUrl: string = '';
  public transcriptUrl: string = '';
  public chaptersUrl: string = '';
  public chapters: Array<VideoChapter> = [];
  //public associatedLiveEvents: Array<LiveEventSessionSummary> = [];
  public learningTags: Array<ContentTag> = [];

  constructor() {
    super();
    this.type = ContentType.Video;
  }
}



export enum QuizQuestionType {
  ChooseSingleAnswer,
  ChooseMultipleAnswers,
  TrueFalse,
  FillInText
}

export class QuizAnswer {
  public answerId: string;

  public imageUrl: string;

  public answerText: string;

  public isCorrectAnswer: boolean;

  public sequence: number;
}

export class QuizQuestion {
  public questionId: string;

  public questionType: QuizQuestionType;

  public imageUrl: string;

  public questionText: string;

  public answers: Array<QuizAnswer>;

  public explanation: string

  public sequence: number;
}

export class Quiz extends ContentDetails {
  public override type: ContentType = ContentType.Quiz;

  /// <summary>
  /// KnowledgeSmart learning tags associated with the content.
  /// </summary>
  public learningTags: Array<ContentTag>;

  public questions: Array<QuizQuestion>;

  public randomizeQuestionOrder: boolean;

  public requirePassingScore: boolean;

  public passingScore: number;

  public limitQuestionsAsked: boolean;

  public questionLimit: number;
}



//Rachel - I know this is similar to the LegacyTreeItem onject in models > manageContent > content,
//But I don't know how much stuff is using it. Making it consist with API Objects
export class FolderStructureContent extends ContentSummary {

  public contents: Array<FolderStructureContent>;
  public subscriptionId: string;
  public folderType: ContentFolderType = ContentFolderType.Workflow
  public restricted: boolean;

  public products: string[] = null;
  public searchScore: number = null;
  public searchPath: string = null
  public override documentType: ContentDocumentType = ContentDocumentType.Custom

  public lastModified: Date = null;
  public lastModifiedBy: UserMicro = new UserMicro();
  public publisher: string
  public required: boolean;
  public parentId: string;

  public libraries: Array<LibrarySummary> = new Array<LibrarySummary>();

  public associatedTopics: Array<Topic> = new Array<Topic>();

  public difficulty: ContentDifficulty = ContentDifficulty.None;

  public duration: number;

  public keywords: Array<string> = new Array<string>();

  public blobURL: string = null;

  public iconType: string;
}




/// Don't use this if you don't have to. MU folders
/// had a type of content they would accept. The admin
/// portal allows any content in any folder.
export enum ContentFolderType {
  None,
  Document,
  LearningPath,
  Video,
  Workflow,
  LiveEvent,
  Quiz
}


/// <summary>
/// Associated Learning
/// </summary>
export enum ContentType {
  Course,
  Document,
  Folder,
  LearningPath,
  Process,
  Video,
  Workflow,
  Task,
  Milestone,
  Step,
  LiveEvent,
  Quiz,
  ScormPackage,
  LiveEventSession,
  Tool,
  Library
}

export type ContentTranslationKey = 'content-type.course' |
  'content-type.folder' |
  'content-type.learning-path' |
  'content-type.process' |
  'content-type.video' |
  'content-type.workflow' |
  'content-type.task' |
  'content-type.milestone' |
  'content-type.step' |
  'content-type.live-event' |
  'content-type.quiz' |
  'content-type.scorm-package' |
  'content-type.live-event-session' |
  'content-type.tool' |
  'content-type.library';

export enum ContentDocumentType {
  Custom,
  Excel,
  Pdf,
  Powerpoint,
  Word
}

export type DocumentTranslationKey = 'document-type.custom' |
  'document-type.excel' |
  'document-type.pdf' |
  'document-type.powerpoint' |
  'document-type.word';

/// The degree of effort or prior knowledge needed to
/// complete a piece of content as provided by the content's
/// author.
export enum ContentDifficulty {
  /// Represents the default value for existing content.
  /// You should not set new content to "None" difficulty.
  None,
  Beginner,
  Intermediate,
  Advanced
}



export class ContentPublisher {
  public id: string;
  public name: string;
}


export class ContentTag {
  public tagId: string;
  public type: ContentTagType;
  public tag: string;
}

export enum ContentTagType {
  /// <summary>
  /// Tags used to help launch related learning in
  /// the user tools/plugins.
  /// </summary>
  Commands,

  CourseContent,

  /// <summary>
  /// Tags used to help associate KS assessments with
  /// personalized learning.
  /// </summary>
  Learning,

  LearningPathContent,
  ProcessContent,
  StepContent,
  TaskContent,
  VideoContent
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

export class DiagramObject {
  contentId: string;
  name: string;
  assignedTo: string;
  contentType: ContentType_V1;
  description: string;
  color1: number;
  color2: number;
  basePtX: number;
  basePtY: number;
  textColor: number;
  borderColor: number;
  sizeX: number;
  sizeY: number;
  isDisabled: boolean;
  textAlignHorz: DiagramAlignHorz_T;
  textAlignVert: DiagramAlignVert_T;
  textOrient: DiagramTextOrient_T;
  textSize: DiagramTextSize_T;
  isDecision: boolean;
  isMilestone: boolean;
  isSwimlane: boolean;
  seq: number;
  seqPrefix: string;
  fillType: DiagramFillType_T;
}

export class DiagramPoint {
  x: number;
  y: number;
}


export class DiagramLine {
  objectId1: string;
  objectId2: string;
  gripIndex1: number;
  gripIndex2: number;
  label: string;
  linePoints: Array<DiagramPoint>;
  arrowPoints: Array<DiagramPoint>;
  labelPoints: DiagramPoint;
  labelAnchor: string;
}


export class DiagramView {
  viewId: string;
  topLeftX: number;
  topLeftY: number;
  zoomFactor: number;
  objects: Array<DiagramObject>;
  lines: Array<DiagramLine>;
}

export type DiagramObjType = 'task' | 'milestone' | 'process';

export interface DiagramViewExtended {
  viewId: string;
  topLeftX: number;
  topLeftY: number;
  zoomFactor: number;
  objects: Array<DiagramObjectExtended>;
  lines: Array<DiagramLineExtended>;
}

export interface DiagramObjectExtended extends DiagramObject {
  textColorHex: string,
  borderColorHex: string,
  color1Hex: string,
  color2Hex: string,
  objType: DiagramObjType,
  wrappedName: string[],
  wrappedAssigned: string[],
  decisionGeom: string,
  processGeom: string
}

export interface DiagramLineExtended extends DiagramLine {
  lineGeom: string,
  arrowGeom: string
}

export enum ContentType_V1 {
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

export class Content_V1 {
  contentId: String;
  contentType: ContentType_V1;
  name: String;
  description: String;
  providedBy: String;
  imageURL: String;
  bisCustom: boolean;
  docURL: String;
  bisDownloadable: boolean;
  userHasAccess: boolean;
}



export class GetContentForCurrentByIdUserResponse {
  content: Array<FolderStructureContent> = new Array<FolderStructureContent>();
}

export class GetDiagramViewResponse {
  diagram: DiagramView;
}


export class GetContentDetailsResponse<T extends ContentDetails>
{
  public content: T;
}

export class GetContentSummaryResponse<T extends ContentSummary>
{
  public content: T;
}

export class CopyDocumentResponse {
  newDocumentId: string;
}

export class getUserMicroResponse {
  public users: Array<UserMicro>;
}

export class BulkAddToTrashRequest {
  folderIds: Array<string>
  contentIds: Array<string>
}
export class BulkAddToTrashResponse {
  results: Array<TrashValidationResult>
}

//Search and Replace Models
export class SearchReplaceItemsResponse {
  SearchReplaceItems: SearchReplaceItem[];
}

export class SearchReplaceItem {

  itemID: string
  itemName: string
  itemType: ContentType
  itemDescription: string
  lastModified?: Date
  location: SearchReplaceItemLocation

  parentContentID: string
  parentContentName: string
  parentContentType: ContentType
}

export enum SearchReplaceItemLocation {
  Title,
  Description,
  ToolName,
  ToolLink
}

export class SearchReplaceFilterOptions {
  searchTerm: String
  matchWholeWord: boolean = false;
  matchCase: boolean = false;

  searchDocuments: boolean = true;
  searchVideos: boolean = true;
  searchLearningPaths: boolean = true;
  searchCourses: boolean = true;
  searchQuizzes: boolean = true;

  searchDescription: boolean = true;
  searchTitle: boolean = true;
  searchToolLink: boolean = true;
  searchToolName: boolean = true;
}

export class TopicIdentifiers {
  topicId: string;
  subtopicId: string | null;
}

export class CreateContentRequest {
  Title: string;

  Description: string = "";

  ImageUrl: string = "";

  Difficulty: ContentDifficulty = ContentDifficulty.Beginner;

  LanguageCode: string = "en";

  AssociatedTopicIds: Array<TopicIdentifiers> = new Array<TopicIdentifiers>();

  LearningTags: Array<string> = new Array<string>();

  Keywords: Array<string> = new Array<string>();

  RelatedLearningCommands: Array<string> = new Array<string>();

  FolderId: string;

  Duration: number = 0;

  Status: ContentStatus = ContentStatus.Draft;

}

export enum ContentStatus {
  /// <summary>
  /// Represents the default value for existing content.
  /// </summary>
  Draft,
  Approved,
  AwaitingApproval,
  Published
}

export class CreateDocumentRequest extends CreateContentRequest {
  DocumentUrl: string;
  CanDownload: boolean = true;
}

export class CreateVideoRequest extends CreateContentRequest {
  VideoUrl: string;
  Chapters: Array<ChapterInfo> = new Array<ChapterInfo>();
}

export class CreateCourseRequest extends CreateContentRequest {
  public LearningPathId: string;
  public Sequence: number;
  public Revision: string = '';
  public Prerequisites: Array<ContentInfo> = new Array<ContentInfo>();

  public MustViewContentInOrder: boolean = false;
  public AllowQuizRetakes: boolean = false;
  public MaxQuizAttempts: number = 1;
  public MustPassQuiz: boolean = false;

  public Content: Array<ContentInfo> = new Array<ContentInfo>();

  public isScormPackage = false;
  public scormPackagePath = '';
  public scormRequireComplete = false;
  public scormRequireScore = false;
  public scormScoreToComplete = 0;
}

export class CreateLearningPathRequest extends CreateContentRequest {
  public IsPublic: boolean = false;
  public Prerequisites: Array<ContentInfo> = new Array<ContentInfo>();
  public Certificate: Certificate = new Certificate();
}



export class ChapterInfo {
  Name: string;
  Position: number;
}


export class ContentInfo {
  public ContentId: string;
  public ContentType: ContentType;
}

export class ModifyContentRequest {
  Title: string;
  Description: string;
  ImageUrl: string;
  Difficulty: ContentDifficulty;
  LanguageCode: string;
  AssociatedTopicIds: Array<TopicIdentifiers>;
  LearningTags: Array<string>;
  Keywords: Array<string>;
  RelatedLearningCommands: Array<string>;
  FolderId: string;
  Duration: number;
  Status: ContentStatus;
}


export class ModifyContentRequestWithIDAndType extends ModifyContentRequest {
  contentId: string;
  contentType: ContentType;
}

export class ModifyCourseRequest extends ModifyContentRequest {
  public LearningPathId: string;
  public Sequence: number;
  public Revision: string;

  public Prerequisites: Array<ContentInfo>;

  public MustViewContentInOrder: boolean;
  public AllowQuizRetakes: boolean;
  public MaxQuizAttempts: number;
  public MustPassQuiz: boolean;

  public Content: Array<ContentInfo>;

  public scormPackagePath: string | null = null;
  public scormRequireComplete: boolean | null = null;
  public scormRequireScore: boolean | null = null;
  public scormScoreToContinue: number | null = null;
}


export class ModifyLearningPathRequest extends ModifyContentRequest {
  public IsPublic: boolean | null;

  public Prerequisites: Array<ContentInfo>;

  public Certificate: Certificate;
}

export class ModifyWorkflowRequest extends ModifyContentRequest {
  //empty for now
}



export class ModifyBulkContentRequest {
  BulkContentRequest: Array<ModifyContentRequestWithIDAndType>;
}
export class GetAllContentAccessibleForCurrentUserResponse {
  content: Array<ContentItem> = new Array<ContentItem>();
}


export class GetLearningTagsResponse {
  learningTags: Array<string>;
}



export class GetRelatedLearningCommandsResponse {
  relatedLearningCommands: Array<string>;
}


export class GetKeywordsResponse {

  keywords: Array<string>;
}

export class ModifyLearningTagOfContentResponse {

  learningTags: Array<ContentTag>;
}


export class CopyCourseResponse {

  newCourseId: string;
}

export class GetTaskStepsResponse {
  steps: ContentDetails[];
}

export type TaskSteps = {
  [key: string]: ContentDetails[];
}

export const SERVER_CONTENT_TYPE_MAP = {
  [ContentType.Document]: 'cheatsheet',
  [ContentType.LearningPath]: 'learningpath',
  [ContentType.Video]: 'video',
  [ContentType.Workflow]: 'workflow',
}

export class HierarchyContent {
  ContentId: string = "";
  Name: string = "";
  Children: Array<HierarchyContent> = new Array<HierarchyContent>();
}
