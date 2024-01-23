import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from './components/dev-authorization/authorization.service'
import { ProdGenApi } from './services/apiService/prodgen.api';
import {AuthenticationStateService} from "./state/authentication/authentication-state.service";
import {Observable, Subject} from "rxjs";
import { TranslationService } from './services/translation.service';
import {ROUTE_TITLE_MAP} from "./resources/constants/app-routes";
import { SettingsStateService } from './state/settings/settings-state.service';
import { SessionStorageService } from './services/storage/services/session-storage.service';
import {BookmarksService} from "./services/bookmarks/bookmarks.service";
import {takeUntil} from "rxjs/operators";
import { BookmarksStateService } from './state/bookmarks/bookmarks-state.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'ep-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Pinnacle Series';

  public static readonly apiUrl: string = environment.apiUrlV2;

  public isIE = false;
  public isLoggedIn$: Observable<boolean> = this.authState.getIsLoggedIn();
  isMainPage = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router,
    private authorizationService: AuthorizationService,
    private authState: AuthenticationStateService,
    private translationService: TranslationService,
    private settingsState: SettingsStateService,
    private sessionStorage: SessionStorageService,
    private bookmarksService: BookmarksService,
    private bookmarksState: BookmarksStateService
  ) {
  }

  ngOnInit() {
    this.isIE = navigator.userAgent.indexOf("MSIE") != -1;
    if (this.isIE == false) {
      this.isIE = navigator.userAgent.indexOf("Trident") != -1;
    }

    ProdGenApi.setAPIKey('9d391065-2abe-4681-9ea3-a78557a42a13');

    // console.log("api key set");

    this.router.events.subscribe(_ => {
      // USEFUL for debugging route info across whole site
      // console.log(_);

      const url = this.router?.url;
      this.isMainPage = !!ROUTE_TITLE_MAP[url];
    });

    // get information about the current user
    const infoTenant = this.sessionStorage.getItem<any>('tenantInformation');

    this.checkLoginStatus();

    this.isLoggedIn$.subscribe(status => {
      if (status) {
        this.performSessionSetup();
      }
    });


    window.addEventListener("message", (event) => {

      if (this.canAcceptMessage(event.origin) && event.data != null) {
        if (typeof (event.data) != "string")
          return;

        let token: string = event.data as string;
        try {
          var messagePrefix = "param|:";
          var lang = "en";
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

            this.translationService.loadTranslationFile(language).subscribe(response => {
              // console.log("loaded translation file");
              this.translationService.loadTranslationFileDataFromVariable(response);
            });

            this.performSessionSetup();


            this.router.navigate(['/home']);
          }

        }
        catch { }
      }

    }, false);

    // let the app that launched this window know we are ready to receive messages
    if (window.opener != null && this.authorizationService.getUserToken() == null) {
      window.opener.postMessage("peak_opened", "*");
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  checkLoginStatus() {
    if (!this.authState.isLoggedIn()) {
      // store url user attempted to go to before logging in
      if (window.location.pathname != '/peak/login'){
        this.authState.setRedirectUrl(window.location.pathname);
      }
      

      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['login']);
      });
    }
  }


  performSessionSetup() {
    this.settingsState.performSessionSetup();

    // setup bookmarks map
    this.bookmarksService
      .setInitialBookmarksState()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }


  onRouteActivated(ev: any) {
    this.checkLoginStatus();
  }



  isExternalUser() {
    return false;
  }

  private canAcceptMessage(host: string): boolean {
    if (host == "localhost:4200" ||
      host == "http://localhost:4200" ||
      host == "http://localhost:4201" ||
      host == "http://localhost:4202" ||
      host == "https://prodgenbrowser-pw.azurewebsites.net" ||
      host == "https://portal.pinnacleseries.com" ||
      host == "https://portalbeta.pinnacleseries.com" ||
      host == "https://productivitynow.imaginit.com" ||
      host == "https://productivitynow.ascented.com" ||
      host == "https://productivitynow.rand3d.com") {

      if (host == "https://productivitynow.imaginit.com" ||
        host == "https://productivitynow.ascented.com" ||
        host == "https://productivitynow.rand3d.com") {
        window.document.title = "ProductivityNOW";
      }

      return true;
    }
    return false;
  }
}
