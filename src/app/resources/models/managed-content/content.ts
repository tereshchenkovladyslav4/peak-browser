import { LanguageInfo } from '../library/libraryContentList';
import { UserMicro } from '../user';
import { GroupSummary } from '../group';
import { Topic } from './topic';
import { ContentStatus, FolderStructureContent } from '../content';




//When using Objects for Content please go to models/content.
//These are the objects that chetu made and do not match the API objects

export class GetDefaultLearningCertificateResponse {
  certificate: Certificate;
}

export class GetContentDetailsResponse<T extends ContentDetails>
{
    public content: T;
}


export class Certificate {
    certificateId: string;
    docUrl: string;
    docPreviewUrl: string;
    useAsDefault: boolean;
}

export class GetRecentContentForCurrentUserResponse {
    recentContent: FolderStructureContent[];
}

export class GetUserResponse {
    user: any;
}

export class GetWorkflowEditorLinkResponse {
    public link: string;
    }

export class RecentLibraryContent {
  id: string;
  type: ContentType;
  name: string;
  parentId: string;
  publisher: LibraryContentPublisher;
  duration: number;
  difficulty: string[];
  created: string;
    lastModified: string;
    lastModifiedBy: UserMicro;
  keywords: string[];
  getAssociatedData: LibraryTopic[];
  selected: any;
  documentType: ContentDocumentType;
  typeIcon: string;
}

export class LibraryContentPublisher {
  id: string;
  name: string;
}

export class LibraryTopic {
  topicId: string;
  name: string;
  subTopics: LibraryTopic[];
}

export class GetContentForCurrentUserResponse {
    content: Array<LegacyTreeItem> = new Array<LegacyTreeItem>();
    contents: contents[] = [];
}

export class LegacyTreeItem {
    id: string;
    name: string;
    type: ContentType;
    contents: Array<LegacyTreeItem> = new Array<LegacyTreeItem>();
    subscriptionId: string;
    folderType: string[];
    restricted: boolean;
    required: boolean;
    lastModified: string;
    lastModifiedBy: UserMicro;
    publisher: string;
    products: string[];
    searchScore: number;
    searchPath: string;
    documentType: ContentDocumentType;
    selected: boolean;
    typeIcon: string;
    parentId: string
    description: string;
    associatedTopics:Topics[];
    libraries: Library[]
    keywords: string;
    difficulty:number;
    duration: number;
    blobURL: string;
    imageUrl: string;

    constructor(item?: LegacyTreeItem) {
        if (item) {
            this.id = item.id;
            this.name = item.name;
            this.type = item.type;
            this.contents = item.contents ? new Array<LegacyTreeItem>(...item.contents) : new Array<LegacyTreeItem>();;
            this.subscriptionId = item.subscriptionId;
            this.folderType = item.folderType;
            this.restricted = item.restricted;
            this.required = item.required;
            this.lastModified = item.lastModified;
            this.lastModifiedBy = item.lastModifiedBy;
            this.publisher = item.publisher;
            this.products = item.products ? new Array<string>(...item.products) : new Array<string>();
            this.searchScore = item.searchScore;
            this.searchPath = item.searchPath;
            this.documentType = item.documentType;
            this.selected = item.selected;
            this.typeIcon = item.typeIcon;
            this.parentId = item.parentId;
            this.description = item.description;
            this.associatedTopics = item.associatedTopics ? new Array<Topics>(...item.associatedTopics) : new Array<Topics>();
            this.libraries = item.libraries ? new Array<Library>(...item.libraries) : new Array<Library>();
            this.keywords = item.keywords;
            this.difficulty = item.difficulty;
            this.duration = item.duration;
            this.blobURL = item.blobURL;
            this.imageUrl = item.imageUrl;
        }
    }
}

export class ContentSummary {
    public id: string;
    public type: ContentType;
    public documentType: ContentDocumentType | null;
    public name: string;
    public created: Date | null;
}

export enum ContentDocumentType {
    Custom,
    Excel,
    Pdf,
    Powerpoint,
    Word
}

