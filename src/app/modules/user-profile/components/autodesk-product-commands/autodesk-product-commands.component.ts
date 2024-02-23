import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { doesFontExist } from '../../../../resources/functions/fonts/does-font-exist';
import { OrganizationInfo } from '../../../../resources/models/organization/organization';
import { TenantMini } from '../../../../resources/models/tenant/tenant';
import { OrganizationService } from '../../../../services/organization/organization.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'ep-autodesk-product-commands',
  templateUrl: './autodesk-product-commands.component.html',
  styleUrls: ['./autodesk-product-commands.component.scss']
})
export class AutodeskProductCommandsComponent implements OnInit {

  @Input() currentUserId: string;
  @Input() currentTenantDetails: TenantMini;

  orgInfo: OrganizationInfo;

  constructor(private toastr: ToastrService,
    private translate: TranslationService,
    private orgService: OrganizationService) { }

  ngOnInit() {
    //Ensure only one toast is open at a time
    this.toastr.toastrConfig.maxOpened = 1;
    this.toastr.toastrConfig.autoDismiss = true;


    this.orgService.getOrganizationDetails(this.currentTenantDetails.organizationId).pipe(
      take(1)).subscribe(res => this.orgInfo = res)
  }


  onAutodeskSearchEnabledChange(isEnabled: boolean) {
    let commandUrl;
    let toastrSuccessText = "user-profile.autodesk-commands-activated";

    if (isEnabled) {
      commandUrl = `pinnaclecommand://ADESKSEARCHINITIALIZE?userid=${this.currentUserId}&tenantid=${this.currentTenantDetails.tenantId}`;

      //If user is on updated version of user tools, it knows how to get partner id. Previous versions do not.
      if (doesFontExist("Xephyr")) {;
        commandUrl += `&partnerid=${this.orgInfo.partnerId}`;
      }

    } else {
      toastrSuccessText = "user-profile.autodesk-commands-deactivated";
      commandUrl = `pinnaclecommand://ADESKSEARCHDESTROY?userid=${this.currentUserId}&tenantid=${this.currentTenantDetails.tenantId}`;
    }

    this.toastr.success(this.translate.getTranslationFileData(toastrSuccessText));
    window.location.href = commandUrl;
  }
}


