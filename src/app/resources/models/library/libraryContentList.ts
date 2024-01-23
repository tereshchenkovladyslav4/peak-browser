import { SubTopic } from "./libraryContent";

export class GetAllContentResponse {
    content: LibraryContentList[];
}

export class LibraryContentList {
    videoUrl: string
    libraryId: string;
    libraryValue: string;
    name: string;
    imageUrl: string;
    bannerImageUrl: string;
    description: string
    contentId: string;
    selected: boolean;
    filterSelected: boolean;
    topicId: string;
    id: string;
    difficulty: number;
    type: number;
    publisher: Publisher;
    duration: number;
    highValue: number;
    subTopics: SubTopicData[];
    topics: Topics[]
    selectedValue: boolean;
    keywords: string[];
    parentId: string;
    lastModified: string;
    lastModifiedBy: string;
    associatedTopics: associatedTopics[];
    syncedTopics: SyncedTopics[];
    created: string;
    documetType: DocumentType;
    language: string;
    chapters: Chapters[]
    newContent: boolean;
    typeIcon: string
    difficultyType: string;
    filterBYtype: string;
    learningTags: string[]
    constructor() { }
}

export interface Chapters {
    // chapterId: string
    name: string
    position: number
}
export interface Publisher {
    id: string
    name: string
    selectedPublisher: boolean
}

export class DocumentType {
    type: String;
    documentType: string
    item: String
    selected: boolean;
}

export class Difficulty {
    difficulty: number;
    text: string;
    selected: boolean;
}


export class AddLibraryContentRequest {
    libraryId: string;
    ContentIdsToAdd: string;
    constructor() { }
}

export class RecentFiles {
    selected: boolean;
    name: string;
    constructor() { }
}

export class Type {
    type: string;
}

export class associatedTopics {
    name: string;
    topicId: string;
    subtopics: subtopics[];
}

export class ShareLibrary {
    slectedValue: boolean;
    constructor() { }
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
    demosubtopic: string;
    topicName: string;
    selectSubTopic: boolean;
    newRelease: boolean;
    parentTopicId: string;
    selectedSubTopics: any;
    topicindex: string;
}
export class SubTopicData {
    selected: boolean;
    name: string;
    demosubtopic: string;
    topicId: string;
    topicName: string;
    selectSubTopic: boolean;
    newRelease: boolean;
    parentTopicId: string;
    subtopicId: string;
    selectedSubTopics: any;
    topicindex: string;
}

export class ContentType {
    type: Number;
    item: String;
    selected: Boolean;
    imgSRC: String;
}

export class LanguageInfo {
    languageCode: string
    languageName: string
}

export class SyncedTopics {
    name: string;
    topicId: string;
    subtopics: SubTopic[]
    syncedTopics: [];
    subtopicId: string;
}