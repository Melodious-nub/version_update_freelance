import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { ToastrService } from 'ngx-toastr';
import { SignupService } from '../../signup.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { AuthService } from 'src/app/service/auth.service';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinInputComponent } from '../../../../shared/widgets/dadyin-input/dadyin-input.component';

@Component({
    selector: 'app-signup-otp',
    templateUrl: './signup-otp.component.html',
    styleUrls: ['./signup-otp.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinButtonComponent,
    ]
})
export class SignupOTPComponent implements OnInit {
  private router = inject(Router);
  private businessAccountService = inject(BusinessAccountService);
  private signupService = inject(SignupService);
  private toastr = inject(ToastrService);
  private fb = inject(UntypedFormBuilder);


  private user: any;
  public userEmail: any;
  public otp: string;
  private genericResponse: GenricResponse;
  public forgotGroup: UntypedFormGroup;
  

  constructor() {
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
