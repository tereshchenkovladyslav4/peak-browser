import { Injectable } from '@angular/core';
import {FilterBaseService} from "../filter/filter-base.service";
import {Observable, tap} from "rxjs";
import {Library} from "../../resources/models/library";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ProdGenApi} from "../apiService/prodgen.api";
import {Apiv2Service} from "../apiService/apiv2.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {FilterStateService} from "../../state/filter/filter-state";
import {map} from "rxjs/operators";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibrariesService extends FilterBaseService {

  constructor(private http: HttpClient,
              private v1Service: ProdGenApi,
              private v2Service: Apiv2Service,
              protected override route: ActivatedRoute,
              protected override router: Router,
              protected override location: Location,
              protected override filterState: FilterStateService) {
    super(route, router, location, filterState);
  }

  getLibraries(): Observable<Library[]> {
    this.filterState.updateIsLoaded(false);
    return this.fetchLibraries().pipe(
      tap(results => this.filterState.updateData(results)),
      tap(results => this.filterState.updateIsLoaded(true))
    )
  }

  fetchLibraries(): Observable<Library[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/libraries';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({fromObject: {location: 'All', accessibility: 'SharedWithUser'}});

    return this.http.get<Library[]>(url, {headers: headers, params: params}).pipe(
      map(results => results.map(result => ({...result, topics: result.contentTopics} as Library)))
    );
  }
}
