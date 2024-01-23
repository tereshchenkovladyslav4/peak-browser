import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { APP_ROUTES, NAVIGATION_ROUTES, ROUTE_TITLE_MAP } from '../../resources/constants/app-routes';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, concatMap, filter, iif, Observable, of, startWith, tap } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { Location } from '@angular/common';
import { SearchService } from '../../services/search/search.service';
import { DropdownItem } from '../../resources/models/dropdown-item';
import { DropdownMenuService } from '../../services/dropdown-menu.service';
import { WithDropdownItemsTempCache } from '../../resources/mixins/dropdown-items-temp-cache.mixin';
import { TranslationService } from '../../services/translation.service';
import { ProdGenApi } from '../../services/apiService/prodgen.api';
import { AuthorizationService } from '../dev-authorization/authorization.service';
import { AuthenticationStateService } from '../../state/authentication/authentication-state.service';
import { SessionStorageService } from '../../services/storage/services/session-storage.service';
import { TenantMini } from '../../resources/models/tenant/tenant';
import { Apiv2Service } from '../../services/apiService/apiv2.service';
import { TenantService } from '../../services/tenant/tenant.service';
import { DialogConfig } from '../dialog/dialog-base/dialog-base.component';
import { FlexibleFrictionComponent } from '../dialog/flexible-friction/flexible-friction.component';
import { DialogService } from '../../services/dialog/dialog.service';
import { Tenant } from '../../services/apiService/classFiles/v2-tenants';
import { UserStateService } from '../../state/user/user-state.service';

@Component({
  selector: 'ep-app-bar',
  templateUrl: './app-bar.component.html',
  styleUrls: ['./app-bar.component.scss'],
})
export class AppBarComponent extends WithDropdownItemsTempCache() implements OnInit {
  form: FormGroup = this.fb.group({
    search: new FormControl('', [Validators.required]),
  });

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  title$: Observable<string>;
  userImageUrl$: Observable<string>;
  displayName$: Observable<string>;
  isUserLoaded$: Observable<boolean>;
  isFullScreen: boolean = false;
  fullScreenText: string = '';
  isUserDropdownOpened: boolean = false;
  dropdownItems: DropdownItem[];

  constructor(
    private userState: UserStateService,
    private router: Router,
    private userService: UserService,
    private layoutState: LayoutStateService,
    private location: Location,
    private fb: FormBuilder,
    private searchService: SearchService,
    private dropdownMenuService: DropdownMenuService,
    private translationService: TranslationService,
    private prodGenApi: ProdGenApi,
    private authorizationService: AuthorizationService,
    private authenticationService: AuthenticationStateService,
    private sessionStorage: SessionStorageService,
    private apiv2Service: Apiv2Service,
    private tenantService: TenantService,
    private dialogService: DialogService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setTitle();
    this.isUserLoaded$ = this.userState.currentUser.pipe(map((user) => !!user));
    this.setUserImageUrl();
    this.displayName$ = this.getUserDisplayName();
    this.setClearSearchInput();
    this.searchService.reset$.pipe(filter((r) => r?.appBarSearch)).subscribe(() => this.clearSearchInput());
    this.manageLayout();
  }

  onSearch() {
    const search = this.form.getRawValue().search;
    this.router.navigate([NAVIGATION_ROUTES.search], {
      onSameUrlNavigation: 'reload',
      queryParams: { searchTerms: search },
    });
  }

  private setTitle() {
    this.title$ = combineLatest([this.getUrl().pipe(startWith('')), this.getUserDisplayName()]).pipe(
      map(([url, userDisplayName]: [string, string]) => this.deriveTitle(url, userDisplayName)),
    );
  }

  private getUserDisplayName(): Observable<string> {
    return this.userState.currentUser.pipe(map((user) => user.displayName));
  }