export class ContentItem extends ContentSummary {
    public parentId: string;
    public publisher: ContentPublisher;
    public duration: number;
    public lastModified: Date | null;
    public lastModifiedBy: UserMicro;
    public difficulty: ContentDifficulty;
    public associatedTopics: Array<Topic>;
    public libraries: Array<Library>;
    public keywords: Array<string>;
}

export class ContentPublisher {
    public Id: string;
    public Name: string;
}

export class ContentDetails extends ContentItem {
    public description: string;
    public imageUrl: string;
    public language: string;
    public relatedLearningCommands: Array<ContentTag>;
    public status: ContentStatus;
    public statusDate: Date;
    public statusBy: UserMicro;
    public documentUrl: string;
}

export class contents {
    id: string;
    name: string;
    type: number;
    subscriptionId: string;
    folderType: string[];
    restricted: boolean;
    required: boolean;
    lastModified: string;
    lastModifiedBy: UserMicro;
    publisher: string;
    products: string[];
    searchScore: number;
    searchPath: string;
    documentType: string[];
    selected: boolean;
    typeIcon: string;
    parentId: string
    description: string;
    associatedTopics: Topics[];
    libraries: Library[]
    keywords: string;
    difficulty: number;
    duration: number
}


export class ContentTag {
    public TagId: string;
    public Type: ContentTagType;
    public Tag: string;
}

export enum ContentTagType {
    Commands,
    CourseContent,
    Learning,
    LearningPathContent,
    ProcessContent,
    StepContent,
    TaskContent,
    VideoContent
}

// export class Topics {
//   name: string;
//   selected: boolean;
//   subtopics: SubTopic[];
//   demotopic: string;
//   topicId: string;
//   filterValues: string;
//   selectTopic: boolean;
//   newRelease: boolean;
//   subtopicId: string;
// }
// export class SubTopic {
//   selected: boolean;
//   name: string;
//   demosubtopic: string;
//   topicId: string;
//   topicName: string;
//   selectSubTopic: boolean;
//   newRelease: boolean;
//   parentTopicId: string;
//   subtopicId: string;
//   selectedSubTopics: any;
//   topicindex: string;
//   version: boolean;
// }

export class Library {
  libraryId: string
  name: string
  imageUrl: string
  bannerImageUrl:string
    lastModified: string
    lastModifiedBy: UserMicro
  syncedTopics: SyncedTopic[]
    publishDate: Date;
    description: string;
}


export class SyncedTopic {
  topicId: string
  name: string
  imageUrl: string
  subtopics: Subtopic[]
}

export class Subtopic {
  subtopicId: string
  name: string
  seq: number
}

export class Publisher {
  id: string
  name: string
}


export class Topics {
  name: string;
  selected: boolean;
  seq: number;
  demotopic: string;
  topicId: string;
  filterValues: string;
  newRelease: boolean;
  subtopics: subtopics[];
  selectTopic: boolean
  subtopicId: string;
}
export class subtopics {
  version: boolean;
  topicId: any;
  subtopicId: string;
  selected: boolean;
  name: string;
  // demosubtopic: string;
  topicName: string;
  selectSubTopic: boolean;
  newRelease: boolean;
  parentTopicId: string;
  selectedSubTopics: any;
  // topicindex: string;
}


export class CreateNewFolderRequest {
    IsRestricted: boolean;
    Title: string;
    Description: string;
    ImageUrl: string;
    Difficulty: ContentDifficulty;
    LanguageCode: string;
    AssociatedTopicIds: TopicIdentifiers[];
    LearningTags: string[];
    Keywords: string[];
    RelatedLearningCommands: string[];
    FolderId: string;
    Duration: number;
}

export class ModifyContentRequest {
    Title: string;
    Description: string;
    ImageUrl: string;
    Difficulty: ContentDifficulty;
    LanguageCode: string;
    AssociatedTopicIds: TopicIdentifiers[];
    LearningTags: string[];
    Keywords: string[];
    RelatedLearningCommands: string[];
    FolderId: string;
    Duration: number;
}

export class ModifyFolderRequest extends ModifyContentRequest {

}

