import { NgForOf, NgIf } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../../modules/shared/shared.module';
import { PasswordSettings } from '../../../resources/models/organization/organization';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';
import { TranslationService } from '../../../services/translation.service';
import { UserService } from '../../../services/user.service';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';

@Component({
  selector: 'ep-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    DialogBaseComponent,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class ChangePasswordComponent extends DialogBaseComponent implements OnInit, OnDestroy{
  private unsubscribe$ = new Subject<void>();
  passwordChangeForm: FormGroup;
  validationStrings: string[];
  validationError: string = "";

  constructor(private toastr: ToastrService,
    private userService: UserService,
    private translate: TranslationService,
    private formBuilder: FormBuilder,
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig, passwordSettings: PasswordSettings} & any) {
    super(dialogRef, data);
  }

  ngOnInit() {
    this.setValidationRequirementText();
    //Dynamically set validators depending on complex password property
    let validators: Validators[] = this.data.passwordSettings.requireComplexPasswords ?
      [Validators.pattern(new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])((?=.*\W)|(?=.*_))^/gm)),
       Validators.minLength(8),
       Validators.required] :
      [Validators.required];

    this.passwordChangeForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', validators],
      confirmNewPassword: ['', validators]
    }, {
      validators: [passwordMatchValidator, trimValidator]
    }) 
  }

  private setValidationRequirementText(): void {
    this.validationStrings = [];

    if (this.data.passwordSettings.requireComplexPasswords) {
      this.validationStrings.push(this.translate.getTranslationFileData("user-profile.min-eight-chars-req"));
      this.validationStrings.push(this.translate.getTranslationFileData("user-profile.uppercase-req"));
      this.validationStrings.push(this.translate.getTranslationFileData("user-profile.lowercase-req"));
      this.validationStrings.push(this.translate.getTranslationFileData("user-profile.non-alpha-req"));

    }

    if (this.data.passwordSettings.requireUniquePassword) {
      this.validationStrings.push(this.translate.getTranslationFileData("user-profile.unique-pass-prefix") +
        this.data.passwordSettings.uniquePasswordCount +
        this.translate.getTranslationFileData("user-profile.unique-pass-suffix"));
    }
  }
  //displays error message based on validation failures.
  submitPasswordChange(): void {
    this.trimFormControls();

    this.validationError = "";
    //validate client-side before backend validation/changing of password
    const controls = this.passwordChangeForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        if (controls[name].hasError('required')) {
          this.validationError = this.translate.getTranslationFileData('user-profile.all-fields-required');
          return;
        }
        if (this.data.passwordSettings.requireComplexPasswords) {
          this.validationError = this.translate.getTranslationFileData('user-profile.complex-password');
          return;
        }
      }
    }
    //Group validator
    if (this.passwordChangeForm.hasError('doesNotMatch')) {
      this.validationError = this.translate.getTranslationFileData('user-profile.passwords-do-not-match');
      return;
    }
    
    this.userService.updateUserPassword(this.passwordChangeForm.get('currentPassword').value,
                                        this.passwordChangeForm.get('newPassword').value,
                                        this.passwordChangeForm.get('confirmNewPassword').value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.getTranslationFileData("user-profile.password-updated"));
          //unsubscribes from dialog component
          this.close(true);
        },

        error: () => {
          this.validationError = this.translate.getTranslationFileData('user-profile.password-update-fail');
        }              
      })
  }

  private trimFormControls(): void {
    Object.keys(this.passwordChangeForm.controls).forEach(key => {
      this.passwordChangeForm.controls[key].setValue(this.passwordChangeForm.controls[key].value.trim());
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value.newPassword === control.value.confirmNewPassword ? null : { doesNotMatch: true }
}

export const trimValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  return Object.keys(formGroup.controls).every(key => formGroup.controls[key].value.trim().length) ? null : { onlyWhitespacesValidator: true }
}
