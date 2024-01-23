import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../../modules/shared/shared.module';
import { isImgSizeValid, isImgTypeValid } from '../../../resources/functions/files/files';
import { Apiv2Service } from '../../../services/apiService/apiv2.service';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';
import { TranslationService } from '../../../services/translation.service';
import { UserService } from '../../../services/user.service';
import { UserProfileImageComponent } from '../../user-profile-image/user-profile-image.component';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';
export interface UserImgAndDisplayName {
  displayName: string;
  currentImage: string;
}

@Component({
  selector: 'ep-edit-profile-pic',
  templateUrl: './edit-profile-pic.component.html',
  styleUrls: ['./edit-profile-pic.component.scss'],
  standalone: true,
  imports: [
    DialogBaseComponent,
    SharedModule,
    UserProfileImageComponent
    ]
})
export class EditProfilePicComponent extends DialogBaseComponent implements OnDestroy{
  private unsubscribe$ = new Subject<void>();
  private readonly fileSizeErrorPrefix: string = this.translate.getTranslationFileData("user-profile.upload-file-size-error");
  private readonly fileSizeErrorSuffix: string = this.translate.getTranslationFileData("user-profile.kilobytes");
  private readonly invalidFileType: string = this.translate.getTranslationFileData("user-profile.invalid-file-type");
  private readonly maxFileSizeInKBs: number = 500;
  constructor(private userService: UserService,
    private apiV2Service: Apiv2Service,
    private translate: TranslationService,
    private toastr: ToastrService,
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig, userDetails: UserImgAndDisplayName } & any) {
    super(dialogRef, data);
  }

  onUploadNewImage(event): void {
    const file: File = event.target.files[0];

    //file type must be .jpg, .png, or .gif
    if (!isImgTypeValid(file, 'jpg', 'png', 'gif', 'jpeg')) {
      this.toastr.error(this.invalidFileType);
      return;
    }

    //file must be less than or equal to 500KB
    if (!isImgSizeValid(file, this.maxFileSizeInKBs)) {
      this.toastr.error(`${this.fileSizeErrorPrefix}
                         ${this.maxFileSizeInKBs}
                         ${this.fileSizeErrorSuffix}`);
      return;
    }
    //Currently not working. File isn't getting passed to the backend
    this.apiV2Service.uploadFiles(event.target.files)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
      this.data.userDetails.currentImage = res[0].temporaryUrl;
    })
  }

  updateProfileImage(): void {
    this.userService.updateUserProfileImage(this.data.userDetails.currentImage)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
      next: () => {
        this.toastr.success(this.translate.getTranslationFileData('user-profile.img-upload-success'));
        this.close();
      },
      error: () => this.toastr.error(this.translate.getTranslationFileData('user-profile.img-upload-failure'))
      })
  }

  removeImage(): void {
    this.data.userDetails.currentImage = "";
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  
}