export class TopicIdentifiers {
    topicId: string;
    subtopicId: string;
}

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

export class MoveContentObject {
    contentId: string;
    toFolderId: string;
    contentType: ContentType;
}


export enum ContentDifficulty {

    /// Represents the default value for existing content.
    /// You should not set new content to "None" difficulty.
    None,
    Beginner,
    Intermediate,
    Advanced
}

export class ContentProperties {
    public contentURL: string;

    public contentTitle: string;

    public contentId: string;

    public folderID: string;

    public contentType: ContentType;

    public associatedTopicsIds: Array<TopicIdentifiers> = new Array<TopicIdentifiers>();
    public associatedLibraryIds: Array<string> = new Array<string>();
    public difficulty: null | ContentDifficulty = null;
    public language: LanguageInfo;
    public keywords: Array<string> = new Array<string>();
}

export class UploadContentPropertiesRequest {
    public content: Array<ContentProperties> = new Array<ContentProperties>();
}

export class UploadContentPropertiesResponse {
    public results: Array<UploadContentPropertiesResult>;
}

export class UploadContentPropertiesResult {
    public documentURL: string;
    public id: string;
    public successfullyUpdatedProperties: boolean;
}

export class Document extends ContentDetails {
    public override documentUrl: string;
    public isExternal: boolean;
    public canDownload: boolean;
    public learningTags: Array<ContentTag>;

    constructor() {
        super();
        this.type = ContentType.Document;
        this.documentType = ContentDocumentType.Custom;
    }
}

export class Video extends ContentDetails {
    public videoUrl: string = '';
    public transcriptUrl: string = '';
    public chaptersUrl: string = '';
    public chapters: Array<VideoChapter>;
    public associatedLiveEvents: Array<LiveEventSessionSummary>;
    public learningTags: Array<ContentTag>;

    constructor() {
        super();
        this.type = ContentType.Video;
    }
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

export class Folder extends ContentDetails {
    public isRestricted: boolean;

    constructor() {
        super();
        this.type = ContentType.Folder;
    }
}

//This class is just to have a class type for
//uploaded files that will be used to potentially
//upate their properties during a batch file upload.
export class GenericContent {
    public contentTitle: string;
    public contentId: string;
    public contentUrl: string;
    public imageUrl: string;
    public title: string;
    public folderId: string;
    public contentType: ContentType;
}

export class GetRawFolderVisibilityResponse {
    public folderId: string;
    public isRestricted: boolean;
    public viewerUsers: Array<UserMicro>;
    public editorUsers: Array<UserMicro>;
    public viewerGroups: Array<GroupSummary>;
    public editorGroups: Array<GroupSummary>;
}

export class ModifyFolderVisibilityRequest {
    public availableToAll: boolean;
    public viewerUserIds: Array<string>;
    public editorUserIds: Array<string>;
    public viewerGroupIds: Array<string>;
    public editorGroupIds: Array<string>;
}

export class ModifyFolderVisibilityResponse {
    public isRestricted: boolean;
    public isSharedWithCurrentUser: boolean;
}

export class Content {
    contents?: any;
    subscriptionId: string;
    folderType: number;
    restricted: boolean;
    products?: any;
    searchScore?: any;
    searchPath?: any;
    documentType: number;
    lastModified?: Date;
    lastModifiedBy: UserMicro;
    publisher: string;
    required: boolean;
    parentId: string;
    libraries: Library[];
    associatedTopics: Topics[];
    difficulty: number;
    duration: number;
    keywords: string[];
    id: string;
    type: number;
    name: string;
    created: Date;
}
export class RootObject {
    contents: Content[];
    subscriptionId: string;
    folderType: number;
    restricted: boolean;
    products?: any;
    searchScore?: any;
    searchPath?: any;
    documentType: number;
    lastModified?: any;
    lastModifiedBy: UserMicro;
    publisher?: any;
    required: boolean;
    parentId: string;
    libraries: any[];
    associatedTopics: any[];
    difficulty: number;
    duration: number;
    keywords: any[];
    id: string;
    type: number;
    name: string;
    created?: any;
    selected: boolean;
}
