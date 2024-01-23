import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ChangePasswordComponent } from '../../../../components/dialog/change-password/change-password.component';
import { DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { SectionHeaderComponent } from '../../../../components/section-header/section-header.component';
import { PasswordSettings } from '../../../../resources/models/organization/organization';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { OrganizationService } from '../../../../services/organization/organization.service';
import { TranslationService } from '../../../../services/translation.service';
 
@Component({
  selector: 'ep-update-password-section',
  templateUrl: './update-password-section.component.html',
  styleUrls: ['./update-password-section.component.scss']
})
export class UpdatePasswordSectionComponent implements OnInit, OnDestroy {
  readonly passwordSectionTitle = this.translationService.getTranslationFileData("app-login-component.password-label");
  private unsubscribe$ = new Subject<void>();
  private passwordSettings: PasswordSettings;
  constructor(private translationService: TranslationService,
              private dialogService: DialogService,
              private organizationService: OrganizationService  ) { }

  ngOnInit() {
    this.organizationService.getPasswordSettings().subscribe(res => {
      this.passwordSettings = res.passwordSettings;
    })
  }

  openChangePasswordDialog(): void {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '500px',
        height: 'auto',
      },
      title: this.translationService.getTranslationFileData('user-profile.change-password'),
      buttonType: 'green',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.save')
    }

    this.dialogService.open(ChangePasswordComponent, {
      data: {
        config: dialogConfig,
        passwordSettings: this.passwordSettings
      }
    }).afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
