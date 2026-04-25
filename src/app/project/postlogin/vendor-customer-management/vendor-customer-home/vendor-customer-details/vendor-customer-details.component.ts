import { VendorFormsService } from '../../service/vendor-forms.service';
import { Component, OnInit, ChangeDetectorRef, OnChanges, inject, input, output, viewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ContainerManagementService } from '../../../container-management/service/container-management.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { NoteDialogComponent } from '../../shared/note-dialog/note-dialog.component';
import { environment } from 'src/environments/environment';
import { VendorCustomerService } from '../../service/vendor-customer.service';
import { AuthService } from 'src/app/service/auth.service';
import { BusinessEntityConfigurationComponent } from '../../../system-config-management/business-entity-configuration/business-entity-configuration.component';
import { SystemConfigFormsService } from '../../../system-config-management/service/system-config-forms.service';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchSelectNewComponent } from '../../../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinMapAutoCompleteComponent } from '../../../../../shared/widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgSelectModule } from '@ng-select/ng-select';
import { DadyinSelectComponent } from '../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatOption } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, SlicePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-vendor-customer-details',
    templateUrl: './vendor-customer-details.component.html',
    styleUrls: ['./vendor-customer-details.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatOption,
        DadyinInputComponent,
        DadyinSelectComponent,
        NgSelectModule,
        NgClass,
        ExtendedModule,
        DadyinMapAutoCompleteComponent,
        MatDialogClose,
        DadyinSearchSelectNewComponent,
        DadyinButtonComponent,
        BusinessEntityConfigurationComponent,
        SlicePipe
    ]
})
export class VendorDetailsComponent implements OnInit, OnChanges {
  apiService = inject(ApiService);
  toastr = inject(ToastrService);
  containerService = inject(ContainerManagementService);
  businessAccountService = inject(BusinessAccountService);
  vendorCustomerService = inject(VendorCustomerService);
  vendorFormsService = inject(VendorFormsService);
  systemConfigFormsService = inject(SystemConfigFormsService);
  ref = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  route = inject(ActivatedRoute);

  public imgUrl = environment.imgUrl;
  public keywordsList: any = [];
  public port: any = [];
  public city: any = [];
  public businessAccounts: any = [];
  public businessTypes: any = [];
  public editVendorData: any = [];
  public isShowKeyword: boolean = false;

  public businessAccountList: any[] = [];
  keyword = new UntypedFormControl();
  isEnabled: boolean = false;

