import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { errorHandler } from '../../../../resources/functions/errors/error-handler';
import { WithIsLoaded } from '../../../../resources/mixins/is-loaded.mixin';
import { TenantMini } from '../../../../resources/models/tenant/tenant';
import { UserFull } from '../../../../resources/models/user';
import { APIV2AccessKey } from '../../../../services/apiService/classFiles/class.authorization';
import { SessionStorageService } from '../../../../services/storage/services/session-storage.service';
import { TenantService } from '../../../../services/tenant/tenant.service';
import { TranslationService } from '../../../../services/translation.service';
import { UserStateService } from '../../../../state/user/user-state.service';

@Component({
  selector: 'ep-user-profile-container',
  templateUrl: './user-profile-container.component.html',
  styleUrls: ['./user-profile-container.component.scss']
})
export class UserProfileContainerComponent implements OnInit {

  currentUser$: Observable<UserFull> = this.userState.currentUser;
  currentTenantDetails: TenantMini;

  constructor(private userState: UserStateService,
              private sessionStorage: SessionStorageService) {
  }

  ngOnInit() {
    if (this.sessionStorage.getItem("tenantDetails")) {
      this.currentTenantDetails = this.sessionStorage.getItem("tenantDetails");
    }
  }
}

