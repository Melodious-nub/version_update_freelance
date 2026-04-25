import { Component, OnInit, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, inject, viewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccounts } from 'src/app/model/common/business-account';
import { UserAccount } from 'src/app/model/common/user-account';
import { AuthService } from 'src/app/service/auth.service';
import { TokenService } from 'src/app/service/token.service';
import { BusinessRegistrationFormsService } from './services/business-registration-forms.service';
import { BusinessAccountService } from './business-account.service';


import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { NgClass } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DadyinMapAutoCompleteComponent } from '../../../shared/widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { DadyinSelectComponent } from '../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';
@Component({
    selector: 'app-business-account',
    templateUrl: './business-account.html',
    styleUrls: ['./business-account.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinSelectComponent,
        DadyinMapAutoCompleteComponent,
        NgSelectModule,
        DadyinButtonComponent,
        NgClass,
        ExtendedModule
    ]
})
export class BusinessAccountComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private fb = inject(UntypedFormBuilder);
  private businessAccountService = inject(BusinessAccountService);
  private businessFormService = inject(BusinessRegistrationFormsService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private tokenService = inject(TokenService);

  readonly swiperR = viewChild<ElementRef>('swiperR');
  activeIndex = 0;
  swiperConfig: any = {
    spaceBetween: 15,
    navigation: false,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    }
  };

  public businessAccountForm: UntypedFormGroup;

  private user: UserAccount;
  public inviteId;
  public fromInvite = false;

  public countries: any = [];
  public currencyList: any = [];
  public businessTypes: any = [];

  ngAfterViewInit() {
    const swiperR = this.swiperR();
    if (swiperR) {
      const swiperEl = swiperR.nativeElement;
      Object.assign(swiperEl, this.swiperConfig);
      
      swiperEl.addEventListener('swiperslidechange', (event: any) => {
        this.activeIndex = event.detail[0].realIndex;
      });

      swiperEl.initialize();
    }
  }

  goToSlide(index: number) {
    const swiperR = this.swiperR();
    if (swiperR) {
      swiperR.nativeElement.swiper.slideToLoop(index);
    }
  }

  ngOnInit(): void {
    this.businessAccountForm = this.businessFormService.createBusinessForm();
    this.loadCountry();

    this.authService.$currentUser.subscribe((res) => {
      this.user = res;
    });

    this.loadBusinessTypeAndcategories();

    if (this.businessAccountService.currentBusinessAccountId) {
      this.businessAccountService
        .getBusinessAccountDetailFromInvite(
          this.businessAccountService.currentBusinessAccountId
        )
        .subscribe((data) => {
          if (data != null && data.name != null) {
            let response: BusinessAccounts = data;
            this.businessAccountForm.get('name').setValue(response.name);
            this.businessAccountForm
              .get('primaryContact')
              .get('email')
              .setValue(response.primaryContact.email);
            this.businessAccountForm
              .get('primaryContact')
              .get('phone')
              .setValue(response.primaryContact.phone);
            this.businessAccountForm
              .get('businessLines')
              .setValue(response.type);
            this.fromInvite = response.fromInvite;
            this.inviteId = response.inviteId;
          }
        });
    }

    if (this.tokenService.getBusinessAccountIdToken()) {
      this.router.navigateByUrl('/home/business-registration');
    }
  }

  loadBusinessTypeAndcategories() {
    this.businessAccountService.getBusinessTypes().subscribe((res) => {
      this.businessTypes = res;
      this.businessTypes = this.businessTypes.map((item) => ({
        id: item,
        description: item,
      }));
    });
  }

  loadCountry() {
    this.businessAccountService.getCountry().subscribe((data) => {
      this.countries = data;
      if (this.countries != null) {
        this.countries.forEach((c) => {
          this.currencyList.push({
            value: c.currency,
            label: c.currency,
          });
        });
      }
    });
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
  }

  saveBusinessDetails() {
    if (this.businessAccountForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    if (this.fromInvite) {
      this.businessAccountForm.get('fromInvite').setValue(true);
      this.businessAccountForm.get('inviteId').setValue(this.inviteId);
    } else {
      this.businessAccountForm.get('fromInvite').setValue(false);
      this.businessAccountForm.get('inviteId').setValue(null);
    }

    let businessAccount = this.businessAccountForm.getRawValue();
    if (!Array.isArray(businessAccount.businessLines)) {
      businessAccount.businessLines = [businessAccount.businessLines]; // If it's already an array, return it as is
    }
    this.businessAccountService
      .saveBusinessAccount(businessAccount, this.user.id)
      .subscribe(
        (data) => {
          let businessAccount = data;
          if (businessAccount.id != null) {
            // store business account and role detail in session for other apis
            this.authService.setRoleAndBusinessAccount(
              businessAccount.roleName,
              businessAccount.id
            );
            this.authService.$currentBusinessAccountUser.next(data);
            this.businessAccountService.currentBusinessAccountId =
              businessAccount.id;
            this.toastr.success('Registered Successfully !');
            if (this.authService.getRedirectUrl()) {
              // this.router.navigateByUrl(this.authService.getRedirectUrl());
            } else {
              this.router.navigateByUrl('/home/business-registration');
            }
          } else {
            this.toastr.error('Something went wrong, please contact DADYIN.');
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

  onSubmit() {
    this.saveBusinessDetails();
  }
  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }
}
