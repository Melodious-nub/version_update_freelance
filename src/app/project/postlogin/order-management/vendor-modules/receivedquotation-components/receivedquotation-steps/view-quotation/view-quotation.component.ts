import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-view-quotation',
  templateUrl: './view-quotation.component.html',
  styleUrls: ['./view-quotation.component.scss'],
})
export class ViewQuotationComponent implements OnInit {
    public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];
  
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map2 = false;
    this.map1 = false;
    this.map3 = false;
  }

  map2 = false;
  map1 = false;
  map3 = false;
  // @Input() componentUoms: any;
  currentBusinessAccount: any;
  @Input() recvQuotationForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  quotationFile = null;
  constructor(
    public fb: UntypedFormBuilder,
    public formsService: FormsService,
    public orderFormsService: OrderFormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService
  ) {}

  async ngOnInit() {
    this.businessAccountService.Get_All_Vendors();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
  }

  get productPackages() {
    return this.recvQuotationForm.get('productPackages') as UntypedFormArray;
  }

  get messages() {
    return this.recvQuotationForm.get('messages') as UntypedFormArray;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  openMap(type: any) {
    if (type == 1) {
      this.map1 = !this.map1;
    }
    if (type == 2) {
      this.map2 = !this.map2;
    }
    if (type == 3) {
      this.map3 = !this.map3;
    }
  }

  deleteProductPackage(i: any) {
    this.productPackages.removeAt(i);
  }

  toggleType(value: any) {
    this.recvQuotationForm.get('importLocalType').setValue(value);
  }

  get importLocalType() {
    return this.recvQuotationForm.get('importLocalType');
  }

  get requestFromAddress() {
    return (
      this.currentBusinessAccount?.primaryContact?.address?.addressCity +
      ',' +
      this.currentBusinessAccount?.primaryContact?.address?.addressState +
      ',' +
      this.currentBusinessAccount?.primaryContact?.address?.addressCountry +
      ',' +
      this.currentBusinessAccount?.primaryContact?.address?.addressZipCode
    );
  }

  get requestToAddress() {
    const item = this.businessAccountService.vendorList.find(
      (item) =>
        item.relationAccountId ==
        this.recvQuotationForm.get('requestFrom').get('id').value
    );
    if (!item || !item.address) {
      return '';
    }
    const addressFields = [
      item.address.addressLine,
      item.address.addressCity,
      item.address.addressState,
      item.address.addressZipCode,
      item.address.addressCountry,
    ].filter((field) => !!field);
    return addressFields.join(',');
  }
  // end

  get noteId() {
    return this.recvQuotationForm.get('noteId');
  }

  get media_url_ids() {
    return this.recvQuotationForm.get('media_url_ids');
  }

  get media_urls() {
    return this.recvQuotationForm.get('media_urls');
  }

 
}
