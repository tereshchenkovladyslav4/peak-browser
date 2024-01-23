import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tenant } from './../../services/apiService/classFiles/v2-tenants';
import { TranslationService } from 'src/app/services/translation.service';

import { AuthorizationService } from './authorization.service';
import { Router } from '@angular/router';
import { Language } from './../../services/apiService/classFiles/vs-language';
import { Apiv2Service } from './../../services/apiService/apiv2.service';
import { ProdGenApi } from './../../services/apiService/prodgen.api';
import { AuthenticationStateService } from 'src/app/state/authentication/authentication-state.service';
import { LocalStorageService } from 'src/app/services/storage/services/local-storage.service';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { APIV2AccessKey } from 'src/app/services/apiService/classFiles/class.authorization';
import { TenantService } from '../../services/tenant/tenant.service';
//import { AuthorizationTenant } from '../models/authorizationInfo';
//import { UserService } from '../services/user.service';
//import { SessionTimeoutService } from '../services/session-timeout.service';

@Component({
  selector: 'app-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  allTenants: Array<Tenant>;
  // Field for controlling flow through the
  // login process.
  formStatus: FormStatus = FormStatus.GettingEmail;
  language: Language;
  allLanguages: Array<Language>;

  emailLabel = "Email";
  langLabel = "Language";
  langSelect = "Select a language";
  loadLabel = "Loading, please wait...";
  nextLabel = "Continue >>";

  constructor(private formBuilder: FormBuilder,
    private translationService: TranslationService,
    private authorizationService: AuthorizationService,
    private apiV2Service: Apiv2Service,
    private apiV1Service: ProdGenApi,
    private router: Router,
    private authState: AuthenticationStateService,
    private localStorage: LocalStorageService,
    private sessionStorage: SessionStorageService,
    private tenantService: TenantService  ) { }
    
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [''],
      password: [''],
      rememberMe: [true],
      tenant: [null, Validators.required],
      language: ["en"]
    });

    this.translationService.getLanguages().subscribe(response => {
      this.allLanguages = response.languageSet;
    });

    if (window.location.href.includes("localhost")) {
      this.translationService.loadTranslationFile(this.loginForm.value.language.toLowerCase()).subscribe(response => {
        this.translationService.loadTranslationFileDataFromVariable(response);
        this.loadLanguageLabels();
      });
    }
    else {
      // Don't allow people to land on the login page in production. Redirect
      // them to the user portal.
      this.router.navigate(['/external', { externalUrl: 'http://localhost:4200' }])
    }



    this.checkLoginStatus(); // check information for the login user ......added by sakib
    // Listen for changes to the language selection
    // and update the translation service as needed.
    this.loginForm.get('language').valueChanges.subscribe(newLanguageCode => {
      //this.translationService.setCurrentLanguage(newLanguageCode);
      this.translationService.loadTranslationFile(newLanguageCode).subscribe(response => {
        // console.log("loaded translation file");
        this.translationService.loadTranslationFileDataFromVariable(response);
        this.loadLanguageLabels();
      }, err => {
        this.translationService.loadTranslationFile(this.loginForm.value.language.toLowerCase()).subscribe(response2 => {
          this.translationService.loadTranslationFileDataFromVariable(response2);
          this.loadLanguageLabels();
        });
      });
    });

    // Prevent the webpage from scrolling when the
    // login modal is showing.
    document.querySelector('body').classList.add('preventScrolling');
  }

  loadLanguageLabels() {
    let v_Email = this.translationService.getTranslationFileData("app-login-component.email-label");
    if (v_Email != null && v_Email != "") {
      this.emailLabel = v_Email;
    }

    let v_Language = this.translationService.getTranslationFileData("app-login-component.language-label");
    if (v_Language != null && v_Language != "") {
      this.langLabel = v_Language;
    }

    let v_LanguageSelect = this.translationService.getTranslationFileData("app-login-component.language-select-message");
    if (v_LanguageSelect != null && v_LanguageSelect != "") {
      this.langSelect = v_LanguageSelect;
    }

    let v_Loading = this.translationService.getTranslationFileData("app-login-component.loading-message");
    if (v_Loading != null && v_Loading != "") {
      this.loadLabel = v_Loading;
    }

    let v_Next = this.translationService.getTranslationFileData("app-login-component.next-step-label");
    if (v_Next != null && v_Next != "") {
      this.nextLabel = v_Next;
    }
  }

  submitEmail(): void {
    // Use the provided email address to try and get
    // information about the organization/tenants the
    // user belongs to. These will be used to determine
    // the applied theme, tenant list, password/policy
    // settings, etc shown on the second step of the
    // login modal.
    this.apiV2Service.getTenants(this.loginForm.value.email).subscribe(data => {
      if (!data) {
        alert(`Could not find a user for the email: ${this.loginForm.value.email}`);
        return;
      }

      this.allTenants = [];
      for (const t of data.tenantList) {
        this.allTenants.push(new Tenant(t.tenantID, t.name));
      }
      this.loginForm.patchValue({ tenant: this.allTenants[0] });
      this.formStatus = FormStatus.GettingPassword;
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      alert(`One or more fields are invalid or missing.`);
      return;
    }
    this.formStatus = FormStatus.Loading;
    /////////////////////////////////////////////////
    this.apiV1Service.GetUserAccessKey(
      this.loginForm.value.email,
      this.loginForm.value.password,
      this.loginForm.value.tenant.id,
      this.loginForm.value.language.toLowerCase(),
      false).subscribe(r => {

        if (r.userAccessKey.length > 0) {

          this.localStorage.setItem("DefaultTenant", r.tenantid);
          this.sessionStorage.setItem("currentTenant", r.tenantid);
          this.localStorage.setItem("lastUsedTenant", r.tenantid);

          let tempUserAccessKey = r.userAccessKey as string;
          let tempAPIV2AccessKey = r.apiV2AccessKey;
          let tempRememberMeToken = r.longLivedToken as string;

          ProdGenApi.setUserIsExternal(r.isExternalUser);


          if (tempUserAccessKey != null && tempUserAccessKey != "") {
            //save email
            this.localStorage.setItem("userEmail", this.loginForm.value.email);

            ProdGenApi.setUserAccessKey(tempUserAccessKey as string);
            ProdGenApi.setAPIV2BearerToken(tempAPIV2AccessKey);
            this.sessionStorage.setItem('tenantInformation', tempAPIV2AccessKey);

            // Clear the typed token because it will
            // be recalculated the next time it is fetched.
            // If it's not cleared, the cached version will
            // be fetched and could be out of date if the
            // user just switched tenants.
            this.authorizationService.setUserToken(tempAPIV2AccessKey);

            //this._sharedService.setV2BearerToken(tempAPIV2AccessKey);

            // Allow the webpage to scroll again and navigate
            // to the home component. This will eventually
            // need to allow redirects to whichever path the
            // user was attempting to access.
            document.querySelector('body').classList.remove('preventScrolling');
            this.sessionStorage.setItem('tenantEmail', this.loginForm.value.email);
            // added to redirect to admin
            this.router.navigate(['home']);
            //this.timeoutService.start();
          }

          // redirect to url user attempted to go to before logging in
          const redirectUrl = this.authState.getRedirectUrl();
          if (redirectUrl) {
            // want user to go back to home page if they go back (location.back()) from the redirected url
            history.pushState({}, '', 'home')
            this.router.navigateByUrl(redirectUrl);
            this.authState.setRedirectUrl(undefined);
          }
        }
      },
        error => {
          alert(`There was a problem with your username or password.\n${error.status}: ${error.statusText}`);
          this.reset();

        }
      );
  }

  reset(): void {
    this.formStatus = FormStatus.GettingEmail;
  }

  checkLoginStatus() {
    const infoTenant = this.sessionStorage.getItem<APIV2AccessKey>('tenantInformation');
    const infoV1Tenant = this.sessionStorage.getItem<string>('userAccessKey');
    if (!infoTenant && infoV1Tenant) {

    }
  }

}
enum FormStatus {
  GettingEmail,
  GettingPassword,
  Loading,
  Error
}
