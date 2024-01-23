import {ContentItem } from "../content"

export class Bookmark {
  public bookmarkId: string;
  public createdDate: string;
  public content: ContentItem;
  public childCount: number = 0;
  public durationInSeconds: number = 0;
}

export class GetBookmarksResponse {
  bookmarks: Bookmark[];
}
