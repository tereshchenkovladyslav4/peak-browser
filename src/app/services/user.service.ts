import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError, ReplaySubject, filter, mergeMap, tap, BehaviorSubject, Subject} from 'rxjs';
import {AuthorizationService} from '../components/dev-authorization/authorization.service';
//import { ToastrService } from 'ngx-toastr';
import {Router} from '@angular/router';
import {AppComponent} from '../app.component';
import {take, map, catchError, debounce, concatMap, takeUntil} from 'rxjs/operators';
import {TranslationService} from 'src/app/services/translation.service';
import {AuthenticationStateService} from "../state/authentication/authentication-state.service";
import {ChangePasswordRequest, EndUserModifyUserRequest, EndUserModifyUserResponse, GetAllUserSettingsResponse, GetUserAccessToContentResponse, GetUserResponse, ModifiedUserSettingsResponse, ModifyUserSettingsRequest, UpdateDisplayNameResponse, UpdatePasswordResponse, UpdateUserDisplayNameRequest, UserFull, UserSettings} from "../resources/models/user";
import { SessionStorageService } from './storage/services/session-storage.service';
import { Tenant } from './apiService/classFiles/v2-tenants';
import { Apiv2Service } from './apiService/apiv2.service';
import { UserStateService } from '../state/user/user-state.service';

@Injectable({
  providedIn: 'root'
})
//Be sure to call Initialize()!!!
export class UserService implements OnDestroy{
  private unsubscribe$ = new Subject<void>();
  
  userSettings$: BehaviorSubject<UserSettings> = new BehaviorSubject<UserSettings>(null);
  allTenants: Array<Tenant> = [];

  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(private userState: UserStateService,
              private httpClient: HttpClient,
              private authorizationService: AuthorizationService,
              private translationService: TranslationService,
              private authState: AuthenticationStateService,
              private sessionStorage: SessionStorageService,
              private apiV2Service: Apiv2Service,) {

    this.authState.getIsLoggedIn().pipe(
      filter(isLoggedIn => isLoggedIn),
      mergeMap(() => this.authState.getCurrentUserId()),
      concatMap((userId) => this.refreshLoggedInUser(userId)),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  public refreshLoggedInUser(userID?: string): Observable<GetUserResponse> {
    const userId = this.getUserId(userID);
    const headers = this.authorizationService.getHeaders();
    const url: string = `${this.apiUrl}/users/${userId}?resultType=Full`; //ALWAYS a **Full** user type!

    return this.httpClient.get<GetUserResponse>(url, { headers }).pipe(
      tap(res => {
        this.userState.updateCurrentUser(res.user);
        this.getAllTenants(res.user.email);
      }),
      catchError(err => this.errorHandler(err))
    );
  }

  updateUserPassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<UpdatePasswordResponse> {
    const headers = this.authorizationService.getHeaders();
    const body: ChangePasswordRequest = { currentPassword, newPassword, confirmNewPassword };
    return this.httpClient
      .put<UpdatePasswordResponse>(`${this.apiUrl}/users/enduser/password`, body, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  private getAllTenants(email: string) {
    this.apiV2Service.getTenants(email).subscribe(data => {
      this.allTenants = [];
      for (const t of data.tenantList) {
        this.allTenants.push(new Tenant(t.tenantID, t.name));
      }
    });
  }

  updateUserDisplayName(displayName: string): Observable<UpdateDisplayNameResponse> {
    const headers = this.authorizationService.getHeaders();
    const body: UpdateUserDisplayNameRequest = { displayName };
    return this.httpClient
      .put<UpdateDisplayNameResponse>(`${this.apiUrl}/users/enduser/displayName`, body, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  updateUserProfileImage(updatedImageUrl: string): Observable<EndUserModifyUserResponse> {
    const headers = this.authorizationService.getHeaders();
    const body: EndUserModifyUserRequest = { updatedImageUrl };
    return this.httpClient.put<EndUserModifyUserResponse>(`${this.apiUrl}/users/enduser/profileimage`, body, { headers })
    .pipe(catchError(this.errorHandler.bind(this)))
  }
  
  getUserAccessToContent(contentId: string): Observable<GetUserAccessToContentResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<GetUserAccessToContentResponse>(`${this.apiUrl}/users/content/${contentId}`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }
  
  // USER SETTINGS

  getUserSettings(userID: string): Observable<GetAllUserSettingsResponse> {
    const userId = this.getUserId(userID);
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get(`${this.apiUrl}/users/${userId}/settings`, { headers })
      .pipe(
        tap((res: GetAllUserSettingsResponse) => this.userSettings$.next(res?.userSettings)),
        catchError(this.errorHandler.bind(this)));
  }

  modifyUserSettings(userID: string, body: ModifyUserSettingsRequest): Observable<ModifiedUserSettingsResponse> {
    const userId = this.getUserId(userID);
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .put<ModifiedUserSettingsResponse>(`${this.apiUrl}/users/${userId}/settings`, body, { headers })
      .pipe(
        tap(() => this.userSettings$.next({...this.userSettings$.getValue(), ...body})),
        catchError(this.errorHandler.bind(this)));
  }

  /**
   * If userID is null, fallback to getting userID from Session Storage.
   * @param userId potential userId
   * @returns userId that is less likely to be null or undefined
   */
  private getUserId(userId: string): string {
    if (userId === null) {
      return this.sessionStorage.getItem<any>('tenantInformation')?.userId;
    }

    return userId;
  }

  private errorHandler(response: any) {
    const error = response.error;
    const keys = Object.keys(error);
    const key = keys[0];
    let message = error[key];

    if (response.status === 0) {
      console.log(this.translationService.getTranslationFileData('general-toast-area.server-error-toast-message'));
    }

    if (error[key] instanceof Array) {
      message = error[key][0];
    }

    return throwError({messages: message, error});
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
