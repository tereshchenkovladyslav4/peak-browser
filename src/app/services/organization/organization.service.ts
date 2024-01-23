import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetAllTenantSettingsResponse } from '../apiService/classFiles/v2-organizations';
import { ProdGenApi } from '../apiService/prodgen.api';
import { HttpClient } from '@angular/common/http';
import { Apiv2Service } from '../apiService/apiv2.service';
import { AppComponent } from 'src/app/app.component';
import { GetPasswordSettingsResponse } from '../../resources/models/organization/organization';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(private http: HttpClient,
              private v2Service: Apiv2Service) { }

  getAllTenantSettings(): Observable<GetAllTenantSettingsResponse> {
    const tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
    const orgId = ProdGenApi.getAPIV2AccessKey().orgID;
    const url = `${this.apiUrl}/organizations/${orgId}/tenant/${tenantId}/settings`;
    const headers = this.v2Service.getv2AuthHeaders();

    return this.http.get<GetAllTenantSettingsResponse>(url, { headers: headers });
  }

  getPasswordSettings(): Observable<GetPasswordSettingsResponse> {
    const tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
    const orgId = ProdGenApi.getAPIV2AccessKey().orgID;
    const url = `${this.apiUrl}/organizations/${orgId}/tenant/${tenantId}/settings/passwords`;
    const headers = this.v2Service.getv2AuthHeaders();

    return this.http.get<GetPasswordSettingsResponse>(url, { headers: headers });
  }
}
