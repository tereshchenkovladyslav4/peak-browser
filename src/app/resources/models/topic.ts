//1.4.23 - This matches what is in the API. Don't use the other Topic objects
//Rachel

export class Topic {
    public topicId: string;
    public name: string;
    public imageUrl: string;
    public subtopics: Array<Subtopic>;
    static copy = (topic: Topic): Topic => {
        const newTopic = new Topic();
        newTopic.topicId = topic.topicId;
        newTopic.name = topic.name;
        newTopic.imageUrl = topic.imageUrl;
        newTopic.subtopics = topic.subtopics?.map(subtopic => Subtopic.copy(subtopic)) ?? new Array<Subtopic>();
        return newTopic;
    }
}

export class Subtopic {
    public subtopicId: string;
    public name: string;
    public seq: number;
    static copy = (subtopic: Subtopic) => {
        const newSubtopic = new Subtopic();
        newSubtopic.subtopicId = subtopic.subtopicId;
        newSubtopic.name = subtopic.name;
        newSubtopic.seq = newSubtopic.seq;
        return newSubtopic;
    }
}

export class SyncTopic extends Topic {
    public addNewSubtopicsAsReleased: boolean;
    static override copy = (topic: SyncTopic): SyncTopic => {
        const newTopic = new SyncTopic();
        newTopic.topicId = topic.topicId;
        newTopic.name = topic.name;
        newTopic.imageUrl = topic.imageUrl;
        newTopic.subtopics = topic.subtopics?.map(subtopic => Subtopic.copy(subtopic)) ?? new Array<Subtopic>();
        newTopic.addNewSubtopicsAsReleased = topic.addNewSubtopicsAsReleased;
        return newTopic;
    }
}

export class SyncTopicSetting {
    public topicId: string;
    public subtopicId: string;
    public addNewSubtopicsAsReleased: boolean;
    constructor(topicId: string, subtopicId: string, addNewSubtopicsAsReleased: boolean) {
        this.topicId = topicId;
        this.subtopicId = subtopicId;
        this.addNewSubtopicsAsReleased = addNewSubtopicsAsReleased;
    }
}

export class GetTopicImpactCountResponse {
    public itemCount: number;
}

export class GetAllTopicsResponse {
    public topics: Array<Topic>;
}

export class SetSyncTopicsRequest {
    public newTopics: Array<SyncTopicSetting>;
    constructor(newTopics: Array<SyncTopicSetting>) {
        this.newTopics = newTopics;
    }
}

export class SetSyncTopicsResponse {
    public topics: Array<SyncTopic>;
}

export class TopicSubtopicPair {
    public imageUrl: string;
    public topicName: string;
    public subtopicName: string;
}
