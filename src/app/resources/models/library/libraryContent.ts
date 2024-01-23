
//When using Objects for Content please go to models/library.
//These are the objects that chetu made and do not match the API objects

export class GetLibraryContentResponse {
  content: ContentItem[];
  shareSettings: LibraryShareSettings;
}

export class ContentItem { }

export class LibraryShareSettings { }

export class GetAllLibrariesResponse {
  libraries: LibraryContent[];
}

export class GetLibraryResponse {
  libraries: LibraryContent[];
}

export class LibraryContent {
  libraryId: string;
  name: string;
  description:string;
  subscription: boolean;
  imageUrl: string;
  bannerImageUrl:string
  shareModal: boolean;
  selected:boolean;
  syncedTopics: SyncedTopics[];
  id: string;
  topicindex: string;
  topicId: string;
  publishDate: string;
  newLibrary: boolean;
  newContent: boolean;
  content: any[];
 
  constructor(public libraries: Library) { }
}

export class Library {
  constructor(
    public libraryId: string,
    public name: string,
    public shareSettings: ShareSettings
  ) { }
}
export class SyncedTopics {
  name: string;
  topicId: string;
  subtopics: SubTopic[]
  syncedTopics: [];
  subtopicId: string;
}
export class Topics {
  name: string;
  selected: boolean;
  subtopics: SubTopic[];
  demotopic: string;
  topicId: string;
  filterValues: string;
  selectTopic: boolean;
  newRelease: boolean;
  subtopicId: string;
}
export class SubTopic {
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
  version: boolean;
}

export class ShareSettings {
  mode: number;
  groups: [];
  shareWithAllUsers: boolean;
}

export class SearchValues {
  name: string;
}

export class GetRecentContentResponse {
  content: Content[];
}
export class GetPopularContentResponse {
  
  content: Content[];
}

export class GetAllContentResponse {
  content: Content[];
}


export class Content {
  difficulty: number;
  duration: number;
  id: string;
  name: string;
  parentId: string;
  publisher: Publisher[];
  content: Content[];
  subscription: boolean;
  Keywords: string[];
  selected: boolean;
}

export class Publisher {
  id: string;
  name: string;
  selectedPublisher:boolean;
}
