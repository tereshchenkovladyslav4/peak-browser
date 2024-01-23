import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserProfileImageComponent } from '../user-profile-image/user-profile-image.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionStorageService } from '../../services/storage/services/session-storage.service';
import { TenantMini } from '../../resources/models/tenant/tenant';
import { DropdownMenuContainerComponent } from '../dropdown-menu-container/dropdown-menu-container.component';
import { SharedModule } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { UserStateService } from '../../state/user/user-state.service';
import { TooltipModule } from 'src/app/modules/tooltip/tooltip.module';

@Component({
  selector: 'ep-user-profile-menu',
  templateUrl: './user-profile-menu.component.html',
  styleUrls: ['./user-profile-menu.component.scss'],
  imports: [
    AsyncPipe,
    NgIf,
    UserProfileImageComponent,
    DropdownMenuContainerComponent,
    MenuModule,
    DropdownMenuComponent,
    OverlayPanelModule,
    SharedModule,
    TooltipModule
  ],
  standalone: true,
})
export class UserProfileMenuComponent implements OnInit {
  userImageUrl$: Observable<string>;
  displayName$: Observable<string>;
  currentTenantDetails: TenantMini;

  constructor(
    private userState: UserStateService,
    private sessionStorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.userImageUrl$ = this.userState.currentUser.pipe(map((user) => user.imageUrl));
    this.displayName$ = this.userState.currentUser.pipe(map((user) => user.displayName));
    this.currentTenantDetails = this.sessionStorage.getItem('tenantDetails');
  }

  switchTenant() {}
}
