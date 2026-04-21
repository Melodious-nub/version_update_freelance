import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { ToastrService } from 'ngx-toastr';
import { SignupService } from '../../signup.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-signup-otp',
  templateUrl: './signup-otp.component.html',
  styleUrls: ['./signup-otp.component.scss'],
})
export class SignupOTPComponent implements OnInit {

  private user: any;
  public userEmail: any;
  public otp: string;
  private genericResponse: GenricResponse;
  public forgotGroup: UntypedFormGroup;
  

  constructor(private router: Router, private businessAccountService: BusinessAccountService, private signupService: SignupService, private toastr: ToastrService, private fb: UntypedFormBuilder) {
    if (this.router.getCurrentNavigation().extras.state == null) {
      this.navigate("/signup");
    }
    
  }

  ngOnInit(): void {
    this.initForm();
    this.user = history.state.signupData;
    this.userEmail = this.user.email;
  }

  initForm(): void {
    this.forgotGroup = this.fb.group({
      otp: [null, Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.forgotGroup.controls; }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

  sendOTPtoEmail() {
    this.signupService.sendOtpToEmail(this.user).subscribe(
      data => {
        this.genericResponse = data;
        if (this.genericResponse.status == 'SUCCESS') {
          this.toastr.success("OTP sent to your registered Email.");
        }
      },
      error => {
        this.toastr.error("Something went wrong, please contact DADYIN.");
        ;
      });
  }

  validateOTP() {
    if (!this.forgotGroup.valid) {
      return;
    }
    this.user.otp = this.forgotGroup.get('otp').value;
    let encryptedUser = { ...this.user };
    encryptedUser.password = this.signupService.encryptPassword(this.user.password);
    this.signupService.validateOtp(encryptedUser).subscribe(
      data => {
        this.genericResponse = data;
        if (this.genericResponse.status === 'SUCCESS') {
          this.toastr.success("OTP Verified successfully.");
          this.router.navigateByUrl("/subscription", { state: this.user });
        } else {
          this.toastr.error("OTP Verification failed.");
        }
      },
      error => {
        this.toastr.error("Something went wrong, please contact DADYIN.");
        ;
      });
  }
}
