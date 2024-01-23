import {Injectable} from '@angular/core';
import {FilterBaseService} from "../filter/filter-base.service";
import {HttpClient} from "@angular/common/http";
import {ProdGenApi} from "../apiService/prodgen.api";
import {Apiv2Service} from "../apiService/apiv2.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {Observable, of, tap} from "rxjs";
import {CONSTANTS} from "../../config/constants";
import {map} from "rxjs/operators";
import {LibraryContent} from "../../resources/models/content";
import {ALLOWABLE_CONTENT_TYPES} from "../../resources/constants/allowable-types";
import {FilterStateService} from "../../state/filter/filter-state";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibraryContentService extends FilterBaseService {
  libraryContentsCount$: Observable<number>;

  constructor(private http: HttpClient,
              private v1Service: ProdGenApi,
              private v2Service: Apiv2Service,
              protected override route: ActivatedRoute,
              protected override router: Router,
              protected override location: Location,
              protected override filterState: FilterStateService) {
    super(route, router, location, filterState);
    this.libraryContentsCount$ = this.filterState.selectState(state => state.data).pipe(map(data => data?.length || 0));
  }

  fetchLibraryContents(id: string): Observable<any> {
    this.filterState.updateIsLoaded(false);

    if (!id) {
      this.filterState.updateIsLoaded(true);
      return of([]).pipe(
        tap(results => this.filterState.updateData(results))
      );
    }

    // todo integrate with backend, make models, move this url somewhere better for future use

    // TODO - should use v2 when endpoint is ready
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + `/libraries/${id}/content`;
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));

    return this.http.get<{content: LibraryContent[]}>(url, {headers: headers}).pipe(
      // map(data => data?.content?.map(r => new LibraryContent(r)) || []),
      map(data => data?.content || []),
      map(results => results.map(r => ({...r, contentType: r.type, topics: r.associatedTopics}))),
      tap(results => this.filterState.updateData(results)),
      tap(results => this.filterState.updateIsLoaded(true))
    );
  }
}
