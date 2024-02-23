import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from './components/dev-authorization/authorization.service';
import { ProdGenApi } from './services/apiService/prodgen.api';
import { AuthenticationStateService } from './state/authentication/authentication-state.service';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { TranslationService } from './services/translation.service';
import { ROUTE_TITLE_MAP } from './resources/constants/app-routes';
import { SettingsStateService } from './state/settings/settings-state.service';
import { SessionStorageService } from './services/storage/services/session-storage.service';
import { BookmarksService } from './services/bookmarks/bookmarks.service';
import { map, takeUntil, tap, timeout } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Select, Store } from '@ngxs/store';
import { ThemeActions } from './state/themes/themes.actions';
import { LoggedInUserData } from './resources/models/authorization';
import { OrganizationService } from './services/organization/organization.service';
import { OrganizationInfo } from './resources/models/organization/organization';
import { ThemeState } from 'src/app/state/themes/themes.state';
import { TenantMini } from './resources/models/tenant/tenant';

@Component({
  selector: 'ep-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @Select(ThemeState.isThemeLoading) isThemeLoading$: Observable<boolean>;
  @Select(ThemeState.backgroundImage) backgroundImage$: Observable<string>;

  title = 'Pinnacle Series';
  backgroundImage: string = 'assets/images/mountains-bg.png';

  public static readonly apiUrl: string = environment.apiUrlV2;

  public isIE = false;
  isMainPage = false;
  loggedInUserData: LoggedInUserData;
  tenantDetails: TenantMini;

  isLoggedIn$: Observable<boolean> = this.authState.getIsLoggedIn();
  isLoadingTheme$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authorizationService: AuthorizationService,
    private authState: AuthenticationStateService,
    private translationService: TranslationService,
    private settingsState: SettingsStateService,
    private sessionStorage: SessionStorageService,
    private bookmarksService: BookmarksService,
    private organizationService: OrganizationService,
    private store: Store
  ) {}

  ngOnInit() {
    this.isLoadingTheme$ = combineLatest([this.isLoggedIn$, this.isThemeLoading$]).pipe(
      map(([isLoggedIn, isThemeLoading]) => {
        // ignore theme loading value if user isn't logged in
        if (!isLoggedIn) {
          return false;
        }

        return isThemeLoading;
      })
    );

    this.isIE = navigator.userAgent.indexOf('MSIE') != -1;
    if (this.isIE == false) {
      this.isIE = navigator.userAgent.indexOf('Trident') != -1;
    }

    ProdGenApi.setAPIKey('9d391065-2abe-4681-9ea3-a78557a42a13');

    // console.log("api key set");

    this.router.events.subscribe((_) => {
      // USEFUL for debugging route info across whole site
      // console.log(_);

      const url = this.router?.url;
      this.isMainPage = !!ROUTE_TITLE_MAP[url];
    });

    this.isLoggedIn$.subscribe((status) => {
      if (status) {
        this.performSessionSetup();
      }
    });

    window.addEventListener(
      'message',
      (event) => {
        if (this.canAcceptMessage(event.origin) && event.data != null) {
          if (typeof event.data != 'string') return;

          let token: string = event.data as string;
          try {
            var messagePrefix = 'param|:';
            var lang = 'en';
            let params = token.split(messagePrefix);

            if (params.length == 4) {
              let v1Auth = params[1];
              // console.log(v1Auth);

              let v2Auth = JSON.parse(params[2]);
              // console.log(v2Auth);

              let language = params[3];
              // console.log(language);

              // set the authorization token to give us access
              ProdGenApi.setUserAccessKey(v1Auth as string);
              ProdGenApi.setAPIV2BearerToken(v2Auth);
              this.authorizationService.setUserToken(v2Auth);

              this.translationService.loadTranslationFile(language).subscribe((response) => {
                this.translationService.loadTranslationFileDataFromVariable(response);
              });

              this.performSessionSetup();

              this.router.navigate(['/home']);
            }
          } catch {}
        }
      },
      false
    );

    // let the app that launched this window know we are ready to receive messages
    if (window.opener != null && this.authorizationService.getUserToken() == null) {
      window.opener.postMessage('peak_opened', '*');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSessionSetup() {
    // setup vars from session
    this.loggedInUserData = this.sessionStorage.getItem<LoggedInUserData>('tenantInformation');
    this.tenantDetails = this.sessionStorage.getItem<TenantMini>('tenantDetails');

    this.settingsState.performSessionSetup();

    // setup bookmarks map
    this.bookmarksService.setInitialBookmarksState().pipe(takeUntil(this.destroy$)).subscribe();

    // setup org details
    this.organizationService.getOrganizationDetails(this.loggedInUserData?.orgID).subscribe({
      next: (orgInfo: OrganizationInfo) => {
        this.sessionStorage.setItem('orgDetails', orgInfo);
        this.setupTheme();
      },
      error: (err) => {
        console.log('Error getting org details: ', err);
      },
    });
  }

  private setupTheme(): void {
    this.store.dispatch(new ThemeActions.GetThemes());

    this.backgroundImage$.pipe(takeUntil(this.destroy$)).subscribe((backgroundImage) => {
      if (backgroundImage && backgroundImage.toString().trim() != '') {
        this.backgroundImage = backgroundImage;
      }
    });
  }

  isExternalUser() {
    return false;
  }

  private canAcceptMessage(host: string): boolean {
    if (
      host == 'localhost:4200' ||
      host == 'http://localhost:4200' ||
      host == 'http://localhost:4201' ||
      host == 'http://localhost:4202' ||
      host == 'https://prodgenbrowser-pw.azurewebsites.net' ||
      host == 'https://portal.pinnacleseries.com' ||
      host == 'https://portalbeta.pinnacleseries.com' ||
      host == 'https://productivitynow.imaginit.com' ||
      host == 'https://productivitynow.ascented.com' ||
      host == 'https://productivitynow.rand3d.com'
    ) {
      if (
        host == 'https://productivitynow.imaginit.com' ||
        host == 'https://productivitynow.ascented.com' ||
        host == 'https://productivitynow.rand3d.com'
      ) {
        window.document.title = 'ProductivityNOW';
      }

      return true;
    }
    return false;
  }
}
