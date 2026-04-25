import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SignupService } from 'src/app/project/prelogin/signup.service';
import { HttpService } from 'src/app/service/http.service';
import { userApiModules } from '../../constant';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';


@Component({
    selector: 'app-change-password-dialog',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, DadyinButtonComponent, MatIcon, NgClass, ExtendedModule]
})
export class ChangePasswordDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ChangePasswordDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private fb = inject(UntypedFormBuilder);
  private httpService = inject(HttpService);
  private signupService = inject(SignupService);
  private toastr = inject(ToastrService);

  changePasswordForm: UntypedFormGroup;
  isSubmitting = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: [null, Validators.required],
      newPassword: [null, Validators.required],
      confirmPassword: [null, Validators.required],
    });
  }

  get passwordMismatch(): boolean {
    const newPassword = this.changePasswordForm?.get('newPassword')?.value;
    const confirmPassword = this.changePasswordForm?.get('confirmPassword')?.value;
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  close() {
    this.dialogRef.close();
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    if (this.passwordMismatch) {
      this.toastr.error('New password and confirm password do not match.');
      return;
    }

    const payload = {
      oldPassword: this.signupService.encryptPassword(this.f['oldPassword'].value),
      newPassword: this.signupService.encryptPassword(this.f['newPassword'].value),
    };

    this.isSubmitting = true;
    this.httpService.post(userApiModules.change_password, payload).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? 'Unable to change password.');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}