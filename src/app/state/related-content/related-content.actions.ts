export namespace RelatedContentActions {
  export class GetRelatedContent {
    static readonly type = '[Content Footer Component] Get Related Content';
    constructor(public contentId: string) {}
  }
}