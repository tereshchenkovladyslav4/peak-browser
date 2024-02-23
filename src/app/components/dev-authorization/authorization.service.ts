import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { AppComponent } from '../../app.component';
import { catchError, tap } from 'rxjs/operators';
import { SessionStorageService } from '../../services/storage/services/session-storage.service';
import { APIV2AccessKey } from '../../services/apiService/classFiles/class.authorization';
import { LocalStorageService } from '../../services/storage/services/local-storage.service';
import { ProdGenApi } from '../../services/apiService/prodgen.api';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  // The key that authenticates a user with the API.
  private userToken: any;

  private typedToken: {
    bearerToken: string;
    expiration: Date | null;
    orgId: number;
    tenantId: string;
    userId: string;
  };

  private loggedInSource = new Subject<boolean>();
  public loggedIn$ = this.loggedInSource.asObservable();

  // The base URL for the API.
  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService,
  ) {}

  public getHeaders(): any {
    const token = this.sessionStorage.getItem<any>('tenantInformation');

    return {
      apiKey: environment.apiKey,
      'Content-Type': 'application/json',
      Authorization: `${token.bearerToken}`, // added by sakib
      // 'Authorization': `bearer_${AuthorizationService.userToken?.token}`
      // 'Authorization': `${AuthorizationService.userToken?.bearerToken}`
    };
  }

  public async logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Clear stored tokens.
      this.userToken = null;
      this.typedToken = null;

      this.loggedInSource.next(false);

      resolve(null);
    });
  }

  getUserId(): string {
    return this.getUserToken()?.['userId'] ?? this.getUserToken()?.userId;
  }

  public setUserToken(userToken: any) {
    this.userToken = userToken;
    this.typedToken = {
      bearerToken: userToken.bearerToken,
      expiration: userToken.expiration,
      orgId: userToken.orgID,
      tenantId: userToken.tenantid,
      userId: userToken.userId,
    };
    this.sessionStorage.setItem('tenantInformation', userToken);
  }

  public getUserToken(): any {
    if (this.userToken != null) {
      return this.userToken;
    }
    return this.sessionStorage.getItem<any>('tenantInformation');
  }

  switchTenant(tenantId: string): Observable<APIV2AccessKey> {
    const param = {
      tenantId: tenantId,
      timeOffset: (new Date().getTimezoneOffset() / 60) * -1,
    };
    const headers = this.getHeaders();
    return this.httpClient.post<APIV2AccessKey>(`${this.apiUrl}/authorization/switch`, param, { headers }).pipe(
      tap((res) => {
        this.saveAuthData(res.tenantid, res);
        this.loggedInSource.next(!!res);
      }),
      catchError(this.errorHandler.bind(this)),
    );
  }

  public saveAuthData(tenantId: string, apiV2AccessKey: APIV2AccessKey) {
    this.localStorage.setItem('DefaultTenant', tenantId);
    this.sessionStorage.setItem('currentTenant', tenantId);
    this.localStorage.setItem('lastUsedTenant', tenantId);
    ProdGenApi.setAPIV2BearerToken(apiV2AccessKey);
    this.setUserToken(apiV2AccessKey);
  }

  // error handler
  private errorHandler(response: any) {
    const error = response.error;
    const keys = Object.keys(error);
    const key = keys[0];
    let message = error[key];
    if (response.status === 401) {
      this.router.navigate(['login']);
    }
    if (error[key] instanceof Array) {
      message = error[key][0];
    }
    //this.toastr.error(message);
    return throwError({ messages: message, error });
  }
}
