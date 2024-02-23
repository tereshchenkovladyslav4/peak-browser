import {ContentType} from "../content";

export enum ContentTypeString {
  VIDEO = 'VIDEO',
  COURSE = 'COURSE',
  LEARNING_PATH = 'LEARNING_PATH',
  DOCUMENT = 'DOCUMENT',
  WORKFLOW = 'WORKFLOW',
  QUIZ = 'QUIZ',
}

export function mapServerContentTypeToContentTypeString(contentType: ContentType): ContentType {
  const map = {
    [ContentType.Course]: ContentTypeString.COURSE,
    [ContentType.Document]: ContentTypeString.DOCUMENT,
    [ContentType.LearningPath]: ContentTypeString.LEARNING_PATH,
    [ContentType.Video]: ContentTypeString.VIDEO,
    [ContentType.Workflow]: ContentTypeString.WORKFLOW,
    [ContentType.Quiz]: ContentTypeString.QUIZ
  };

  return map[contentType] || new Error('not yet mapped');
}

export function mapContentTypeStringToServerContentType(contentTypeString: ContentTypeString | string): ContentType {
  const map = {
    [ContentTypeString.COURSE]: ContentType.Course,
    [ContentTypeString.DOCUMENT]: ContentType.Document,
    [ContentTypeString.LEARNING_PATH]: ContentType.LearningPath,
    [ContentTypeString.VIDEO]: ContentType.Video,
    [ContentTypeString.WORKFLOW]: ContentType.Workflow,
    [ContentTypeString.QUIZ]: ContentType.Quiz,
  };

  return map[contentTypeString];
}

export const CONTENT_TYPE_DISPLAY_MAP = {
  [ContentTypeString.VIDEO]: { label: 'Video', image: 'assets/images/content-types/video.svg' },
  [ContentTypeString.COURSE]: { label: 'Course', image: 'assets/images/content-types/course.svg' },
  [ContentTypeString.DOCUMENT]: { label: 'Document', image: 'assets/images/content-types/doc-generic.svg' },
  [ContentTypeString.LEARNING_PATH]: { label: 'Learning Path', image: 'assets/images/content-types/learning-path.svg' },
  [ContentTypeString.WORKFLOW]: { label: 'Workflow', image: 'assets/images/content-types/workflow.svg' },
  [ContentTypeString.QUIZ]: {label: 'Quiz', image: 'assets/images/content-types/quiz.svg'}
};