  private getUrl(): Observable<string> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
    );
  }

  private deriveTitle(url: string, userDisplayName: string): string {
    if (!url || url === NAVIGATION_ROUTES.home) {
      return `Welcome, ${userDisplayName}`;
    }

    return ROUTE_TITLE_MAP[url] || null;
  }

  private setUserImageUrl() {
    this.userImageUrl$ = this.userState.currentUser.pipe(map((user) => user.imageUrl));
  }

  private setClearSearchInput() {
    this.getUrl().subscribe((url) => {
      if (!url.includes('/search')) {
        this.clearSearchInput();
      }
    });
  }

  private clearSearchInput() {
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  private manageLayout() {
    combineLatest([this.layoutState.selectIsFullScreen$, this.layoutState.selectFullScreenText$]).subscribe(
      ([isFullScreen, fullScreenText]) => {
        this.isFullScreen = isFullScreen;
        this.fullScreenText = fullScreenText;
      },
    );
  }

  closeFullscreen() {
    this.location.back();
  }

  private switchTenant(fromTenant: TenantMini, toTenant: Tenant): void {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('user-profile-menu.switch-tenant-friction-title'),
      content: this.translationService
        .getTranslationFileData('user-profile-menu.switch-tenant-friction-body')
        ?.replace('[FROM_TENANT_NAME]', fromTenant.tenantName)
        .replace('[TO_TENANT_NAME]', toTenant.name),
      buttonType: 'green',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.confirm'),
    };

    this.dialogService
      .open(FlexibleFrictionComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .pipe(
        concatMap((res) => iif(() => !!res, this.authorizationService.switchTenant(toTenant.id), of(null))),
        concatMap((res) => iif(() => !!res, this.tenantService.getTenantDetails(res.orgID, res.tenantid), of(null))),
        tap((res) => {
          if (res) {
            this.router.navigateByUrl(`/${APP_ROUTES.home}`).then(() => window.location.reload());
          }
        }),
        take(1),
      )
      .subscribe();
  }

  private navigateToUserPage(): void {
    this.router.navigate([NAVIGATION_ROUTES.profile]);
  }

  openSupport(): void {
    this.apiv2Service.getZendeskRedirectURL().subscribe((res) => {
      window.open(res.redirectURL, '_blank');
    });
  }

  private signOutAction(): void {
    //set user tokens to null
    this.authorizationService.logout().then((userToken) => {
      //if token is null, end session, and navigate to login
      if (userToken === null) {
        this.prodGenApi.EndSession();
        this.authenticationService.resetLoginState();
        this.router.navigate([NAVIGATION_ROUTES.login]);
        window.opener = null;
      }
    });
  }

  protected override constructDropdownItems() {
    const currentTenantDetails: TenantMini = this.sessionStorage.getItem('tenantDetails');
    const tenantMenus = this.userService.allTenants.map((item) => {
      return {
        iconUrl: item.id === currentTenantDetails.tenantId ? 'assets/images/check-green.svg' : '',
        text: item.name,
        visible: true,
        action: () => {
          if (item.id !== currentTenantDetails.tenantId) {
            this.switchTenant(currentTenantDetails, item);
          }
        },
      };
    });
    this.dropdownMenuService
      .addCustomItem({
        iconUrl: 'profile',
        text: '',
        visible: true,
        action: () => {},
        children: tenantMenus?.length > 1 ? tenantMenus : [],
      })
      .addDivider();

    return this.dropdownMenuService
      .addCustomItem({
        iconUrl: 'assets/images/app-bar/profile-and-settings.svg',
        text: this.translationService.getTranslationFileData('dropdown-menu.profile-and-settings'),
        visible: true,
        action: () => {
          this.navigateToUserPage();
        },
      })
      .addCustomItem({
        iconUrl: 'assets/images/question.svg',
        text: this.translationService.getTranslationFileData('dropdown-menu.help-and-support'),
        visible: true,
        action: () => {
          this.openSupport();
        },
      })
      .addCustomItem({
        iconUrl: 'assets/images/app-bar/sign-out-door.svg',
        text: this.translationService.getTranslationFileData('dropdown-menu.sign-out'),
        visible: true,
        action: () => {
          this.signOutAction();
        },
      })
      .getItems();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpened = !this.isUserDropdownOpened;
    if (this.isUserDropdownOpened) {
      this.dropdownItems = this.getDropdownItems(null);
    }
  }
}
