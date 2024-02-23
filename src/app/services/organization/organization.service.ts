import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { GetAllTenantSettingsResponse } from '../apiService/classFiles/v2-organizations';
import { ProdGenApi } from '../apiService/prodgen.api';
import { HttpClient } from '@angular/common/http';
import { Apiv2Service } from '../apiService/apiv2.service';
import { AppComponent } from 'src/app/app.component';
import { GetPasswordSettingsResponse, OrganizationInfo } from '../../resources/models/organization/organization';
import { THEME_TYPE } from 'src/app/resources/enums/theme-type';
import { Theme, ThemeDTO, mapThemeData } from 'src/app/resources/models/theme';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(private http: HttpClient, private v2Service: Apiv2Service) {}

  getOrganizationDetails(orgId: number): Observable<OrganizationInfo> {
    const headers = this.v2Service.getv2AuthHeaders();
    return this.http
      .get<{ organization: OrganizationInfo }>(`${this.apiUrl}/organizations/` + orgId, { headers })
      .pipe(map(({ organization }) => organization));
  }

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

  /**
   * Gets the current user's theme
   */
  getTheme(): Observable<Theme> {
    const headers = this.v2Service.getv2AuthHeaders();
    const url = `${this.apiUrl}/organizations/enduser/themes/current`;
    return this.http.get<{ theme: ThemeDTO }>(url, { headers }).pipe(map(({ theme }) => mapThemeData(theme)));
  }
}
