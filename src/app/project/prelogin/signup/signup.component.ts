import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { AuthService } from 'src/app/service/auth.service';
import { LOCALSTORAGEKEYS } from 'src/app/shared/constant';
import { SignupService } from '../signup.service';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinButtonComponent
    ]
})
export class SignupComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(UntypedFormBuilder);
  private signupService = inject(SignupService);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  public signupGroup: UntypedFormGroup;
  public submitted = false;

  private genericResponse: GenricResponse;

  inviteLink: any = null;
  inviteType: any = null;
  ngOnInit(): void {
    var link = this.route.snapshot.queryParams.inviteLink;
    if (link) {
      localStorage.setItem(LOCALSTORAGEKEYS.INVITELINK, link);
      this.inviteLink = this.route.snapshot.queryParams.inviteLink;
    }
    this.authService.setCurrentUser(null);
    this.initForm();
    if (this.inviteLink && this.inviteLink != 'undefined') {
      this.signupService
        .getUserDetailsFromInvite(this.inviteLink)
        .pipe(first())
        .subscribe((data) => {
          if (data) {
            this.signupGroup
              .get('userDTO')
              .get('inviteLink')
              .setValue(this.inviteLink);
            this.signupGroup.get('userDTO').get('email').setValue(data?.email);
            this.signupGroup
              .get('userDTO')
              .get('firstName')
              .setValue(data?.invitedTo);
            this.inviteType = data?.inviteType;
            if (this.inviteType == 'EMPLOYEE') {
              this.signupGroup
                .get('userDTO')
                .get('name')
                .removeValidators(Validators.required);
              this.signupGroup
                .get('userDTO')
                .get('name')
                .updateValueAndValidity();
            }
          }
        });
    }

  // If we get businessLines in query param then set that in form
    const businessLines = this.route.snapshot.queryParams.businessLines;
    if (businessLines) {
      // If businessLines is a string, convert to array if needed
      let lines = businessLines;
      if (typeof businessLines === 'string') {
        try {
          // Try to parse as JSON array, fallback to comma split
          lines = JSON.parse(businessLines);
          if (!Array.isArray(lines)) {
            lines = businessLines.split(',');
          }
        } catch (e) {
          lines = businessLines.split(',');
        }
      }
      this.signupGroup.get('businessAccount').get('businessLines').setValue(lines);
    }


  }

  get businessLines() {
    return this.signupGroup.get('businessAccount').get('businessLines').value.join(', ');
  }

  initForm(): void {
    this.signupGroup = this.fb.group({
      userDTO: this.fb.group({
        email: [null, Validators.required],
        password: [null, Validators.required],
        confPassword: [null, Validators.required],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        name: [null, Validators.required],
        inviteLink: [null],
      }),
      businessAccount: this.fb.group({
        firstName: [null],
        lastName: [null],
        name: [null],
        primaryContact: this.fb.group({
          id: [null],
          email: [null],
        }),
        currency: ['USD'],
        currency2nd: ['USD'],
        language: ['English'],
        businessLines: [['RETAILER']],
        productCategoryIds: [['56']],
      }),
    });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.signupGroup.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.isPasswordMisMatched) {
      this.toastr.error('Password not matching');
      return;
    }

    this.signupGroup
      .get('businessAccount')
      .get('primaryContact')
      .get('email')
      .patchValue(this.signupGroup.value.userDTO.email);
    this.signupGroup
      .get('businessAccount')
      .get('firstName')
      .patchValue(this.signupGroup.value.userDTO.firstName);
    this.signupGroup
      .get('businessAccount')
      .get('lastName')
      .patchValue(this.signupGroup.value.userDTO.lastName);
    this.signupGroup
      .get('businessAccount')
      .get('name')
      .patchValue(this.signupGroup.value.userDTO.name);
    // stop here if form is invalid
    if (this.signupGroup.invalid) {
      this.signupGroup.markAllAsTouched();
      return;
    }
    // create signup model
    const signupUserData = JSON.parse(
      JSON.stringify(this.signupGroup.get('userDTO').value)
    );
    const formData = JSON.parse(JSON.stringify(this.signupGroup.value));

    delete signupUserData.confPassword;
    delete formData.userDTO.confPassword;

    this.signupService.registerAndGenerateBusinessAccount(formData).subscribe(
      (data: any) => {
        this.genericResponse = data.genericResponse;
        const encryptedPassword = this.signupService.encryptPassword(
          this.signupGroup.get('userDTO').value.password
        );
        sessionStorage.setItem('signupData', JSON.stringify({...data, email: this.signupGroup.get('userDTO').value.email, password: encryptedPassword }));
        if (this.genericResponse.status == 'SUCCESS') {
          this.router.navigateByUrl('/signup/signup-otp', {
            state: {
              signupData: signupUserData,
              businessAccountData: this.signupGroup.value.businessAccount,
            },
          });
        } else {
          if (this.genericResponse.errorMessage == 'USER_EXIST') {
            this.toastr.error('User already exist with email.');
          }
        }
      },
      (error) => {
        this.toastr.error(
          error?.error?.userMessage ??
            'Something went wrong, please contact DADYIN.'
        );
      }
    );
  }

  get isPasswordMisMatched() {
    if (
      this.signupGroup.value.userDTO.password !=
        this.signupGroup.value.userDTO.confPassword &&
      this.submitted
    ) {
      return true;
    } else {
      return false;
    }
  }

  navigateToSignin() {
    if (this.inviteLink) {
      this.router.navigateByUrl('/signin?inviteLink=' + this.inviteLink);
      return;
    }
    this.router.navigateByUrl('/signin');
  }
}
