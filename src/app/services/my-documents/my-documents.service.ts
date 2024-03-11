import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Apiv2Service } from '../apiService/apiv2.service';
import { ProdGenApi } from '../apiService/prodgen.api';
import { AuthorizationService } from '../../components/dev-authorization/authorization.service';
import { Document } from '../../resources/models/content';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyDocumentsService {
  constructor(
    private http: HttpClient,
    private v1Service: ProdGenApi,
    private v2Service: Apiv2Service,
    private authorizationService: AuthorizationService,
  ) {}

  fetchMyDocuments(): Observable<Document[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const userId = this.authorizationService.getUserId();
    const url = environment.apiUrlV2 + `/content/userdocument/${userId}`;
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));

    return this.http.get<Document[]>(url, { headers: headers });
  }
}
