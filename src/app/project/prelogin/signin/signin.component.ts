import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SignupUser } from 'src/app/model/signup/SignupUser';
import { AuthService } from 'src/app/service/auth.service';
import { SignupService } from '../signup.service';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccountService } from '../../postlogin/business-account/business-account.service';
import { MatDialog } from '@angular/material/dialog';
import { LOCALSTORAGEKEYS } from 'src/app/shared/constant';
import { first } from 'rxjs';
import { SwiperComponent } from 'swiper/angular';
import { SwiperOptions } from 'swiper';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinCheckBoxComponent } from '../../../shared/widgets/dadyin-checkbox/dadyin-checkbox.component';
import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';
@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinCheckBoxComponent,
        DadyinButtonComponent,
    ],
})
export class SigninComponent implements OnInit {
  @ViewChild('swiperR', { static: false }) swiperR?: SwiperComponent;
  public signinGroup: UntypedFormGroup;
  public submitted = false;
  private signup: SignupUser;
  public inviteLink: any;
  user: any;
  activeIndex = 0;
  swiperConfig: SwiperOptions = {
    spaceBetween: 15,
    navigation: false,
    loop: true,
    autoplay: true,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
    on: {
      slideChange: () => {
        if (this.swiperR.swiperRef?.activeIndex || this.swiperR.swiperRef?.activeIndex==0) {
          const index = this.swiperR.swiperRef?.activeIndex;
          this.activeIndex = index;
        }
      },
    },
  };
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private signupService: SignupService,
    private authService: AuthService,
    private tstr: ToastrService
  ) {
    this.initForm();

    this.authService.$currentUser.subscribe((res) => {
      this.user = res;
    });
  }
  initForm(): void {
    this.signinGroup = this.fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required],
    });
  }
  ngOnInit(): void {
    var link = this.route.snapshot.queryParams.inviteLink;
    if (link) {
      localStorage.setItem(LOCALSTORAGEKEYS.INVITELINK, link);
      this.inviteLink = this.route.snapshot.queryParams.inviteLink;
    }
    if (this.inviteLink && this.inviteLink != 'undefined') {
      this.signupService
        .getUserDetailsFromInvite(this.inviteLink)
        .pipe(first())
        .subscribe((data) => {
          if (data) {
            this.signinGroup.get('email').setValue(data?.email);
          }
        });
    }
    this.authService.setCurrentUser(null);
    if (history.state.email) {
      this.signinGroup.get('email').setValue(history.state.email);
    }
  }

  goToSlide(index: number) {
    this.swiperR.swiperRef.slideTo(index);
  }

  onSubmit() {
    this.submitted = true;
    if (this.signinGroup.invalid) {
      return;
    }
    const encryptedPassword = this.signupService.encryptPassword(
      this.signinGroup.value.password
    );
    this.signup = {
      email: this.signinGroup.value.email,
      password: encryptedPassword, // Set the encrypted password
      otp: '',
      inviteLink: '',
      businessAccountId: '',
    };
    this.signup.inviteLink = this.inviteLink;
    this.signupService.signin(this.signup).subscribe(
      (data) => {
        if (data.accessToken) {
          this.authService.setUserDetail(
            data.user,
            data.accessToken,
            data.user.roles,
            data.businessAccount
          );
          {
            this.router.navigateByUrl('/home');
          }
        } else if (data.user.verificationStatus === 'EMAIL_SENT') {
          // otp verification not done yet
          this.router.navigateByUrl('/signup/signup-otp', {
            state: {
              signupData: this.signup,
              businessAccountData: history.state.businessAccountData,
            },
          });
        }
        // return
      },
      (error) => {
        this.tstr.error(error?.error?.error ?? 'Something went wrong');
      }
    );
  }

  navigateToForgotPassword() {
    if (this.signinGroup.value.email) {
      this.router.navigateByUrl(
        '/forgotpassword?email=' + this.signinGroup.value.email
      );
    } else {
      this.router.navigateByUrl('/forgotpassword');
    }
  }

  navigateToSignup() {
     this.router.navigateByUrl('/signup');
  }
}
