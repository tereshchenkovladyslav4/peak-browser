import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';
import { TranslationService } from '../../../services/translation.service';
import { UserService } from '../../../services/user.service';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';

@Component({
  selector: 'ep-edit-username',
  templateUrl: './edit-username.component.html',
  styleUrls: ['./edit-username.component.scss'],
  standalone: true,
  imports: [
    DialogBaseComponent,
    SharedModule,
    FormsModule
    ]
})
export class EditUsernameComponent extends DialogBaseComponent implements OnInit, OnDestroy{
  private unsubscribe$ = new Subject<void>();
  updatedDisplayName: string;
  isValidDisplayName: boolean = false;
  constructor(private toastr: ToastrService,
    private translate: TranslationService,
    private userService: UserService,
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig, currentDisplayName: string } & any) {
    super(dialogRef, data);
  }

  ngOnInit() {    
    this.updatedDisplayName = this.data.currentDisplayName;
  }

  updateDisplayName(): void {
    this.userService.updateUserDisplayName(this.updatedDisplayName).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this.toastr.success(this.translate.getTranslationFileData('user-profile.display-name-updated'));
        this.close(this.updatedDisplayName);
      },
      error: () => {
        this.toastr.error(this.translate.getTranslationFileData('user-profile.failed-display-name-update'))
      }
    })
  }

  checkDisplayNameValidity(displayName: string): void {
    this.updatedDisplayName = displayName.trim();

    this.isValidDisplayName = this.updatedDisplayName.length > 0 &&
      this.updatedDisplayName !== this.data.currentDisplayName.trim();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
