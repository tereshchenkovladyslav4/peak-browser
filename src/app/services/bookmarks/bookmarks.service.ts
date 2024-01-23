import { Injectable } from '@angular/core';
import {Observable, of, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ProdGenApi} from "../apiService/prodgen.api";
import {Apiv2Service} from "../apiService/apiv2.service";
import {CONSTANTS} from "../../config/constants";
import {map} from "rxjs/operators";
import { Bookmark } from "../../resources/models/content/bookmarks";
import {BookmarksStateService} from "../../state/bookmarks/bookmarks-state.service";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookmarksService  {

  constructor(
    private http: HttpClient,
    private v1Service: ProdGenApi,
    private v2Service: Apiv2Service,
    private bookmarksState: BookmarksStateService,
  ) {
    
  }

  // all this tooling is here bc we dont have an isBookmarked flag on a content item so we need
  // to manage the state of all the user's bookmarks so we can show the right buttons to the user on content items
  setInitialBookmarksState(): Observable<Bookmark[]> {
    return this
      .fetchBookmarks()
      .pipe(
        tap(bookmarks => bookmarks.forEach(bookmark => this.bookmarksState.addBookmark(bookmark)))
      );
  }

  createBookmark(contentId: string): Observable<Bookmark> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/content/enduser/bookmarks';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({fromObject: {contentId: contentId}});

    return this.http.post<Bookmark>(url, {}, {headers: headers, params: params}).pipe(
      tap(res => this.bookmarksState.addBookmark(res))
    );
  }

  private fetchBookmarks(): Observable<Bookmark[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/content/enduser/bookmarks';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));

    return this.http.get<{bookmarks: Bookmark[]}>(url, {headers: headers}).pipe(
      map( (results: {bookmarks: Bookmark[]}) => results.bookmarks),
      map((results: Bookmark[]) => results?.map((bookmark: Bookmark) => ({
        ...bookmark,
        // this magic allows the typeahead search to look for matches within any of these properties
        searchBy: bookmark?.content?.name + bookmark?.content?.plainDescription + bookmark?.content?.publisher?.name
      }))
      )
    );
  }

  removeBookmark(contentId: string): Observable<any> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/content/enduser/bookmarks/';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({ fromObject: { contentId: contentId } });

    return this.http.delete<Bookmark>(url, { headers: headers, params: params }).pipe(
      tap(() => this.bookmarksState.removeBookmark(contentId))
    );

    // todo uncomment this when endpoint available
    // return this.http.delete<ContentItem>(url, {headers: headers}).pipe(
    // tap(() => this.bookmarksState.removeBookmark(contentId))
    // );
  }
}
