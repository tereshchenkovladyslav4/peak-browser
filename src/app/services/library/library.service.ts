import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {map} from "rxjs/operators";
import {ProdGenApi} from "../apiService/prodgen.api";
import {Apiv2Service} from "../apiService/apiv2.service";
import {Library} from "../../resources/models/library";
import {LibraryStateService} from "../../state/library/library-state.service";
import {ConsumesState} from "../consumes-state/consumes-state.service";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibraryService extends ConsumesState<LibraryStateService> {

  constructor(private http: HttpClient,
              private v1Service: ProdGenApi,
              private v2Service: Apiv2Service,
              private libraryState: LibraryStateService) {
    super(libraryState);
  }

  getLibraries(): Observable<Library[]> {
    this.libraryState.updateIsLoaded(false);
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/libraries';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({fromObject: {location: 'Tenant', accessibility: 'SharedWithUser'}});

    return this.http.get<Library[]>(url, {headers: headers, params: params}).pipe(
      tap(libraries => this.libraryState.updateLibraries(libraries)),
      tap(results => this.libraryState.updateIsLoaded(true))
    )
  }

  fetchLibrary(id) {
    this.libraryState.updateIsLoaded(false);
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + `/libraries/${id}`;
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));

    return this.http.get<{library: Library}>(url, {headers: headers}).pipe(
      map((data) => data.library),
      tap(library => this.libraryState.updateLibraries([library])),
      tap(results => this.libraryState.updateIsLoaded(true))
    )
  }
}
