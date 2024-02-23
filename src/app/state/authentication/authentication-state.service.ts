import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';


export const GUID_EMPTY = "00000000-0000-0000-0000-000000000000";

interface State {
  isLoggedIn: boolean;
  currentUserId: string;
  currentTenantId: string;
}

const DEFAULT_STATE: State = {
  isLoggedIn: false,
  currentUserId: GUID_EMPTY,
  currentTenantId: GUID_EMPTY
}
@Injectable({
  providedIn: 'root'
})
export class AuthenticationStateService {

  state$: BehaviorSubject<State> = new BehaviorSubject<State>(DEFAULT_STATE);

  private redirectUrl: string; // calling url user attempted to go to before we redirected to login

  constructor(private sessionStorage: SessionStorageService) {
  }

  resetLoginState(): void {
    //reset session items so when isLoggedIn is called, state 'isLoggedIn' property remains false until log in
    this.sessionStorage.setItem('tenantInformation', null);
    this.sessionStorage.setItem('userAccessKey', null);
    this.sessionStorage.setItem("tenantDetails", null)
    this.state$.next({...this.state$.getValue(), isLoggedIn: false})
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.isLoggedIn)
    );
  }

  getCurrentUserId(): Observable<string> {
    return this.state$.pipe(
      map(state => state.currentUserId)
    );
  }

  getCurrentTenantId(): Observable<string> {
    return this.state$.pipe(
      map(state => state.currentTenantId)
    );
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  isLoggedIn(): boolean {
      if (!this._isLoggedIn()) {
        const infoTenant: any = this.sessionStorage.getItem('tenantInformation');
        const infoV1Tenant: any = sessionStorage.getItem('userAccessKey');
        if (infoTenant && infoV1Tenant) {
          this.updateState({
            isLoggedIn: true,
            currentTenantId: infoTenant.tenantid,
            currentUserId: infoTenant.userId
          })
        }
      }

      return this._isLoggedIn();
  }

  private _isLoggedIn(): boolean {
    return this.state$.getValue().isLoggedIn;
  }

  private updateState(state: State) {
    this.state$.next(state);
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url
  }
}
