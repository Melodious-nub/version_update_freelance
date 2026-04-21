import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../subscription.service';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessRegistrationFormsService } from 'src/app/project/postlogin/business-account/services/business-registration-forms.service';
import { AuthService } from 'src/app/service/auth.service';
import { SignupService } from '../../signup.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {
  countries = [];
  currencyList: any = [];
  businessTypes: any[] = [];
  public businessRegistrationForm: any;
  signupData;
  userInfo;

  constructor(private subscriptionService: SubscriptionService, public _fb: UntypedFormBuilder, private router: Router, private businessFormService: BusinessRegistrationFormsService, public ref: ChangeDetectorRef, private authService: AuthService, private signupService: SignupService, private businessAccountService: BusinessAccountService) { }

  ngOnInit(): void {
    this.businessRegistrationForm = this.businessFormService.createBusinessForm();
    this.loadCountry();
    this.loadBusinessTypeAndcategories();
    const userData = sessionStorage.getItem('signupData');
    if (userData) {
      this.userInfo = JSON.parse(userData);
      this.signupData = this.userInfo?.businessAccount;
      this.businessRegistrationForm.patchValue({
        name: this.signupData?.name || '',
        firstName: this.signupData?.firstName || '',
        lastName: this.signupData?.lastName || '',
        language: this.signupData?.language || '',
        currency: this.signupData?.currency || '',
        currency2nd: this.signupData?.currency2nd || '',
        domain: this.signupData?.domain || '',
        gst: this.signupData?.gst || '',
        type: this.signupData?.type || [],
        primaryContact: {
          email: this.signupData?.primaryContact?.email || '',
          phone: this.signupData?.primaryContact?.phone || '',
          fax: this.signupData?.primaryContact?.fax || '',
          landline: this.signupData?.primaryContact?.landline || '',
        },
        productCategoryIds: this.signupData?.productCategoryIds || [],
        businessLines: this.signupData?.businessLines || [],
        verifiedStatus: this.signupData?.verifiedStatus || 'NONE',
      })
      this.businessRegistrationForm.get('primaryContact').get('phone').get('countryId').setValue(233);
      console.log(this.businessRegistrationForm.value);
    }
  }

  loadCountry() {
    this.subscriptionService.getCountry().subscribe((data) => {
      this.countries = data;
      if (this.countries != null) {
        this.countries.forEach((c) => {
          this.currencyList.push({
            value: c.currency,
            label: c.currency,
            id: c.id
          });
        });
      }
    });
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  loadBusinessTypeAndcategories() {
    this.subscriptionService.getBusinessTypes().subscribe((res) => {
      this.businessTypes = res;
      this.businessTypes = this.businessTypes.map((item) => ({
        id: item,
        description: item,
      }));
    });
  }

  updateBusiness(type) {
    if (this.businessRegistrationForm.invalid) {
      this.businessRegistrationForm.markAllAsTouched();
      return;
    }
    const subscriptionDetails = sessionStorage.getItem('selectedSubscription') ? JSON.parse(sessionStorage.getItem('selectedSubscription')) : null;
    const isSubscriptionPaid = sessionStorage.getItem('isSubscriptionPaid') ? JSON.parse(sessionStorage.getItem('isSubscriptionPaid')) : false;
    const promoCode = sessionStorage.getItem('promoCode');
    sessionStorage.removeItem('isSubscriptionPaid');
    const businessSubscriptionUsageDetails = {
      allowedTeamSize: -1,
      quickCheckoutFees: 0,
      allowedTransactionsByMonth: 0,
      containerManagementByYear: 0,
      salesUser: -1,
      allowCRM: -1,
      productSupport: subscriptionDetails?.productSupport,
      allowedNoOfBranches: 0,
      subscriptionStart: new Date().toISOString().split('.')[0],
      subscriptionEnd: this.endDate(subscriptionDetails?.subscriptionType),
      subscriptionType: subscriptionDetails?.subscriptionType,
      isSubscriptionPaid: isSubscriptionPaid,
      businessSubscriptionId: subscriptionDetails?.businessSubscriptionId,
      promoCodeUsed: promoCode
    };
    const payload = {
      ...this.businessRegistrationForm.value,
      businessSubscriptionUsageDetails,
      id: this.signupData?.id
    }
    console.log(payload);
    this.subscriptionService.updateBusiness(payload).subscribe(res => {
      const signinPayload = {
        email: this.userInfo?.email,
        password: this.userInfo?.password, // Set the encrypted password
        otp: '',
        inviteLink: '',
        businessAccountId: '',
      }
      const getAccessToken = localStorage.getItem('access-token');
      if (getAccessToken) {
        this.businessAccountService.getBusinessAccount();
        this.navigateByUrl(type);
      } else {
        this.signupService.signin(signinPayload).subscribe(data => {
          if (data.accessToken) {
            this.authService.setUserDetail(
              data.user,
              data.accessToken,
              data.user.roles,
              data.businessAccount
            );
            {
              this.navigateByUrl(type);
            }
          }
        })
      }
    })
  }

  navigateByUrl(type) {
    if (type === 'business') {
      sessionStorage.setItem('subscriptionPageUrl', JSON.stringify('/home/business-registration'))
      this.router.navigateByUrl('/home/business-registration')
    } else {
      sessionStorage.setItem('subscriptionPageUrl', JSON.stringify('/home'))
      this.router.navigateByUrl('/home')
    }
  }

  endDate(type) {
    const today = new Date();
    const nextEndDate = new Date(today);
    if (type === 'MONTHLY') {
      nextEndDate.setMonth(today.getMonth() + 1);
    } else {
      nextEndDate.setFullYear(today.getFullYear() + 1);
    }
    // Format as YYYY-MM-DDTHH:mm:ss
    const formatted = nextEndDate.toISOString().split('.')[0];
    return formatted;
  }

  onAddressSelection(event: any, control) {
    let address: any = {
      addressLine: '',
      addressCountry: '',
      addressState: '',
      addressCity: '',
      addressZipCode: '',
    };

    address.addressLine = event.formatted_address;
    event.address_components.forEach((element) => {
      if (element.types.includes('country')) {
        address.addressCountry = element.long_name;
      }
      if (element.types.includes('administrative_area_level_1')) {
        address.addressState = element.long_name;
      }
      if (element.types.includes('administrative_area_level_3')) {
        address.addressCity = element.long_name;
      }
      if (element.types.includes('postal_code')) {
        address.addressZipCode = element.long_name;
      }
    });
    control.patchValue(address);
    if (address?.addressCountry) {
      const country = this.countries.find(
        (item) =>
          item?.name?.toUpperCase() == address?.addressCountry?.toUpperCase()
      );
      this.businessRegistrationForm
        .get('primaryContact')
        .get('landline')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValue(country?.id);
      this.businessRegistrationForm
        .get('primaryContact')
        .get('phone')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValue(country?.id);
      this.businessRegistrationForm
        .get('primaryContact')
        .get('fax')
        .get('countryId').value ??
        this.businessRegistrationForm
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValue(country?.id);
      this.ref.detectChanges();
    }
  }

}