  timeLimit = [
    { value: 0, label: 0 + '\n' + 'Days' },
    { value: 7, label: 7 + '\n' + 'Days' },
    { value: 15, label: 15 + '\n' + 'Days' },
    { value: 30, label: 30 + '\n' + 'Days' },
    { value: 60, label: 60 + '\n' + 'Days' },
    { value: 90, label: 90 + '\n' + 'Days' },
    { value: 120, label: 120 + '\n' + 'Days' },
    { value: 180, label: 180 + '\n' + 'Days' },
  ];
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];

  ngOnChanges(): void {
    this.vendorForm()
      .get('relationAccountDetail')
      .get('verifiedStatus')
      .valueChanges.subscribe((res) => {
        if (res != 'NONE') {
          this.disableBusinessDetail();
        }
      });
  }

  readonly vendorForm = input<UntypedFormGroup>(undefined);
  readonly isCustomer = input<any>(undefined);
  public industrySubTypes: any;
  readonly countries = input<any>(undefined);
  readonly emitBusinessAccountSelected = output<any>();
  readonly emitClearBusinessAccount = output<any>();
  readonly businessEntityConfigComponent = viewChild(BusinessEntityConfigurationComponent);

  ngOnInit(): void {
    this.loadPort();
    this.businessAccountService.Get_All_employees();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_paymentTerms();
    this.loadEmployees();
    this.getIndustrySubTypes(this.industryTypeIds.value);
    this.industryTypeIds.valueChanges.subscribe((res) => {
      this.getIndustrySubTypes(res);
    });
    this.isEnabled = this.vendorForm().get('relationAccountDetail').get('name')
      .disabled
      ? true
      : false;

    // Setting validation to country code if number entered
    this.vendorForm().valueChanges.subscribe((val) => {
      let landlineNumber = this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('landline')
        .get('number').value;
      if (landlineNumber != null) {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators([Validators.required]);
      } else {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('landline')
          .get('countryId')
          .setValidators(null);
      }

      let phoneNumber = this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone')
        .get('number').value;
      if (phoneNumber == null || phoneNumber == '') {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValidators(null);
      } else {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('phone')
          .get('countryId')
          .setValidators([Validators.required]);
      }

      let faxNumber = this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('fax')
        .get('number').value;
      if (faxNumber == null || faxNumber == '') {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValidators(null);
      } else {
        this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('fax')
          .get('countryId')
          .setValidators([Validators.required]);
      }
      this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('landline')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
      this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
      this.vendorForm()
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('fax')
        .get('countryId')
        .updateValueAndValidity({ emitEvent: false });
    });
    this.businessAddress.valueChanges.subscribe((val: Array<any>) => {
      val.forEach((value, index) => {
        let form = this.businessAddress.controls[index];
        if (form.get('phone').get('number').value != null) {
          form
            .get('phone')
            .get('countryId')
            .setValidators([Validators.required]);
        } else {
          form.get('phone').get('countryId').setValidators(null);
        }
        this.businessAddress.controls[index]
          .get('phone')
          .get('countryId')
          .updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  populateAttributeValuesFromRelationAccount(retryCount: number = 0, maxRetries: number = 10) {
    try {
      const relationAccountAttributeValues = this.vendorForm().get('relationAccountAttributeValues') as UntypedFormArray;
      if (!relationAccountAttributeValues) {
        throw new Error('Relation account attribute values not found');
      }
      if (relationAccountAttributeValues.length === 0) {
        console.log('Relation account attribute values are empty, skipping population');
        return;
      }

      // Check if business entity config component is available
      const businessEntityConfigComponent = this.businessEntityConfigComponent();
      if (!businessEntityConfigComponent?.configurationForm) {
        // Retry if component is not yet available
        if (retryCount < maxRetries) {
          console.log(`Business entity configuration component not available, retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            this.populateAttributeValuesFromRelationAccount(retryCount + 1, maxRetries);
          }, 200); // Wait 200ms before retrying
          return;
        } else {
          console.warn('Business entity configuration component not available after max retries, skipping population');
          return;
        }
      }

      const configurationForm = businessEntityConfigComponent.configurationForm;
      const sections = configurationForm.get('sections') as UntypedFormArray;

      if (!sections || sections.length === 0) {
        // If sections are empty, wait a bit more for them to load
        if (retryCount < maxRetries) {
          console.log(`Business config sections are empty, retrying... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            this.populateAttributeValuesFromRelationAccount(retryCount + 1, maxRetries);
          }, 200);
          return;
        } else {
          console.log('Business config sections are empty after max retries, skipping population');
          return;
        }
      }

      this.ref.detectChanges();
      console.log('Attribute values populated from relation account to business config sections');
    } catch (error) {
      console.error('Error populating attribute values from relation account:', error);
    }
  }





  handleSelectKeyWordClick(event: string) {
    if (event) {
      this.loadKeywords(event);
    }
  }

  getIndustrySubTypes(industryTypeIds: any) {
    this.industrySubTypes = [];
    this.apiService.allIndustryTypes.forEach((obj) => {
      obj.industryTypeSubTypes.forEach((subtype) => {
        if (industryTypeIds?.includes(obj.id)) {
          this.industrySubTypes.push({
            id: subtype.industrySubType.id,
            description:
              obj.description + ' - ' + subtype.industrySubType.description,
          });
        }
      });
    });
  }

  getBusinessAccounts(event: any, type: any) {
    const x = event.target.value + '';
    this.businessAccountList = [];
    if (x?.length >= 1) {
      this.businessAccountService
        .getBusinessAccountsListBySearchTerm(type, x)
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((data) => {
          let businessId = this.businessAccountService.currentBusinessAccountId;
          this.businessAccountList = data.filter((obj) => obj.id != businessId);
        });
    }
  }

  selectBusinessAccount(item) {
    this.vendorForm().get('relationAccountDetail').patchValue(item);
    this.disableBusinessDetail();


    this.emitBusinessAccountSelected.emit(undefined as any);
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  onAddressSelection(event: any, control, isPrimary) {
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
      if (
        element.types.includes('administrative_area_level_3') ||
        element.types.includes('sublocality') ||
        element.types.includes('sublocality_level_1')
      ) {
        address.addressCity = element.long_name;
      }
      if (element.types.includes('postal_code')) {
        address.addressZipCode = element.long_name;
      }
    });
    control.patchValue(address);

    if (address?.addressCountry && isPrimary) {
      const country = this.countries().find(
        (item) =>
          item?.name?.toUpperCase() == address?.addressCountry?.toUpperCase()
      );
      this.primaryContact.get('landline').get('countryId').value ??
        this.primaryContact
          .get('landline')
          .get('countryId')
          .setValue(country?.id);
      this.primaryContact.get('phone').get('countryId').value ??
        this.primaryContact.get('phone').get('countryId').setValue(country?.id);
      this.primaryContact.get('fax').get('countryId').value ??
        this.primaryContact.get('fax').get('countryId').setValue(country?.id);
      this.ref.detectChanges();
    }
  }

  compareFun(item1, item2) {
    return item1 && item2 ? item1.id === item2.id : item1 === item2;
  }

  get industryTypeIds() {
    return this.vendorForm().get('industryTypeIds');
  }
  get industrySubTypeIds() {
    return this.vendorForm().get('industrySubTypeIds');
  }
  get keywords() {
    return this.vendorForm().get('keywords');
  }
  get productCategoryIds() {
    return this.vendorForm().get('productCategoryIds');
  }

  get productTypesIds() {
    return this.vendorForm().get('productTypeIds');
  }

  toggleType(value) {
    this.isImportExport.setValue(value);
  }

  get isImportExport() {
    return this.vendorForm().get('isImportExport');
  }

  get businessLine() {
    return this.vendorForm().get('businessLine');
  }
  get logoImage() {
    return this.vendorForm().get('relationAccountDetail').get('businessLogo');
  }
  get addressCountry() {
    return this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .get('addressCountry');
  }
  get address() {
    return this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      
  }

  loadPort() {
    this.containerService.Get_All_ports();
  }

  loadKeywords(searchString?: string) {
    this.businessAccountService
      .getAllKeywords(searchString)
      .subscribe((data) => {
        this.keywordsList = data;
      });
  }

  loadEmployees() {
    this.businessAccountService.employeesList.forEach((e) => {
      this.businessAccounts.push({
        //firstName display bz username getting null
        label: e.firstName,
        value: e.id,
      });
    });
  }

  loadCitiesByCountry(id: any) {
    const x = Number(id);
    this.businessAccountService.getCityByCountry(x).subscribe((data) => {
      data.forEach((c) => {
        this.city.push(c);
      });
    });
  }

  selectIndustryTypeIds(event: any) { }

  addBranchLineItem() {
    const branchForm = this.vendorFormsService.branchDetailForm();
    branchForm.patchValue(this.primaryContact.value);
    branchForm.get('id').setValue(null);
    this.businessAddress.push(branchForm);
  }
  deleteBranchLineItem(i) {
    this.businessAddress.removeAt(i);
  }

  removeImage() {
    this.logoImage.setValue('');
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files[0]);
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles([imgfile]);
      this.logoImage.setValue(res.data[0]?.media_url);
    } catch (err: any) {
      this.toastr.error(err?.error?.message || 'Error uploading file');
    }
  }

  get businessAddress() {
    return this.vendorForm()
      .get('relationAccountDetail')
      .get('branchDetails') as UntypedFormArray;
  }
  get primaryContact() {
    return this.vendorForm().get('relationAccountDetail').get('primaryContact');
  }
  get notes() {
    return this.vendorForm().get('notes') as UntypedFormArray;
  }

  get reminders() {
    return this.vendorForm().get('reminders') as UntypedFormArray;
  }

  openNoteDialog() {
    this.dialog.open(NoteDialogComponent, {
      width: '60%',
      data: {
        type: 'note',
        relationAccountDetail: this.vendorForm().get('relationAccountDetail').value,
        assignedSalesId: this.vendorForm().get('salesRepId').value,
        notes: this.notes,
        relationStatusId: this.vendorForm().get('relationStatusId').value,
        businessCategory: this.vendorForm().value.businessCategory,
        id: this.vendorForm().get('id').value,
      },
    });
  }
 

  disableBusinessDetail() {
    this.vendorForm()
      .get('relationAccountDetail')
      .get('name')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('taxId')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('gst')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('panCard')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('einNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('ssnNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('itinNumber')
      .disable({ onlySelf: true, emitEvent: false });
    this.isEnabled = true;
  }

  clear() {
    this.vendorForm().get('relationAccountDetail').reset();
    this.vendorForm()
      .get('relationAccountDetail')
      .get('name')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .get('address')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('primaryContact')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('taxId')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('gst')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('panCard')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('einNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('ssnNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.vendorForm()
      .get('relationAccountDetail')
      .get('itinNumber')
      .enable({ onlySelf: true, emitEvent: false });
    this.isEnabled = false;
    this.emitClearBusinessAccount.emit(undefined as any);
  }

  sendInvite() {
    this.vendorForm()
      .get('sendInvite')
      .setValue(!this.vendorForm().get('sendInvite').value);
    if (this.vendorForm().get('sendInvite').value == true) {
      let inviteDetail = {
        invitedTo: this.vendorForm().get('relationAccountDetail').get('name')
          .value,
        email: this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('email').value,
        phone: this.vendorForm()
          .get('relationAccountDetail')
          .get('primaryContact')
          .get('phone').value,
        inviteType: 'RELATION',
        inviteTypeReferenceId: this.vendorForm().get('id').value,
        redirectType: 'HOME',
        businessAccountToId:
          this.vendorForm().get('relationAccountDetail')?.get('id')?.value ||
          null,
      };
      if (this.router.url.includes('edit')) {
        this.authService.sendInvite(inviteDetail).subscribe((res) => {
          this.vendorForm().get('invite').patchValue(res);
        });
      }
    }
  }

  getLabel() {
    if (this.vendorForm().get('businessCategory').value == 'CUSTOMER') {
      return 'Customer';
    } else if (this.vendorForm().get('businessCategory').value == 'LEAD') {
      return 'Lead';
    } else if (this.vendorForm().get('businessCategory').value == 'PROSPECT') {
      return 'Prospect';
    } else {
      return 'Vendor';
    }
  }


  getConfigurationType(): string {
    const businessCategory = this.vendorForm().get('businessCategory')?.value;
    if (businessCategory === 'CUSTOMER') {
      return 'CUSTOMER';
    } else if (businessCategory === 'LEAD') {
      return 'LEAD';
    } else if (businessCategory === 'PROSPECT') {
      return 'PROSPECT';
    } else {
      return 'VENDOR';
    }
  }

  /**
   * Collects all attribute values from all sections in the business entity configuration
   * and populates the relationAccountAttributeValues FormArray
   */
  collectAllAttributeValues(): void {
    const businessEntityConfigComponent = this.businessEntityConfigComponent();
    if (!businessEntityConfigComponent?.configurationForm) {
      return;
    }

    const configurationForm = businessEntityConfigComponent.configurationForm;
    const sections = configurationForm.get('sections') as UntypedFormArray;
    const relationAccountAttributeValues = this.vendorForm().get('relationAccountAttributeValues') as UntypedFormArray;

    // Clear existing values
    while (relationAccountAttributeValues.length !== 0) {
      relationAccountAttributeValues.removeAt(0);
    }

    // Collect all attribute forms from all sections
    sections.controls.forEach((section: UntypedFormGroup) => {
      const attributes = section.get('attributes') as UntypedFormArray;
      attributes.controls.forEach((attribute: UntypedFormGroup) => {
        const attributeForm = this.systemConfigFormsService.createAttributeConfigForm();
        attributeForm.patchValue(attribute.getRawValue());
        attributeForm.get('id').setValue(null);
        relationAccountAttributeValues.push(attributeForm);
      });
    });
  }

}
