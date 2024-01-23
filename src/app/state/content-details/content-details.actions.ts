export namespace ContentDetailsActions {
  export class GetContentDetails {
    static readonly type = '[Content Container Component] Get Content Details';
    constructor(public contentId: string) {}
  }  
}