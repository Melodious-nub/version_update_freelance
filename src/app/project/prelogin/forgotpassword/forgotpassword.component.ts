import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { SignupService } from '../signup.service';

@Component({
  selector: 'app-signup-otp',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  private genericResponse: GenricResponse;
  public forgotGroup: UntypedFormGroup;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private signupService: SignupService,
    private toastr: ToastrService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    var email = this.route.snapshot.queryParams.email;
    if (email) {
      this.forgotGroup.get('email').patchValue(email);
    }
  }

  initForm(): void {
    this.forgotGroup = this.fb.group({
      email: [null, Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotGroup.controls;
  }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

  sendResetPasswordLinktoEmail() {
    if (!this.forgotGroup.valid) {
      return;
    }

    this.signupService
      .sendResetPasswordLinktoEmailToEmail(
        this.forgotGroup.controls.email.value
      )
      .subscribe(
        (data) => {
          this.genericResponse = data;
          if (this.genericResponse.status === 'SUCCESS') {
            this.router.navigateByUrl('/signin');
            this.toastr.success('Reset password link set to register email.');
          } else {
            this.toastr.error(this.genericResponse?.errorMessage);
          }
        },
        (error) => {
          this.toastr.error('Something went wrong, please contact DADYIN.');
        }
      );
  }
}
