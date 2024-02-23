import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { concatMap, Subject } from 'rxjs';
import { DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { EditProfilePicComponent, UserImgAndDisplayName } from '../../../../components/dialog/edit-profile-pic/edit-profile-pic.component';
import { EditUsernameComponent } from '../../../../components/dialog/edit-username/edit-username.component';
import { TenantMini } from '../../../../resources/models/tenant/tenant';
import { UserFull } from '../../../../resources/models/user';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { TranslationService } from '../../../../services/translation.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'ep-user-details-header',
  templateUrl: './user-details-header.component.html',
  styleUrls: ['./user-details-header.component.scss'],
})
export class UserDetailsHeaderComponent implements OnDestroy, OnInit {
  private unsubscribe$ = new Subject<void>();

  @Input('currentUser') currentUser: UserFull;
  @Input('currentTenantDetails') currentTenantDetails: TenantMini;
  @Input() headerStyles: {[klass: string]: any};

  constructor(private dialogService: DialogService,
            private translationService: TranslationService,
            private userService: UserService) { }

  ngOnInit() {
  }
  //TODO - for edit profile img
  openEditUserImageDialog(): void {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '440px',
        height: '323px',
      },
      title: this.translationService.getTranslationFileData('user-profile.edit-profile-picture'),
      buttonType: 'green',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.save')
    }

    this.dialogService.open(EditProfilePicComponent, {
      data: {
        config: dialogConfig,
        userDetails: {
          currentImage: this.currentUser.imageUrl,
          displayName: this.currentUser.displayName
        } as UserImgAndDisplayName
      }
    }).afterClosed()
      .pipe(
        concatMap(() => this.userService.refreshLoggedInUser(this.currentUser.userId))
    )
      .subscribe();
  }

  openEditUsernameDialog(): void {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '440px',
        height: '204px',
      },
      title: this.translationService.getTranslationFileData('user-profile.edit-username'),
      buttonType: 'green',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.save')
    }

    this.dialogService.open(EditUsernameComponent, {
      data: {
        config: dialogConfig,
        currentDisplayName: this.currentUser?.displayName
      }
    }).afterClosed()
      .pipe(
        concatMap(() => this.userService.refreshLoggedInUser(this.currentUser.userId))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
