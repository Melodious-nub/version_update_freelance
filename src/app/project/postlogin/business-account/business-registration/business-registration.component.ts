import { ChangeDetectorRef, Component, OnDestroy, OnInit, ElementRef, inject, viewChild } from '@angular/core';
import { UntypedFormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { BusinessAccountService } from '../business-account.service';
import { MatStepper } from '@angular/material/stepper';
import { BusinessRegistartionService } from '../services/business-registration.service';
import { ApiService } from 'src/app/service/api.service';
import { HeaderService } from 'src/app/service/header.service';
import { BusinessRegistrationFormsService } from '../services/business-registration-forms.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from 'src/app/service/token.service';
import { ContainerManagementService } from '../../container-management/service/container-management.service';
import { HttpService } from 'src/app/service/http.service';
import { PaymentInfoList } from 'src/app/project/prelogin/subscription/payment-info-list';
import { SortFormArrayPipe } from '../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinSearchSelectNewComponent } from '../../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinMapAutoCompleteComponent } from '../../../../shared/widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DadyinSelectComponent } from '../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-business-registration',
    templateUrl: './business-registration.html',
    styleUrls: ['./business-registration.scss'],
    imports: [
        DadyinButtonComponent,
        MatTabGroup,
        MatTab,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        DadyinInputComponent,
        DadyinSelectComponent,
        NgSelectModule,
        DadyinMapAutoCompleteComponent,
        DadyinSearchSelectNewComponent,
        MatTooltip,
        NgClass,
        ExtendedModule,
        MatProgressBar,
        DecimalPipe,
        DatePipe,
        SortFormArrayPipe
    ]
})
export class BusinessRegistrationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private businessAccountService = inject(BusinessAccountService);
  private businessRegistrationService = inject(BusinessRegistartionService);
  private businessFormService = inject(BusinessRegistrationFormsService);
  private toastr = inject(ToastrService);
  apiService = inject(ApiService);
  private headerService = inject(HeaderService);
  private commonService = inject(CommonService);
  containerService = inject(ContainerManagementService);
  ref = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private httpService = inject(HttpService);
  private route = inject(ActivatedRoute);

  // Platform name input fields for Social Profile Tab
  // Static data for Social Profile Table
  socialPlatforms = [
    { id: 1, name: 'Instagram', icon: 'assets/nicons/instagram.png' },
    { id: 2, name: 'Facebook', icon: 'assets/nicons/facebook.png' },
    { id: 3, name: 'LinkedIn', icon: 'assets/nicons/linkedin.png' }
  ];
  accountTypes = [
    { id: 1, name: 'Business' },
    { id: 2, name: 'Personal' }
  ];
  imgUrl = environment.imgUrl;
  currentMainIndex = 0;
  /** Tracks the tab we're on so we can validate when leaving (selectedTabChange fires after index has already changed). */
  private previousMainIndex = 0;
  currencyList: any = [];
  countries: any[] = [];
  imagesToShow: any = {};
  businessName = '';
  businessTypes: any[] = [];
  roles: any[] = [];
  branches: any[] = [];
  fromInvite = false;
  inviteId: any = null;
  businessAccount = null;
  branchTemporaryId = Math.floor(Math.random() * 90000) + 10000;
  public businessRegistrationForm: any;
  industrySubTypes: any[] = [];
  progressColor = 'blue';
  paymentInfoList = PaymentInfoList;
  subscriptionDetails;
  selectedSubscription;
  nextSubscription = null;
  paymentSuccess = false;
  toastTimer: any;

  shopNameChecking = false;
  shopNameStatus: 'AVAILABLE' | 'TAKEN' | null = null;
  shopNameStatusError = false;
  originalShopName: string | null = null;

  /** True when adding a new business (navigated with ?new=true); save uses same update API without id */
  isNewBusiness = false;

  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.containerService.Get_All_ports();
    this.apiService.Get_Industry_Types();
    this.apiService.Get_Customer_Categories();
    this.apiService.Get_Product_Types();
    this.businessRegistrationForm = this.businessFormService.createBusinessForm();

  }

  socialProfiles: any[] = [];

  // model for new social profile row (manual add)
  newSocialProfile: any = {
    platform_name: '',
    account_name: '',
    account_type: '',
    linked_email: '',
    connected_on: '',
    connection_status: ''
  };

  readonly accountTypeSelect = viewChild('accountTypeSelect', { read: ElementRef });

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Business Details',
      index: 0,
    },
    {
      id: 2,
      name: 'Employees',
      index: 1,
    },
  ];


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const idx = params['currentMainIndex'] ?? 0;
      this.currentMainIndex = idx;
      this.previousMainIndex = idx;
      this.paymentSuccess = params['payment'] ?? false;

      console.log(this.paymentSuccess);
      if (this.paymentSuccess) {
        this.showSuccessToast();

        setTimeout(() => {
          this.router.navigate([], {
            queryParams: { payment: null },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }, 7500); // small delay (300ms is enough)
      }

      // Handle LinkedIn OAuth callback: backend may redirect with `code` and `state`.
      // If present, call the python callback endpoint to complete the connection.
      const code = params['code'];
      const state = params['state'];
      if (code && state) {
        const callbackUrl = `${environment.pyApiUrl}auth/linkedin/callback`;
        const token = this.tokenService.getAccessToken();
        const headers = new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
        this.http
          .get<any>(callbackUrl, { headers, params: { code: code, state: state, status: 'success' } })
          .subscribe(
            (res) => {
              this.toastr.success('LinkedIn connected successfully');
              // Refresh social profiles list
              this.businessAccountService.getSocialProfiles().subscribe({
                next: (sp) => {
                  if (Array.isArray(sp)) this.socialProfiles = sp;
                  else if (sp?.items && Array.isArray(sp.items)) this.socialProfiles = sp.items;
                  this.ref.detectChanges();
                },
                error: () => { }
              });
              // Remove OAuth query params from URL
              this.router.navigate([], {
                queryParams: { code: null, state: null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
              });
            },
            (err) => {
              console.error('LinkedIn callback error', err);
              this.toastr.error('Failed to complete LinkedIn connection');
              this.router.navigate([], {
                queryParams: { code: null, state: null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
              });
            }
          );
      }
    });
    this.loadBusinessTypeAndcategories();
    this.loadCountry();
    this.loadRoles();
    this.setData();
    this.getIndustrySubTypes(this.industryTypeIds.value);
    this.setupShopNameStatusCheck();
    this.industryTypeIds.valueChanges.subscribe((res) => {
      this.getIndustrySubTypes(res);
    });
    // Setting validation to country code if number entered
    this.businessRegistrationForm.valueChanges.subscribe((val) => {
      if (
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('number').value != null
      ) {
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators([Validators.required]);
      } else {
        this.businessRegistrationForm
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators(null);
      }
      this.businessRegistrationForm
        .get('primaryContact')
        .get('landline')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
    });
    this.branchDetails.valueChanges.subscribe((val: Array<any>) => {
      val.forEach((value, index) => {
        let form = this.branchDetails.controls[index];
        if (form.get('phone').get('number').value != null) {
          form
            .get('phone')
            .get('countryId')
            .setValidators([Validators.required]);
        } else {
          form.get('phone').get('countryId').setValidators(null);
        }
        this.branchDetails.controls[index]
          .get('phone')
          .get('countryId')
          .updateValueAndValidity({ emitEvent: false });
      });
    });
    this.businessAccountService.getSocialProfiles().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.socialProfiles = res;
        } else if (res?.items && Array.isArray(res.items)) {
          // some APIs wrap in items
          this.socialProfiles = res.items;
        } else {
          this.socialProfiles = [];
        }
      },
      error: (err) => {
        console.error('Failed to load social profiles', err);
        this.socialProfiles = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get shopNameControl() {
    return this.businessRegistrationForm.get('shopName');
  }

  /** Full shop URL for display (e.g. https://your-shop-name.dadyin.com) */
  get shopUrlDisplay(): string {
    const name = (this.shopNameControl?.value ?? '').toString().trim();
    if (!name) return '';
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return slug ? `https://shop.dadyin.com?shop=${slug}` : '';
  }

  private setupShopNameStatusCheck(): void {
    const ctrl = this.shopNameControl;
    if (!ctrl) return;

    ctrl.valueChanges
      .pipe(
        map((val: any) => (val ?? '').toString().trim()),
        debounceTime(400),
        distinctUntilChanged(),
        tap((val) => {
          // Reset UI flags on every user edit
          this.shopNameStatus = null;
          this.shopNameStatusError = false;
          this.shopNameChecking = !!val;
          this.setShopNameTakenError(false);

          if (!val) {
            this.shopNameChecking = false;
          }
        }),
        filter((val): val is string => !!val),
        switchMap((val: string) => {
          // If the shop name is the same as the original, skip API call
          if (this.originalShopName && val.toLowerCase() === this.originalShopName.toLowerCase()) {
            return of('AVAILABLE' as const);
          }
          // Otherwise, check with API
          return this.businessAccountService.checkShopNameStatus(val).pipe(
            catchError((err) => {
              console.log(err);
              this.shopNameStatusError = true;
              this.shopNameChecking = false;
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((status) => {
        this.shopNameChecking = false;
        if (!status) return;

        this.shopNameStatus = status;
        this.setShopNameTakenError(status === 'TAKEN');
      });
  }

  private setShopNameTakenError(isTaken: boolean): void {
    const ctrl = this.shopNameControl;
    if (!ctrl) return;

    const existing = ctrl.errors ?? {};

    if (isTaken) {
      ctrl.setErrors({ ...existing, shopNameTaken: true });
      return;
    }

    if (!existing['shopNameTaken']) return;

    const { shopNameTaken, ...rest } = existing;
    ctrl.setErrors(Object.keys(rest).length ? rest : null);
  }

  get branchDetails() {
    return this.businessRegistrationForm.get('branchDetails') as UntypedFormArray;
  }
  get employeeDetails() {
    return this.businessRegistrationForm.get('employees') as UntypedFormArray;
  }

  get logoImage() {
    return this.businessRegistrationForm.get('businessLogo');
  }
  get businessLines() {
    return this.businessRegistrationForm.get('businessLines');
  }

  get addressCountry() {
    return this.businessRegistrationForm
      .get('primaryContact')
      .get('address')
      .get('addressCountry');
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

  action(event) {
    this.currentMainIndex = event.index;
    this.previousMainIndex = event.index;
  }

  /** Prevent switching to other tabs when required fields in the current tab are not filled (or when new business not saved). */
  onMainTabChange(event: { index: number }): void {
    const leavingIndex = this.previousMainIndex;
    const goingToIndex = event.index;

    // No actual tab change (e.g. we reverted and mat-tab-group emitted again) – avoid duplicate toast
    if (leavingIndex === goingToIndex) {
      return;
    }

    if (!this.isTabRequiredFieldsValid(leavingIndex)) {
      this.currentMainIndex = leavingIndex;
      this.ref.detectChanges();
      this.toastr.warning('Please fill all required fields in this tab before switching.');
      return;
    }

    if (this.isNewBusiness && goingToIndex !== 0) {
      this.currentMainIndex = 0;
      this.ref.detectChanges();
      this.toastr.warning('Please save the business first before switching to other tabs.');
      return;
    }

    this.previousMainIndex = goingToIndex;
  }

  /** Returns true if the given tab index has all required fields valid. */
  private isTabRequiredFieldsValid(tabIndex: number): boolean {
    if (tabIndex === 0) {
      const g = this.businessRegistrationForm;
      if (!g) return true;
      const name = g.get('name');
      const firstName = g.get('firstName');
      const lastName = g.get('lastName');
      const email = g.get('primaryContact')?.get('email');
      [name, firstName, lastName, email].forEach((c) => c?.markAsTouched?.());
      return (
        (name?.valid ?? true) &&
        (firstName?.valid ?? true) &&
        (lastName?.valid ?? true) &&
        (email?.valid ?? true)
      );
    }
    if (tabIndex === 1) {
      const arr = this.employeeDetails;
      if (!arr?.length) return true;
      let allValid = true;
      arr.controls.forEach((c) => {
        const first = c.get('firstName');
        first?.markAsTouched?.();
        if (first?.invalid) allValid = false;
      });
      return allValid;
    }
    return true;
  }

  loadRoles() {
    this.businessRegistrationService.getAllRoles().subscribe((data) => {
      this.roles = data;
    });
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

  onNext(stepper: MatStepper) {
    stepper.next();
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

  setData() {
    this.isNewBusiness = this.route.snapshot.queryParamMap.get('new') === 'true';
    if (this.isNewBusiness) {
      // Add new business: use same form structure but do not prefill; keep form empty
      this.branchDetails.clear();
      this.employeeDetails.clear();
      this.originalShopName = null;
      this.currentMainIndex = 0; // Stay on Business Details until saved
      this.previousMainIndex = 0;
      return;
    }
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.patchData(res);
      this.setSubscriptionData(res); 
    });
  }

  patchData(data: any) {
    this.branchDetails.clear();
    data?.branchDetails.forEach((branch) => {
      const form = this.businessFormService.branchDetailForm();
      this.branchDetails.push(form);
    });
    this.employeeDetails.clear();
    data?.employees.forEach((employee) => {
      const form = this.businessFormService.employeeForm();
      this.employeeDetails.push(form);
    });
    console.log('data', data);
    this.businessRegistrationForm.patchValue(data);
    this.businessRegistrationForm.get('themePrimaryColor').setValue(this.businessRegistrationForm.get('themePrimaryColor')?.value ?? '#0065F4');
    this.businessRegistrationForm.get('themeSecondaryColor').setValue(this.businessRegistrationForm.get('themeSecondaryColor')?.value ?? '#dfeffb');
    this.businessRegistrationForm.get('themePrimaryColorLight').setValue(this.businessRegistrationForm.get('themePrimaryColorLight')?.value ?? '#d5e7fa');
    this.businessRegistrationForm.get('themeSecondaryColorLight').setValue(this.businessRegistrationForm.get('themeSecondaryColorLight')?.value ?? '#f3f9fd');
    this.businessRegistrationForm.get('themePrimaryColor').updateValueAndValidity();
    this.businessRegistrationForm.get('themeSecondaryColor').updateValueAndValidity();
    this.businessRegistrationForm.get('themePrimaryColorLight').updateValueAndValidity();
    this.businessRegistrationForm.get('themeSecondaryColorLight').updateValueAndValidity();
    // Store the original shop name to avoid unnecessary API calls
    this.originalShopName = data?.shopName ? (data.shopName ?? '').toString().trim() : null;
  }

  setSubscriptionData(res) {
    this.subscriptionDetails = res?.businessSubscriptionUsageDetails;
    if (this.subscriptionDetails) {
      this.selectedSubscription = this.paymentInfoList.find((val: any) => val.businessSubscriptionId === this.subscriptionDetails?.businessSubscriptionId);
    } else {
      this.selectedSubscription = this.paymentInfoList[0];
      // Call API
    }
    const nextSubscriptionId = this.selectedSubscription?.businessSubscriptionId + 1;
    const nextSubscription = this.paymentInfoList.find(val => val.businessSubscriptionId === nextSubscriptionId);
    if (nextSubscription) {
      this.nextSubscription = nextSubscription;
    }
  }

  getPendingDays() {
    const startDate = new Date(this.subscriptionDetails?.subscriptionStart);
    const supportMonths = this.selectedSubscription?.productSupportValue; // '2M' means 2 months
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + supportMonths);

    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const pendingDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0); // Avoid negative days
    return pendingDays;
  }

  getCompletionDate(): Date {
    const startDate = new Date(this.subscriptionDetails?.subscriptionStart);
    const supportMonths = this.selectedSubscription?.productSupportValue;
    const completionDate = new Date(startDate);
    completionDate.setMonth(completionDate.getMonth() + supportMonths);
    return completionDate;
  }

  getAutoRenewsDate() {
    const date = new Date(this.subscriptionDetails?.subscriptionEnd);
    date.setDate(date.getDate() + 1);
    const nextDay = date.toISOString(); // or format as needed
    return nextDay;
  }

  navigateToSubscriptionPage() {
    this.router.navigateByUrl('/subscription', { state: { from: 'business-registration', paymentInfoId: this.nextSubscription?.businessSubscriptionId } });
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  goBackToBD() {
    this.router.navigateByUrl('/home/business-details');
  }

  addBranchLineItem() {
    const branchForm = this.businessFormService.branchDetailForm();
    this.branchTemporaryId = this.branchTemporaryId + 1;
    branchForm.patchValue(this.businessRegistrationForm.value?.primaryContact);
    branchForm.get('temporaryId').patchValue(this.branchTemporaryId);
    branchForm
      .get('sortOrder')
      .patchValue(this.branchDetails?.controls?.length + 1);
    branchForm.get('id').patchValue(null);
    branchForm
      .get('phone')
      .patchValue(
        this.businessRegistrationForm.value?.primaryContact?.landline
      );
    this.branchDetails.push(branchForm);
  }

  deleteBranchLineItem(i) {
    this.branchDetails.removeAt(i);
  }

  addEmployeeItem() {
    const employeeForm = this.businessFormService.employeeForm();
    employeeForm
      .get('sortOrder')
      .patchValue(this.employeeDetails?.controls?.length + 1);
    this.employeeDetails.push(employeeForm);
  }
  deleteEmployeeItem(i) {
    this.employeeDetails.removeAt(i);
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files);
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles(imgfile);
      this.logoImage.setValue(res?.data[0].media_url);
    } catch (err: any) {
      console.log(err);
    }
  }

  removeImage() {
    this.logoImage.setValue('');
  }

  onSubmit() {


    if (this.businessRegistrationForm.invalid) {
      const invalidControlNames = this.commonService.findInvalidControlNames(
        this.businessRegistrationForm
      );
      this.toastr.error('Fields Invalid: ' + invalidControlNames);
      return;
    }
    if (
      this.businessRegistrationForm.get('verifiedStatus').value == null ||
      this.businessRegistrationForm.get('verifiedStatus').value == 'NONE'
    ) {
      this.businessRegistrationForm.get('verifiedStatus').setValue('SELF');
    }
    if (this.fromInvite) {
      this.businessRegistrationForm.get('fromInvite').setValue(true);
      this.businessRegistrationForm.get('inviteId').setValue(this.inviteId);
    } else {
      this.businessRegistrationForm.get('fromInvite').setValue(false);
    }
    let formData: any = this.businessRegistrationForm.getRawValue();
    formData?.employees.forEach((employee) => {
      if (employee.branchId == 'null') {
        employee.branchId = null;
      }
    });
    if (!Array.isArray(formData.businessLines)) {
      formData.businessLines = [formData.businessLines]; // If it's already an array, return it as is
    }
    // New business: use same update API but without id so backend saves as new
    if (this.isNewBusiness) {
      const { id, ...payload } = formData;
      formData = payload;
    }
    const save$ = this.businessAccountService.updateBusinessAccount(formData);
    save$.subscribe({
      next: (data) => {
        if (this.isNewBusiness) {

          this.toastr.success('Business added successfully');
          this.router.navigate(['/home/users-management/users']);
        } else {
          this.patchData(data);
          this.headerService.logoChanged.next(true);
          this.toastr.success('Details saved successfully');
        }
      },
      error: (error) => {
        this.toastr.error(
          error?.error?.userMessage ?? 'Something Went Wrong, Please Try again'
        );
      },
    });
  }

  onSelectBranch(employee, event) {
    if (event.target.value == null || event.target.value == 'null') {
      let optionText: any =
        event.target.options[event.target.options.selectedIndex].text;
      const branchItem = this.branchDetails?.value.find(
        (item) => item.id == null && item.name == optionText
      );
      employee.get('temporaryBranchId').setValue(branchItem.temporaryId);
    }
  }

  jumpToDashboard() {
    this.router.navigateByUrl('/home');
  }

  sendInvite(employee: any) {
    let data: any = {
      invitedTo: employee.firstName,
      email: employee.email,
      phone: {
        countryCode: employee.countryCode,
        number: employee.number,
      },
      inviteType: 'EMPLOYEE',
      inviteTypeReferenceId: employee.id,
      businessType: 'IMPORTER',
      shareCatelog: 'N',
      catelog: null,
      redirectType: 'HOME',
      redirectReferenceId: null,
      message:
        'You are invited to join the Account' +
        this.businessRegistrationForm.value.name,
    };
    this.businessRegistrationService
      .sendInvite(data)
      .pipe(first())
      .subscribe(
        (data: any) => { },
        (error) => {
          this.toastr.error(
            error?.error?.userMessage ?? 'Something Went Wrong,Please Try again'
          );
        }
      );
  }

  onBackStep(index) {
    const idx = index - 1;
    this.currentMainIndex = idx;
    this.previousMainIndex = idx;
  }
  getIndustrySubTypes(industryTypeIds: any) {
    this.industrySubTypes = [];
    this.apiService.allIndustryTypes.forEach((obj) => {
      obj.industryTypeSubTypes.forEach((subtype) => {
        if (industryTypeIds?.includes(obj.id)) {
          this.industrySubTypes.push({
            id: subtype.id,
            description:
              obj.description + ' - ' + subtype.industrySubType.description,
          });
        }
      });
    });
  }

  handleProductTypeClick(event: string) {
    if (event) {
      this.apiService.Get_Product_Types(event);
    }
  }

  getPlatformIcon(name: string) {
    if (!name) return '';
    const found = this.socialPlatforms.find(p => p.name?.toLowerCase() === name?.toString().toLowerCase());
    return found ? found.icon : '';
  }

  assignLeadsToEmployee(employee) {
    this.router.navigateByUrl(
      '/home/lead/list?currentStepIndex=2&assignedSalesId=' + employee?.id
    );
  }

  viewAssignedLeadsToEmployee(id) {
    if (id) {
      this.router.navigateByUrl(
        '/home/lead/list?currentStepIndex=2&employeeId=' + id
      );
    } else {
      this.toastr.error('Employee ID is required,Please save the employee first');
    }
  }

  get industryTypeIds() {
    return this.businessRegistrationForm.get('industryTypeIds');
  }
  get industrySubTypeIds() {
    return this.businessRegistrationForm.get('industrySubTypeIds');
  }

  get productTypeIds() {
    return this.businessRegistrationForm.get('productTypeIds');
  }

  get productCategoryIds() {
    return this.businessRegistrationForm.get('productCategoryIds');
  }

  getSupportProgressValue(): number {
    // Calculate total days between start and end date
    if (!this.subscriptionDetails?.subscriptionStart || !this.selectedSubscription?.productSupportValue) {
      return 0;
    }
    const startDate = new Date(this.subscriptionDetails.subscriptionStart);
    const supportMonths = this.selectedSubscription.productSupportValue;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + supportMonths);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const today = new Date();
    const elapsedDays = Math.min(Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), totalDays);
    if (totalDays <= 0) return 100;
    return Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
  }

  showSuccessToast() {
    this.paymentSuccess = true;

    // Auto-hide after 5 seconds
    this.toastTimer = setTimeout(() => {
      this.paymentSuccess = false;
    }, 7500);
  }

  hideSuccessToast() {
    this.paymentSuccess = false;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  resetToDefaultTheme() {
    // Default colors from styles.scss
    const defaultColors = {
      '--primary-color': '#0065F4',
      '--primary-light': '#d5e7fa',
      '--secondary-color': '#dfeffb',
      '--secondary-light': '#f3f9fd'
    };

    // Reset form control values
    this.businessRegistrationForm.get('themePrimaryColor').setValue('#0065F4');
    this.businessRegistrationForm.get('themeSecondaryColor').setValue('#dfeffb');
    this.businessRegistrationForm.get('themePrimaryColorLight').setValue('#d5e7fa');
    this.businessRegistrationForm.get('themeSecondaryColorLight').setValue('#f3f9fd');

    // Reset CSS variables
    const root = document.documentElement;
    Object.keys(defaultColors).forEach(key => {
      root.style.setProperty(key, defaultColors[key]);
    });

    this.toastr.success('Theme reset to default colors');
  }

  onNewPlatformChange() {
    const name = (this.newSocialProfile?.platform_name || '').toString();
    if (name === 'Instagram' || name === 'Facebook') {
      this.newSocialProfile.account_type = 'Business';
    } else if (name === 'LinkedIn') {
      // For LinkedIn clear selection so placeholder shows and allow user to choose
      this.newSocialProfile.account_type = '';
      // open/focus the account type select so options are visible to the user
      setTimeout(() => {
        try {
          this.accountTypeSelect()?.nativeElement.focus();
          this.accountTypeSelect()?.nativeElement.click();
        } catch (e) { }
      }, 0);
    } else {
      this.newSocialProfile.account_type = '';
    }
  }

  preventAccountTypeChange(event: MouseEvent) {
    const name = (this.newSocialProfile?.platform_name || '').toString();
    if (name === 'Instagram' || name === 'Facebook') {
      event.preventDefault();
      return false;
    }
    return true;
  }

  addSocialProfile() {
    if (!this.newSocialProfile || !this.newSocialProfile.platform_name) {
      // require at least platform name
      return;
    }
    if (!Array.isArray(this.socialProfiles)) this.socialProfiles = [];
    const toAdd = { ...this.newSocialProfile };
    this.socialProfiles.push(toAdd);
    this.newSocialProfile = {
      platform_name: '',
      account_name: '',
      account_type: '',
      linked_email: '',
      connected_on: '',
      connection_status: ''
    };
    this.ref.detectChanges();
  }

  // Handle Connect button click in the default social-profile row
  onConnectClick() {
    // Initiate auth for platform selected in the newSocialProfile row
    this.initiateSocialAuth(this.newSocialProfile?.platform_name);
  }

  // Trigger connect for an existing profile row
  onConnectProfile(profile: any) {
    this.initiateSocialAuth(profile?.platform_name);
  }

  // Centralized method to initiate OAuth/auth flow for social platforms
  initiateSocialAuth(platformName: string) {
    const name = (platformName || '').toString().toLowerCase();
    if (name === 'facebook' || name === 'instagram') {
      // For both facebook and instagram backend uses same endpoint but different intent
      const intent = name; // 'facebook' or 'instagram'
      const url = `${environment.pyApiUrl}auth/facebook/login?intent=${intent}`;
      const token = this.tokenService.getAccessToken();
      const headers = new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
      // Open popup synchronously on user gesture to avoid popup blockers.
      const width = 900;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const features = `popup=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`;
      let popup = window.open('', `social_auth_${name}_${Date.now()}`, features);

      if (!popup) {
        this.toastr.error('Popup blocked. Please allow popups for this site.');
        // fallback: initiate in same window
        this.http.get<any>(url, { headers }).subscribe((res) => {
          const redirectUrl = res?.oauth_url || res?.redirect_url || res?.url || (typeof res === 'string' ? res : null);
          if (redirectUrl && redirectUrl.toString().startsWith('http')) {
            window.location.href = redirectUrl;
          }
        }, (err) => {
          console.error(`${platformName} auth error`, err);
          this.toastr.error(`Failed to initiate ${platformName} login`);
        });
        return;
      }

      // Attach listener & polling for this popup, and then set location when backend returns URL
      this.openAuthPopup(null, name, popup);

      this.http.get<any>(url, { headers }).subscribe((res) => {
        const redirectUrl = res?.oauth_url || res?.redirect_url || res?.url || (typeof res === 'string' ? res : null);
        if (redirectUrl && redirectUrl.toString().startsWith('http')) {
          try {
            popup.location.href = redirectUrl;
          } catch (e) {
            // If cross-origin assignment fails, fall back to opening new window
            try { popup = window.open(redirectUrl, `social_auth_${name}_${Date.now()}`, features); } catch (e2) { }
          }
        } else {
          this.toastr.info(`${(platformName || 'Platform')} auth initiated`);
        }
      }, (err) => {
        console.error(`${platformName} auth error`, err);
        this.toastr.error(`Failed to initiate ${platformName} login`);
      });
      return;
    } else if (name === 'linkedin') {
      const url = `${environment.pyApiUrl}auth/linkedin/login`;
      const token = this.tokenService.getAccessToken();
      const headers = new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
      // Open popup synchronously to avoid popup blockers
      const width = 900;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const features = `popup=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`;
      let popup = window.open('', `social_auth_${name}_${Date.now()}`, features);

      if (!popup) {
        this.toastr.error('Popup blocked. Please allow popups for this site.');
        // fallback: initiate in same window
        this.http.get<any>(url, { headers }).subscribe((res) => {
          const redirectUrl = res?.oauth_url || res?.redirect_url || res?.url || (typeof res === 'string' ? res : null);
          if (redirectUrl && redirectUrl.toString().startsWith('http')) {
            window.location.href = redirectUrl;
          }
        }, (err) => {
          console.error('LinkedIn auth error', err);
          this.toastr.error('Failed to initiate LinkedIn login');
        });
        return;
      }

      this.openAuthPopup(null, name, popup);

      this.http.get<any>(url, { headers }).subscribe((res) => {
        const redirectUrl = res?.oauth_url || res?.redirect_url || res?.url || (typeof res === 'string' ? res : null);
        if (redirectUrl && redirectUrl.toString().startsWith('http')) {
          try {
            popup.location.href = redirectUrl;
          } catch (e) {
            try { window.open(redirectUrl, `social_auth_${name}_${Date.now()}`, features); } catch (e2) { }
          }
        } else {
          this.toastr.info('LinkedIn auth initiated');
        }
      }, (err) => {
        console.error('LinkedIn auth error', err);
        this.toastr.error('Failed to initiate LinkedIn login');
      });
      return;
    }
    // Fallback: simply add the social profile locally
    this.addSocialProfile();
  }

  private openAuthPopup(url: string | null, providerName: string, existingPopup?: Window | null) {
    const width = 900;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `popup=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`;

    let popup: Window | null = existingPopup ?? null;
    try {
      if (!popup || popup.closed) {
        popup = window.open(url || 'about:blank', `social_auth_${providerName}_${Date.now()}`, features);
      } else if (url) {
        try { popup.location.href = url; } catch (e) { /* ignore */ }
      }
      // If popup was created as a same-origin blank window, inject a small loading UI
      try {
        if (popup && !popup.closed) {
          const loadingHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Connecting...</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f7fbff;font-family:Arial,Helvetica,sans-serif} .box{text-align:center} .spinner{width:56px;height:56px;border:6px solid #e6f0ff;border-top-color:#0d60c7;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 14px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} .msg{color:#0d60c7;font-weight:600;margin-bottom:6px} .sub{color:#667085;font-size:13px}</style><script>window.addEventListener('message',e=>{});function focusMe(){try{window.focus();}catch(e){}}setTimeout(focusMe,100);</script></head><body><div class="box"><div class="spinner"></div><div class="msg">Connecting to ${providerName}</div><div class="sub">If popup remains blank, allow popups in your browser.</div></div></body></html>`;
          // Try document.write only for same-origin about:blank popup
          try {
            popup.document.open();
            popup.document.write(loadingHtml);
            popup.document.close();
          } catch (e) {
            // ignore if cross-origin
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      popup = null;
    }

    if (!popup) {
      this.toastr.error('Popup blocked. Please allow popups for this site.');
      return;
    }

    let callbackReceived = false;
    const messageHandler = (event: MessageEvent) => {
      try {
        if (event?.origin && event.origin !== window.location.origin) {
          return;
        }
        const data = event?.data;
        if (!data || data.type !== 'social-callback') return;

        callbackReceived = true;

        // Refresh social profiles list from backend (no toasts; UI shows result in popup)
        this.businessAccountService.getSocialProfiles().subscribe({
          next: (sp) => {
            if (Array.isArray(sp)) this.socialProfiles = sp;
            else if (sp?.items && Array.isArray(sp.items)) this.socialProfiles = sp.items;
            else this.socialProfiles = [];
            this.ref.detectChanges();
          },
          error: () => {
            // UI relies on backend state and popup feedback
          }
        });

        window.removeEventListener('message', messageHandler);
      } catch (err) {
        console.error('Error handling social callback message', err);
      }
    };

    window.addEventListener('message', messageHandler);

    // Monitor popup closed and cleanup
    const pollTimer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener('message', messageHandler);
        // If popup closed without sending callback message, still refresh profiles
        if (!callbackReceived) {
          this.businessAccountService.getSocialProfiles().subscribe({
            next: (sp) => {
              if (Array.isArray(sp)) this.socialProfiles = sp;
              else if (sp?.items && Array.isArray(sp.items)) this.socialProfiles = sp.items;
              else this.socialProfiles = [];
              this.ref.detectChanges();
            },
            error: () => { }
          });
        }
      }
    }, 500);
  }

  // Confirm then delete a connected social profile
  confirmDelete(profile: any, index: number) {
    const dialogRef = this.commonService.showAlertDialog({
      heading: 'Confirm Delete',
      content: 'Are you sure you want to delete this connected platform?',
      showCancel: true,
      cancelBtnName: 'Cancel',
      actionBtnName: 'Delete',
    });

    dialogRef.afterClosed().pipe(first()).subscribe((confirmed: any) => {
      if (!confirmed) return;

      // determine connection id field
      const connectionId = profile?.connection_id ?? profile?.connectionId ?? profile?.id ?? profile?.connection ?? null;
      if (!connectionId) {
        // fallback: if no remote id, just remove locally
        this.removeSocialProfile(index);
        this.toastr.success('Removed locally');
        return;
      }

      this.businessAccountService.deleteSocialProfile(connectionId).subscribe({
        next: (res) => {
          this.toastr.success('Platform disconnected');
          // refresh social profiles list
          this.businessAccountService.getSocialProfiles().subscribe({
            next: (res2) => {
              if (Array.isArray(res2)) this.socialProfiles = res2;
              else if (res2?.items && Array.isArray(res2.items)) this.socialProfiles = res2.items;
              else this.socialProfiles = [];
              this.ref.detectChanges();
            },
            error: () => {
              this.socialProfiles = [];
            }
          });
        },
        error: (err) => {
          console.error('Delete social profile failed', err);
          this.toastr.error('Failed to disconnect platform');
        }
      });
    });
  }

  removeSocialProfile(index: number) {
    if (index > -1 && index < this.socialProfiles.length) {
      this.socialProfiles.splice(index, 1);
    }
  }
}
