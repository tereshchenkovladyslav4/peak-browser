export namespace CommentsActions {
  export class GetComments {
    static readonly type = '[GetContentDetails Action] Get Comments';
    constructor(public contentId: string) {}
  }
}