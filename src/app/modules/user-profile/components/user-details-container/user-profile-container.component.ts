import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { doesFontExist } from '../../../../resources/functions/fonts/does-font-exist';
import { TenantMini } from '../../../../resources/models/tenant/tenant';
import { UserFull } from '../../../../resources/models/user';
import { SessionStorageService } from '../../../../services/storage/services/session-storage.service';
import { UserStateService } from '../../../../state/user/user-state.service';
import { Tab } from 'src/app/components/horizontal-tabs/horizontal-tabs.component';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'ep-user-profile-container',
  templateUrl: './user-profile-container.component.html',
  styleUrls: ['./user-profile-container.component.scss']
})
export class UserProfileContainerComponent implements OnInit {
  tabs: Tab[] = [
  {
    key: "accountInfo",
    label: this.translateService.getTranslationFileData('user-profile.account-info-tab')
  }
  ];

  activeTabKey: string = "accountInfo";
  areUserToolsInstalled: boolean = false;
  headerStyles = {
    "margin-bottom":"82px"
  };

  currentUser$: Observable<UserFull> = this.userState.currentUser;
  currentTenantDetails: TenantMini;
  
  constructor(private userState: UserStateService,
              private sessionStorage: SessionStorageService,
              private translateService: TranslationService) { }

  ngOnInit() {
    if (this.sessionStorage.getItem("tenantDetails")) {
      this.currentTenantDetails = this.sessionStorage.getItem("tenantDetails");
    }

    //Determines if autodesk command section is rendered
    this.areUserToolsInstalled = doesFontExist("Xenotron Broadstroke")
  }    
}

