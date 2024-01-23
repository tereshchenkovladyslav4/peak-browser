import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';
import { ContentTranslationKey, DocumentTranslationKey, ContentType, ContentDocumentType } from '../resources/models/content';

const BASE_ICON_URL = 'assets/images/content/icons/';

interface ContentMetadata {
    translationKey: ContentTranslationKey | DocumentTranslationKey;
    iconUrl: string;
}

const CONTENT_TYPE_METADATA = new Map<ContentType, ContentMetadata>([
    [ContentType.Course, {translationKey: 'content-type.course', iconUrl: BASE_ICON_URL + 'course.svg'}],
    [ContentType.Folder, {translationKey: 'content-type.folder', iconUrl: 'assets/images/OpenFolderTv.svg'}],
    [ContentType.LearningPath, {translationKey: 'content-type.learning-path', iconUrl: BASE_ICON_URL + 'learning-path.svg'}],
    [ContentType.Process, {translationKey: 'content-type.process', iconUrl: BASE_ICON_URL + 'workflow.svg'}],
    [ContentType.Video, {translationKey: 'content-type.video', iconUrl: BASE_ICON_URL + 'video.svg'}],
    [ContentType.Workflow, {translationKey: 'content-type.workflow', iconUrl: BASE_ICON_URL + 'workflow.svg'}],
    [ContentType.Task, {translationKey: 'content-type.task', iconUrl: BASE_ICON_URL + 'workflow.svg'}],
    [ContentType.Milestone, {translationKey: 'content-type.milestone', iconUrl: BASE_ICON_URL + 'workflow.svg'}],
    [ContentType.Step, {translationKey: 'content-type.step', iconUrl: BASE_ICON_URL + 'workflow.svg'}],
    [ContentType.LiveEvent, {translationKey: 'content-type.live-event', iconUrl: BASE_ICON_URL + 'live-event.svg'}],
    [ContentType.Quiz, {translationKey: 'content-type.quiz', iconUrl: BASE_ICON_URL + 'quiz.svg'}],
    [ContentType.ScormPackage, {translationKey: 'content-type.scorm-package', iconUrl: 'assets/images/file-type-icons/SCORM.svg'}],
    [ContentType.LiveEventSession, {translationKey: 'content-type.live-event-session', iconUrl: BASE_ICON_URL + 'live-event.svg'}],
    [ContentType.Tool, {translationKey: 'content-type.tool', iconUrl: BASE_ICON_URL + ''}], // no tool icon yet
    [ContentType.Library, {translationKey: 'content-type.library', iconUrl: BASE_ICON_URL + 'library.svg'}]
])

const DOCUMENT_TYPE_METADATA = new Map<ContentDocumentType, ContentMetadata>([
    [ContentDocumentType.Custom, {translationKey: 'document-type.custom', iconUrl: BASE_ICON_URL + 'doc-generic.svg'}],
    [ContentDocumentType.Excel, {translationKey: 'document-type.excel', iconUrl: BASE_ICON_URL + 'doc-xcl.svg'}],
    [ContentDocumentType.Pdf, {translationKey: 'document-type.pdf', iconUrl: BASE_ICON_URL + 'doc-pdf.svg'}],
    [ContentDocumentType.Powerpoint, {translationKey: 'document-type.powerpoint', iconUrl: BASE_ICON_URL + 'doc-powerpoint.svg'}],
    [ContentDocumentType.Word, {translationKey: 'document-type.word', iconUrl: BASE_ICON_URL + 'doc-word.svg'}]
])

@Injectable({
  providedIn: 'root'
})
export class ContentTypesService {

    constructor(private translateService:TranslationService) {}

    getContentInfoFull(contentType: ContentType, documentType: ContentDocumentType = ContentDocumentType.Custom): ContentMetadata {
        if (contentType === ContentType.Document) {
            return DOCUMENT_TYPE_METADATA.get(documentType);
        }

        return CONTENT_TYPE_METADATA.get(contentType);
    }

    getContentInfoTranslationKey(contentType: ContentType, documentType: ContentDocumentType = ContentDocumentType.Custom): string {
        return this.getContentInfoFull(contentType, documentType)?.translationKey;
    }

    getContentInfoTranslationText(contentType: ContentType, documentType: ContentDocumentType = ContentDocumentType.Custom): string {
        const key = this.getContentInfoFull(contentType, documentType)?.translationKey
        return this.translateService.getTranslationFileData(key);
    }

    getContentInfoIconUrl(contentType: ContentType, documentType: ContentDocumentType = ContentDocumentType.Custom): string {
        return this.getContentInfoFull(contentType, documentType)?.iconUrl;
    }

    // todo refactor this
  contentTypeNumberToString(contentTypeNum:number):string {
    switch (contentTypeNum) {
      case 0://course
        return this.translateService.getTranslationFileData("common.course");
      case 1://document
        return this.translateService.getTranslationFileData("common.document");
      case 2://folder
        return this.translateService.getTranslationFileData("common.folder");
      case 3://learning path
        return this.translateService.getTranslationFileData("common.learning-path");
      case 4://process
        return this.translateService.getTranslationFileData("common.process");
      case 5://video
        return this.translateService.getTranslationFileData("common.video");
      case 6://workflow
        return this.translateService.getTranslationFileData("common.workflow");
      case 7://task
        return this.translateService.getTranslationFileData("common.task");
      case 8://milestone
        return this.translateService.getTranslationFileData("common.milestone");
      case 9://step
        return this.translateService.getTranslationFileData("common.step");
      case 10://live event
        return this.translateService.getTranslationFileData("common.live-event");
      case 11://quiz
        return this.translateService.getTranslationFileData("common.quiz");
      case 12://scorm package
        return this.translateService.getTranslationFileData("common.scorm-package");
      case 13://live event session
        return this.translateService.getTranslationFileData("common.live-event-session");
      case 14://tool
        return this.translateService.getTranslationFileData("common.tool");
      case 15://library
        return this.translateService.getTranslationFileData("common.library");
      default:
        return "";
    }
  }
}
