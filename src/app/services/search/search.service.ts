import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable, of, pipe, tap} from "rxjs";
import {Apiv2Service} from '../apiService/apiv2.service';
import {CONSTANTS} from 'src/app/config/constants';
import {ProdGenApi} from '../apiService/prodgen.api';
import {FilterBaseService} from "../filter/filter-base.service";
import {SearchResult} from "../../resources/models/search-result";
import {map} from "rxjs/operators";
import {ALLOWABLE_CONTENT_TYPES} from "../../resources/constants/allowable-types";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {FilterStateService} from "../../state/filter/filter-state";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService extends FilterBaseService {

  searchResultScroll$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient,
              private v1Service: ProdGenApi,
              private v2Service: Apiv2Service,
              protected override route: ActivatedRoute,
              protected override router: Router,
              protected override location: Location,
              protected override filterState: FilterStateService,
              ) {
      super(route, router, location, filterState);
    }


  fetchSearchResults(searchTerms: string): Observable<any> {
    this.filterState.updateIsLoaded(false);

    if (!searchTerms) {
      this.filterState.updateIsLoaded(true);
      return of([]).pipe(
        tap(results => this.filterState.updateData(results))
      );
    }

    // todo integrate with backend, make models, move this url somewhere better for future use

    // TODO - should use v2 when endpoint is ready
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/search';
    const queryParams = new HttpParams({fromObject: {searchTerms: searchTerms}})
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));

    return this.http.post<{results: SearchResult[]}>(url, "", {headers: headers, params: queryParams}).pipe(
      map(data => data?.results?.map(r => new SearchResult(r)) || []),
      map(results => results.filter(r => ALLOWABLE_CONTENT_TYPES.includes(r.contentType))),
      tap(results => this.filterState.updateData(results)),
      tap(results => this.filterState.updateIsLoaded(true))
    );
  }

  searchResultsScroll(): void {
    this.searchResultScroll$.next('');
  }
}
