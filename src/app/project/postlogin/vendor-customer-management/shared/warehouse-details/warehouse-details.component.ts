
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MapDialogComponent } from 'src/app/shared/dialogs/map-dialog/map-dialog.component';
import { VendorFormsService } from '../../service/vendor-forms.service';

@Component({
  selector: 'app-warehouse-details',
  templateUrl: './warehouse-details.component.html',
  styleUrls: ['./warehouse-details.component.scss'],
})
export class WarehouseDetailsComponent implements OnInit {
  @Input('vendorForm') vendorForm: any;
  @Input('isCustomer') isCustomer: any;
  @Input('countries') countries: any;
  constructor(
    public toastr: ToastrService,
    public customerService: ApiService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    public vendorFormsService: VendorFormsService
  ) {}

  ngOnInit(): void {}

  get wareHouseDetails() {
    return this.vendorForm.get('warehouses') as UntypedFormArray;
  }
  get contactDetails() {
    return this.vendorForm.get('contacts') as UntypedFormArray;
  }
  get primaryContact() {
    return this.vendorForm
      .get('relationAccountDetail')
      .get('primaryContact')
  }
  get purchaseDepartmentPricings() {
    return this.vendorForm.get('purchaseDepartmentPricings') as UntypedFormArray;
  }

  addWareHouseItem() {
    if (this.wareHouseDetails.invalid) {
      this.wareHouseDetails.markAllAsTouched();
      this.toastr.error('Please fill required details');
      return;
    } else {
      const warehouseForm = this.vendorFormsService.warehouseDetailForm()
      warehouseForm.patchValue(this.primaryContact.value)
      warehouseForm.get('id').setValue(null)
      this.wareHouseDetails.push(warehouseForm);
    }
  }

  addContactLineItem() {
    if (this.contactDetails.invalid) {
      this.contactDetails.markAllAsTouched();
      this.toastr.error('Please fill required details');
      return;
    } else {
      const contactDetailForm = this.vendorFormsService.contactDetailForm()
      contactDetailForm.patchValue(this.primaryContact.value)
      contactDetailForm.get('id').setValue(null)
      this.contactDetails.push(contactDetailForm);
    }
  }

  addPurchasePricingItem() {
    if (this.purchaseDepartmentPricings.invalid) {
      this.purchaseDepartmentPricings.markAllAsTouched();
      this.toastr.error('Please fill required details');
      return;
    } else {
      this.purchaseDepartmentPricings.push(
        this.vendorFormsService.purchaseDepartmentPricingForm()
      );
    }
  }

  copyLink(mapLinkControl:any) {
    this.dialog.open(MapDialogComponent, {
      width: '35%',
      height: '60%',
      data:{mapLinkControl:mapLinkControl}
    });
  }

  deleteWarehouseItem(i) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.wareHouseDetails.removeAt(i);
        }
      });
  }

  deleteContactLineItem(event) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.contactDetails.removeAt(event);
        }
      });
  }

  deletePurchasePricingItem(event) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.purchaseDepartmentPricings.removeAt(event);
        }
      });
  }

  customSearchFn(term: string, item: any) {
    if(term.toLowerCase().includes('us')) {
      term='United states'
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

}
