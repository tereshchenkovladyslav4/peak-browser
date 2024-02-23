import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProdGenApi } from '../../services/apiService/prodgen.api';
import { combineLatest, mergeMap, Observable, of, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { AuthenticationStateService, GUID_EMPTY } from '../../state/authentication/authentication-state.service';
import { DEFAULT_NAV_ITEMS, getManagementNavItems } from './navigation-items';
import { UserService } from '../../services/user.service';
import { NavigationMenuItem } from '../../resources/models/navigation-menu-item';
import { UserFull } from '../../resources/models/user';
import { NavigationImageType } from '../../resources/enums/navigation-image-type.enum';
import { NavigationEnd, Router } from '@angular/router';
import { NAVIGATION_ROUTES } from 'src/app/resources/constants/app-routes';
import { TranslationService } from 'src/app/services/translation.service';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { UserStateService } from '../../state/user/user-state.service';
import { AclService } from '../../services/acl/acl.service';
import { Select } from '@ngxs/store';
import { ThemeState } from 'src/app/state/themes/themes.state';

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NavigationMenuComponent implements OnInit {
  @Output() navigateMenuEvent = new EventEmitter<NavigationMenuItem>();

  @Select(ThemeState.menuLogoUrl) menuLogoUrl$: Observable<string>;
  @Select(ThemeState.menuLogoImage) menuLogoImage$: Observable<string>;
  @Select(ThemeState.menuLogoImageCollapsed) menuLogoImageCollapsed$: Observable<string>;

  // obs
  isFullScreen$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  navItems: NavigationMenuItem[] = [];
  navigationImageType = NavigationImageType;
  logoLarge: string = 'assets/images/nav-menu/peak-logo-lg.svg';
  logoSmall: string = 'assets/images/nav-menu/peak-logo-sm.svg';
  logoUrl: string = '';
  logoUrlTarget: string = '_blank';
  displayLogo: boolean = false;
  navItemsMaster: NavigationMenuItem[] = [];
  filterText: string;
  hasManagementItems: boolean = true;
  canViewManagementItems: boolean = true;
  isManagementExpanded = true;
  isMenuCollapsed: boolean = false;
  managementTranslation: string = '';
  userPeakSidebarCollapsed: boolean = false;
  responsiveMode: boolean = false;
  responsiveMode$: Observable<boolean>;

  constructor(
    private prodGenApiService: ProdGenApi,
    private authState: AuthenticationStateService,
    private userState: UserStateService,
    private userService: UserService,
    private router: Router,
    private translationService: TranslationService,
    private layoutState: LayoutStateService,
    private responsive: BreakpointObserver,
    private aclService: AclService
  ) {}

  initUrl: string;

  ngOnInit() {
    window.scroll(0, 0);

    this.setInitUrl();
    this.loadLogo();
    this.setManagementTranslation();
    this.setMenuCollapsed();
    this.manageLayout();
    this.setResponsiveMode();
  }

  private setInitUrl() {
    if (!this.initUrl) {
      this.getUrl().subscribe((url) => {
        this.initUrl = url;
        this.setDefaultActivatedItem();
      });
    }
  }

  getIconColor(imageName: HTMLElement): string {
    let matches = document.getElementsByClassName('active');

    for (let index = 0; index < matches.length; index++) {
      if (matches.item(index).contains(imageName)) {
        return 'var(--primary-color)';
      }
    }
    return 'var(--high-contrast-navigation-color)';
  }

  getSubitemLineIconColor(isActive: boolean): string {
    return isActive ? 'var(--primary-color)' : 'var(--high-contrast-navigation-color)';
  }

  onFilterTextChanged(event) {
    this.updateMenuItems();
  }

  clearFilterText() {
    this.filterText = '';
    this.updateMenuItems();
  }

  loadLogo() {
    combineLatest([this.authState.getCurrentUserId(), this.authState.getCurrentTenantId(), this.userState.currentUser])
      .pipe(
        tap(([userId, tenantId, user]: [string, string, UserFull]) => this.loadMenu(userId, tenantId, user)),
        mergeMap(([userId, tenantId, ...rest]: [string, string, UserFull]) => {
          return this.isUserAndTenantLoaded(userId, tenantId)
            ? this.prodGenApiService.GetCurrentTenantSettings()
            : of(null);
        })
      )
      .subscribe();

    combineLatest([this.menuLogoUrl$, this.menuLogoImage$, this.menuLogoImageCollapsed$])
      .pipe(
        tap(([menuLogoUrl, menuLogoImage, menuLogoImageCollapsed]: [string, string, string]) => {
          this.displayLogo = true;
          if (menuLogoUrl && menuLogoUrl.toString().trim() != '') {
            this.logoUrl = menuLogoUrl;
          }
          if (menuLogoImage && menuLogoImage.toString().trim() != '') {
            this.logoLarge = menuLogoImage;
          }
          if (menuLogoImageCollapsed && menuLogoImageCollapsed.toString().trim() != '') {
            this.logoSmall = menuLogoImageCollapsed;
          }
          if (menuLogoUrl && menuLogoUrl.includes(window.location.hostname) == true) {
            this.logoUrlTarget = '_self';
          } else {
            this.logoUrlTarget = '_blank';
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private setManagementTranslation() {
    this.managementTranslation = this.translationService.getTranslationFileData('navigation-menu.management');
  }

  private setMenuCollapsed() {
    combineLatest([
      this.userService.getUserSettings(this.authState.state$.getValue().currentUserId),
      this.isResponsiveModeOn(),
    ])
      .pipe(
        tap(([res, isResponsiveModeOn]) => {
          this.userPeakSidebarCollapsed = res?.userSettings?.peakSidebarCollapsed === 'True' ?? false;
          this.isMenuCollapsed = this.userPeakSidebarCollapsed || isResponsiveModeOn;
        }),
        take(1)
      )
      .subscribe();
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private setResponsiveMode() {
    this.responsiveMode$ = this.isResponsiveModeOn().pipe(
      tap((isResponsiveModeOn) => {
        this.responsiveMode = isResponsiveModeOn;

        if (isResponsiveModeOn) {
          this.closeMenu();
        } else {
          this.isMenuCollapsed = this.userPeakSidebarCollapsed;
        }
      })
    );
  }

  private isResponsiveModeOn(): Observable<boolean> {
    const key = '(max-width: 1400px)';
    return this.responsive.observe([key]).pipe(map((breakpointState) => !!breakpointState?.breakpoints[key]));
  }

  updateMenuItems() {
    if (this.filterText == null || this.filterText.length == 0) {
      this.navItems = this.navItemsMaster;
    } else {
      this.navItems = [];
      let items = JSON.parse(JSON.stringify(this.navItemsMaster));

      // first go through any items that have children and filter the submenus
      items.forEach((item) => {
        // see if any children match
        let filteredChildren =
          item.children?.filter((f) => f.title.toLowerCase().indexOf(this.filterText.toLowerCase()) !== -1) || [];

        // found at least 1 matching child, we must keep the parent also
        let keep = !!filteredChildren.length;

        if (!keep) {
          keep = item.title.toLowerCase().indexOf(this.filterText.toLowerCase()) !== -1;
        }

        if (keep) {
          item.isExpanded = true;
          item.children = filteredChildren;
          this.navItems.push(item);
        }
      });
    }

    this.hasManagementItems = !!this.navItems.filter((r) => r.isManagement).length;
  }

  loadMenu(userId: string, tenantId: string, user: UserFull) {
    this.navItemsMaster = (
      this.isUserAndTenantLoaded(userId, tenantId) ? [...DEFAULT_NAV_ITEMS, ...getManagementNavItems(false)] : []
    ).filter((item) => this.aclService.checkRoles(item.roles) && this.aclService.checkPermission(item.permission));

    if (!this.navItemsMaster.filter((r) => r.isManagement).length) {
      this.canViewManagementItems = false;
      this.hasManagementItems = false;
    } else {
      this.canViewManagementItems = true;
    }

    this.navItems = [...this.navItemsMaster].map((item) => ({
      ...item,
      children: item?.children?.map((subitem) => {
        let abr = '';
        const itemTitleSplit = subitem.title.split(' ');
        if (itemTitleSplit?.length) {
          abr = itemTitleSplit[0].charAt(0);
          if (itemTitleSplit.length > 1) {
            abr += itemTitleSplit[1].charAt(0);
          }
        }
        return {
          ...subitem,
          abbreviation: abr,
        };
      }),
      isExpanded: false,
      isActive: false,
    }));

    this.setDefaultActivatedItem();
  }

  private setDefaultActivatedItem() {
    if (!this.initUrl) {
      this.initUrl = NAVIGATION_ROUTES.home;
    }

    this.navItems = this.updateNavItems(this.navItems, (item: NavigationMenuItem) =>
      this.initUrl?.startsWith(item.navValue)
    );
  }

  // TODO - may want to tidy up or refactor active + expand of nav items as recursive way may be too expensive in the long run
  private updateNavItems(navItems: NavigationMenuItem[], searchFunction): NavigationMenuItem[] {
    return navItems.map((item) => {
      if (!item?.children?.length) {
        if (searchFunction(item)) {
          item.isActive = true;
          item.isExpanded = true;
        } else {
          item.isActive = false;
          item.isExpanded = false;
        }
      } else {
        item.children = this.updateNavItems(item?.children, searchFunction);
        item.isActive = item.isActive || item.children.some((child) => child.isActive);
        item.isExpanded = item.isExpanded || item.children.some((child) => child.isExpanded);
      }

      return item;
    });
  }

  private getUrl(): Observable<string> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    );
  }

  onItemClick(item: NavigationMenuItem) {
    this.setItem(item);

    if (this.responsiveMode && !item.children?.length) {
      this.closeMenu();
    }
  }

  setItem(item: NavigationMenuItem) {
    // order of operations for this function is important due to activating/deactivating system in place
    item.isExpanded = (!!item.children?.length && !item.isExpanded) || false;

    if (item.children?.length) return;

    this.navItems.forEach((navItem) => {
      navItem.isActive = false;
      if (navItem.children?.length) {
        navItem.children?.forEach((subItem) => (subItem.isActive = false));
      }
      // only close previously expanded nav items if the newly selected navItem has no children
      if (!item.children) {
        navItem.isExpanded = false;
      }
    });
    item.isActive = true;
  }

  isChildActive(item: NavigationMenuItem): boolean {
    return item.children?.some((subItem) => subItem.isActive);
  }

  onSubitemClick(parentItem: NavigationMenuItem, subItem: NavigationMenuItem) {
    this.navItems.forEach((navItem) => {
      navItem.isActive = false; // deactivate any non-children menu options
      if (navItem.children?.length) {
        navItem.children?.forEach((subItem) => (subItem.isActive = false));
      }
      if (navItem !== parentItem) {
        navItem.isExpanded = false;
      }
    });

    subItem.isActive = true;

    if (this.responsiveMode) {
      this.closeMenu();
    }
  }

  onManagementClick() {
    this.isManagementExpanded = !this.isManagementExpanded;
  }

  onNavEvent(item: NavigationMenuItem) {
    // todo remove this if not used in future
  }

  private isUserAndTenantLoaded(userId: string, tenantId: string): boolean {
    return !(tenantId === GUID_EMPTY || userId === GUID_EMPTY);
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;

    // only update user's peak sidebar collapsed setting when not in responsive mode
    if (!this.responsiveMode) {
      this.userPeakSidebarCollapsed = this.isMenuCollapsed;
    }

    // update user setting when NOT in responsive mode
    if (!this.responsiveMode) {
      this.userService
        .modifyUserSettings(this.authState.state$.getValue().currentUserId, {
          peakSidebarCollapsedNewValue: this.isMenuCollapsed,
        })
        .pipe(take(1))
        .subscribe();
    }
  }

  closeMenu() {
    this.isMenuCollapsed = true;
  }

  trySetNavMenuItem(navValue) {
    const navItem = this.tryGetNavMenuItemByNavValue(navValue);
    if (navItem) {
      this.setItem(navItem);
    }
  }

  tryGetNavMenuItemByNavValue(navValue) {
    return this.navItems.find((item) => item.navValue == navValue);
  }
}
