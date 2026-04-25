import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { SignupUser } from 'src/app/model/signup/SignupUser';
import { ToastrService } from 'ngx-toastr';
import { SignupService } from '../signup.service';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatError } from '@angular/material/form-field';

import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';

@Component({
    selector: 'app-reset-password',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['./resetpassword.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        MatError,
        DadyinButtonComponent
    ]
})
export class ResetPasswordComponent implements OnInit {
  public resetPasswordGroup: UntypedFormGroup;
  public submitted = false;
  private resetPasswordDetail: SignupUser;
  private genericResponse: GenricResponse;
  private resetLink;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    private signupService: SignupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.queryParams.subscribe((params) => {
      this.resetLink = params.resetLink;
      this.signupService.validateResetPassword(this.resetLink).subscribe(
        (data) => {
          this.genericResponse = data;
          if (this.genericResponse.status == 'SUCCESS') {
            this.resetPasswordGroup
              .get('email')
              .setValue(this.genericResponse.message);
          } else {
            if (this.genericResponse.errorMessage == 'LINK_EXPIRED') {
              this.toastr.error(
                'Reset Password Link is expired. Please try again.'
              );
              this.router.navigateByUrl('/forgotpassword');
            } else {
              this.toastr.error('Something went wrong, please contact DADYIN.');
            }
          }
        },
        (error) => {
          this.toastr.error('Something went wrong, please contact DADYIN.');
          this.submitted = true;
        }
      );
    });
  }

  initForm(): void {
    this.resetPasswordGroup = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
      confPassword: [null, Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.resetPasswordGroup.controls;
  }

  get passwordMatched() {
    return (
      this.resetPasswordGroup.get('password').value ===
        this.resetPasswordGroup.get('confPassword').value 
    );
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.resetPasswordGroup.invalid || !this.passwordMatched) {
      return;
    }

    this.resetPasswordDetail = this.resetPasswordGroup.value;
    this.signupService.resetPassword(this.resetPasswordDetail).subscribe(
      (data) => {
        this.genericResponse = data;
        if (this.genericResponse.status == 'SUCCESS') {
          this.toastr.success('Account password reset done.');
          this.router.navigateByUrl('/signin');
        } else {
          this.toastr.error('Something went wrong, please contact DADYIN.');
        }
      },
      (error) => {
        this.submitted = true;
        this.toastr.error('Something went wrong, please contact DADYIN.');
      }
    );
  }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
