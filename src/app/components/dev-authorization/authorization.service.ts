import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { AppComponent } from '../../app.component';
import { catchError, tap } from 'rxjs/operators';
import { CONSTANTS } from '../../config/constants';
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

  private get apiV1Url(): string {
    return environment.apiUrlV1;
  }

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private sessionStorage: SessionStorageService,
    private localStorage: LocalStorageService,
  ) {}

  public getTenantHeader(): any {
    return {
      apiKey: environment.apiKey,
      'Content-Type': 'application/json',
    };
  }

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

  // tslint:disable-next-line:max-line-length
  public async login(username: string, password: string, language: string, tenantId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = this.getTenantHeader();
      const body = {
        email: username,
        password,
        language,
        tenantId,
        timeOffset: (new Date().getTimezoneOffset() / 60) * -1,
        timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
        returnLongLivedToken: false,
      };
      const url = `${this.apiV1Url}/authorization/userToken`;
      this.httpClient.post(url, body, { headers }).subscribe({
        next: (res) => {
          this.sessionStorage.setItem('tenantInformation', res);

          // Clear the typed token because it will
          // be recalculated the next time it is fetched.
          // If it's not cleared, the cached version will
          // be fetched and could be out of date if the
          // user just switched tenants.
          this.userToken = res;
          this.typedToken = null;

          this.loggedInSource.next(res ? true : false);

          resolve(res ? true : false);
        },
        error: (err) => reject(err),
      });
    });
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

  // tslint:disable-next-line:max-line-length
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (!this.userToken) {
      this.sessionStorage.clear();
      let url = window.location.protocol + '//' + window.location.host + '/login';
      this.router.navigateByUrl(url);
      return false;
    }
    return true;
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
        this.sessionStorage.setItem('tenantInformation', res);
        ProdGenApi.setAPIV2BearerToken(res);

        this.localStorage.setItem('DefaultTenant', res.tenantid);
        this.sessionStorage.setItem('currentTenant', res.tenantid);
        this.localStorage.setItem('lastUsedTenant', res.tenantid);

        // Clear the typed token because it will
        // be recalculated the next time it is fetched.
        // If it's not cleared, the cached version will
        // be fetched and could be out of date if the
        // user just switched tenants.
        this.userToken = res;
        this.typedToken = null;

        this.loggedInSource.next(res ? true : false);
      }),
      catchError(this.errorHandler.bind(this)),
    );
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
