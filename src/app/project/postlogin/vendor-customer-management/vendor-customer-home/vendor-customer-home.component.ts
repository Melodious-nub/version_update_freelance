import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { VendorFormsService } from '../service/vendor-forms.service';
import { UntypedFormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAccountService } from '../../business-account/business-account.service';

import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { VendorCustomerService } from '../service/vendor-customer.service';
import { AuthService } from 'src/app/service/auth.service';
import { VendorDetailsComponent } from './vendor-customer-details/vendor-customer-details.component';
import { SystemConfigFormsService } from '../../system-config-management/service/system-config-forms.service';
import { VendorManagementComponent } from '../../order-management/vendor-modules/vendor-management.component';
import { CustomerManagementComponent } from '../../order-management/customer-modules/customer-management.component';
import { WarehouseDetailsComponent } from '../shared/warehouse-details/warehouse-details.component';
import { DadyinTabComponent } from '../../../../shared/widgets/dadyin-tab/dadyin-tab.component';
import { MatTooltip } from '@angular/material/tooltip';

import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
@Component({
    selector: 'app-vendor-customer-home',
    templateUrl: './vendor-customer-home.component.html',
    styleUrls: ['./vendor-customer-home.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatTooltip,
        FormsModule,
        ReactiveFormsModule,
        DadyinTabComponent,
        VendorDetailsComponent,
        WarehouseDetailsComponent,
        CustomerManagementComponent,
        VendorManagementComponent
    ]
})
export class AddEditVendorComponent implements OnInit {
  public currentMainIndex: number = 0;

