//1.4.23 - Please see models/topics.ts for Objects that match API
//Rachel

export class GetAllContentTopicsResponse {
  Topics: Topic[];  
  topics: Topic[];
  selected: boolean;
  topicId: string;
  name: string;
}

export class Topic {
  TopicId: string;
  name: string;
  subtopics: Subtopic[];
  topicId: string;
  selectTopic: boolean;
  selected: boolean;
  imageUrl: string;
}

export class Subtopic {
  subtopicId: string;
  name: string;
  seq: number;
  version:boolean
}

export class SyncTopic extends Topic
{
    public AddNewSubtopicsAsReleased: boolean;
}