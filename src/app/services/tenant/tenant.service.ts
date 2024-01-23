import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AppComponent } from '../../app.component';
import { AuthorizationService } from '../../components/dev-authorization/authorization.service';
import { GetTenantResponse } from '../../resources/models/tenant/tenant';
import { SessionStorageService } from '../storage/services/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(
    private httpClient: HttpClient,
    private authorizationService: AuthorizationService,
    private sessionStorage: SessionStorageService,
  ) {}

  public getTenantDetails(orgId: number, tenantId: string) {
    const headers = this.authorizationService.getHeaders();
    const url: string = `${this.apiUrl}/organizations/${orgId}/tenants/${tenantId}`;

    // When initially called, store current tenant details in state service
    return this.httpClient.get<GetTenantResponse>(url, { headers }).pipe(
      tap((res) => {
        this.sessionStorage.setItem('tenantDetails', res.tenant);
      }),
    );
  }
}