  public vendorForm: any;
  public vendorData: any = [];
  pageIndex: any = 0;
  pageS = 100;
  sortQuery: any = 'id,desc';
  mainTab: Array<any>;
  countries: any = [];
  industrySubTypes: any[] = [];
  isSendInvite: Boolean = false;
  isShowInvite: Boolean = true;
  @ViewChild(VendorDetailsComponent) vendorDetailsComponent: VendorDetailsComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: ApiService,
    public toastr: ToastrService,
    public vendorFormService: VendorFormsService,
    private vendorCustomerService: VendorCustomerService,
    public dialog: MatDialog,
    public businessAccountService: BusinessAccountService,
    private authService: AuthService,
    public systemConfigFormsService: SystemConfigFormsService
  ) {
    this.vendorForm = this.vendorFormService.createVendorForm();
 
  }

  ngOnInit(): void {
    this.service.getAllMetaDatas();
    this.service.Get_Product_Types();
    if (this.isCustomer || this.isLead || this.isProspect) {
      this.vendorForm.get('businessLine').setValue('RETAILER');
      if (this.isLead) {
        this.vendorForm.get('businessCategory').setValue('LEAD');
      } else if (this.isProspect) {
        this.vendorForm.get('businessCategory').setValue('PROSPECT');
      } else {
        this.vendorForm.get('businessCategory').setValue('CUSTOMER');
      }
      this.mainTab = [
        {
          id: 1,
          name:
            (this.isCustomer
              ? 'Customer '
              : this.isLead
                ? 'Lead '
                : this.isProspect
                  ? 'Prospect '
                  : ' ') + 'Details',
          index: 0,
        },
        {
          id: 2,
          name: 'Warehouse Details',
          index: 1,
        },
        {
          id: 3,
          name: 'Account Details',
          index: 2,
        },
        {
          id: 4,
          name: 'Transaction Details',
          index: 3,
        },
      ];
    } else {
      this.vendorForm.get('businessCategory').setValue('VENDOR');
      this.mainTab = [
        {
          id: 1,
          name: 'Vendor Details',
          index: 0,
        },
        {
          id: 2,
          name: 'Warehouse Details',
          index: 1,
        },
        {
          id: 3,
          name: 'Account Details',
          index: 2,
        },
        {
          id: 4,
          name: 'Transaction Details',
          index: 3,
        },
      ];
    }
    if (this.route.snapshot.params.id) {
      this.vendorBinding();
    }

    this.loadCountry();
  }

  loadCountry() {
    this.businessAccountService.getCountry().subscribe((data) => {
      this.countries = data;
    });
  }

  get industryTypeIds() {
    return this.vendorForm.get('industryTypeIds');
  }

  get industrySubTypeIds() {
    return this.vendorForm.get('industrySubTypeIds');
  }

  async vendorBinding() {
    try {
      const data = await this.service
        .Get_Single_customer(this.route.snapshot.params.id)
        .toPromise();
      const contacts = this.vendorForm.get('contacts') as UntypedFormArray;
      data?.contacts?.forEach((ele) => {
        const warehouseForm = this.vendorFormService.contactDetailForm();
        contacts.push(warehouseForm);
      });

      const warehouses = this.vendorForm.get('warehouses') as UntypedFormArray;

      data?.warehouses?.forEach((ele) => {
        const warehouseForm = this.vendorFormService.warehouseDetailForm();
        warehouses.push(warehouseForm);
      });

      const purchaseDepartmentPricings = this.vendorForm.get(
        'purchaseDepartmentPricings'
      ) as UntypedFormArray;

      data?.purchaseDepartmentPricings?.forEach((ele) => {
        const purchaseDepartmentPricingForm =
          this.vendorFormService.purchaseDepartmentPricingForm();
        purchaseDepartmentPricings.push(purchaseDepartmentPricingForm);
      });

      const branches = this.vendorForm
        .get('relationAccountDetail')
        .get('branchDetails') as UntypedFormArray;

      data?.relationAccountDetail?.branchDetails?.forEach((ele) => {
        const branchForm = this.vendorFormService.branchDetailForm();
        branches.push(branchForm);
      });

      const notes = this.vendorForm.get('notes') as UntypedFormArray;

      data?.notes?.forEach((ele) => {
        const notesForm = this.vendorFormService.noteForm();
        notes.push(notesForm);
      });

      const reminders = this.vendorForm.get('reminders') as UntypedFormArray;

      data?.reminders?.forEach((ele) => {
        const remindersForm = this.vendorFormService.reminderForm();
        reminders.push(remindersForm);
      });

      const relationAccountAttributeValues = this.vendorForm.get('relationAccountAttributeValues') as UntypedFormArray;
      data?.relationAccountAttributeValues?.forEach((ele) => {
        const attributeForm = this.systemConfigFormsService.createAttributeConfigForm();
        attributeForm.patchValue(ele);
        relationAccountAttributeValues.push(attributeForm);
      });

      this.vendorForm.patchValue(data);
      console.log(this.vendorForm.value);
      // Populate attribute values from relation account after loading vendor data
      if (this.vendorDetailsComponent) {
        this.vendorDetailsComponent.populateAttributeValuesFromRelationAccount();
      }
    } catch (err: any) {
      if (err?.status === 404) {
        this.toastr.warning('Account Not Found');
        this.navigate();
      } else {
        this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
      }
    }
  }

  saveCustomer() {
    // Collect all attribute values from business entity configuration before saving
    if (this.vendorDetailsComponent && (this.isCustomer || this.isLead || this.isProspect)) {
      this.vendorDetailsComponent.collectAllAttributeValues();
    }

    let req = this.vendorForm.getRawValue();

    console.log(req);

    if (req?.invite?.id == null) { 
      delete req.invite;
    }
    this.service.saveCustomerDetail(req).subscribe(
      () => {
        if (this.route.snapshot.params.id) {
          this.toastr.success('Details Updated Successfully.');
        } else {
          this.toastr.success('Details Added Successfully.');
        }
        if (this.isCustomer || this.isLead || this.isProspect) {
          this.businessAccountService.Get_All_Customers_Non_Cache();
        } else {
          this.businessAccountService.Get_All_Vendors_Non_Cache();
          this.businessAccountService.Get_All_Exporter_Vendors_Non_Cache();
        }
        this.navigate();
      },
      (err: any) => {
        this.toastr.error(err?.error?.userMessage ?? 'Error Occurred');
      }
    );
  }

  get headingVendorName() {
    return this.vendorForm.get('relationAccountDetail').get('name').value;
  }

  private get listBasePath(): string {
    return this.router.url.includes('users-management') ? '/home/users-management' : '/home';
  }

  /** Path segment for leads list: 'leads' under users-management, 'lead' under legacy home */
  private get leadsListPath(): string {
    return this.router.url.includes('users-management') ? 'leads' : 'lead';
  }

  /** Path segment for customers list: 'customers' under users-management, 'customer' under legacy home */
  private get customersListPath(): string {
    return this.router.url.includes('users-management') ? 'customers' : 'customer';
  }

  /** Path segment for prospects list: 'prospects' under users-management, 'prospect' under legacy home */
  private get prospectsListPath(): string {
    return this.router.url.includes('users-management') ? 'prospects' : 'prospect';
  }

  navigate() {
    if (this.isCustomer || this.isLead || this.isProspect) {
      if (this.vendorForm.get('businessCategory').value == 'CUSTOMER') {
        this.router.navigateByUrl(`${this.listBasePath}/${this.customersListPath}/list?currentStepIndex=1`);
      } else if (this.vendorForm.get('businessCategory').value == 'LEAD') {
        this.router.navigateByUrl(`${this.listBasePath}/${this.leadsListPath}/list?currentStepIndex=2`);
      } else if (this.vendorForm.get('businessCategory').value == 'PROSPECT') {
        this.router.navigateByUrl(`${this.listBasePath}/${this.prospectsListPath}/list?currentStepIndex=3`);
      } else {
        this.router.navigate([this.listBasePath + '/' + this.customersListPath]);
      }
    } else {
      this.router.navigate([`${this.listBasePath}/vendor`]);
    }
  }

  action(event) {
    this.currentMainIndex = event.index;
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteRelation();
        }
      });
  }

  async deleteRelation() {
    try {
      const businessAccountId: any = this.route.snapshot.params.id;
      const data = await this.businessAccountService
        .deleteRelationAccount(businessAccountId)
        .toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate();
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  get isCustomer() {
    if (window.location.href.includes('customer')) {
      return true;
    } else {
      return false;
    }
  }

  get isVendor() {
    if (window.location.href.includes('vendor')) {
      return true;
    } else {
      return false;
    }
  }

  get isLead() {
    if (window.location.href.includes('lead')) {
      return true;
    } else {
      return false;
    }
  }

  get isProspect() {
    if (window.location.href.includes('prospect')) {
      return true;
    } else {
      return false;
    }
  }

  get inviteStatus() {
    return this.vendorForm.get('invite').get('status');
  }
  get relationAcceptedStatus() {
    return this.vendorForm.get('relationAcceptedStatus');
  }
  get reverseRelation() {
    return this.vendorForm.get('reverseRelation');
  }
  get verifiedStatus() {
    return this.vendorForm.get('relationAccountDetail')?.get('verifiedStatus');
  }
  get inviteCreatedDate() {
    return this.vendorForm.get('invite')?.get('audit')?.get('createdDate');
  }
  get businessAccountId() {
    return this.vendorForm.get('relationAccountDetail').value?.id;
  }

  checkInviteDate(date: any) {
    if (!date) {
      return false;
    }
    const today = new Date();
    const inputDateObj = new Date(date);

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = today.getTime() - inputDateObj.getTime();

    // Convert milliseconds to days
    const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

    // Check if the difference is less than 30 days
    return differenceInDays > 30 ? true : false;
  }

  resendInvite() {
    let inviteDetail = {
      invitedTo: this.vendorForm.get('relationAccountDetail').get('name').value,
      email: this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('email').value,
      phone: this.vendorForm
        .get('relationAccountDetail')
        .get('primaryContact')
        .get('phone').value,
      inviteType: 'RELATION',
      inviteTypeReferenceId: this.vendorForm.get('id').value,
      redirectType: 'HOME',
      businessAccountToId:
        this.vendorForm.get('relationAccountDetail')?.get('id')?.value || null,
    };
    if (this.router.url.includes('edit')) {
      this.authService.sendInvite(inviteDetail).subscribe((res) => {
        this.vendorForm.get('invite').patchValue(res);
      });
    }
  }

  businessAccountSelected() {
    this.isShowInvite = false;
  }

  async updateRelationStatus(status: any) {
    try {
      const data = await this.businessAccountService
        .updateRelationStatus(this.route.snapshot.params.id, status)
        .toPromise();
      this.vendorBinding();
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async updateCategory() {
    let newCategory = '';
    if (this.isLead) newCategory = 'PROSPECT';
    if (this.isProspect) newCategory = 'CUSTOMER';
    try {
      const data = await this.vendorCustomerService
        .updateLeadField(
          this.route.snapshot.params.id,
          'BUSINESS_CATEGORY',
          newCategory
        )
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.error(data?.errorMessage);
        return;
      }
      this.toastr.success(data?.message);
      const base = this.router.url.includes('users-management') ? '/home/users-management' : '/home';
      if (this.isLead) {
        this.router.navigateByUrl(
          `${base}/prospects/edit/${this.route.snapshot.params.id}`
        );
      } else {
        this.router.navigateByUrl(
          `${base}/customers/edit/${this.route.snapshot.params.id}`
        );
      }
    } catch (err: any) {
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }

  businessAccountCleared() {
    this.isShowInvite = true;
  }
}
