import { Component, Input, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { OrderFormsService } from 'src/app/project/postlogin/order-management/service/order-forms.service';
import { ApiService } from 'src/app/service/api.service';
import { environment } from 'src/environments/environment';
import { NumberFormatterPipe } from '../../pipes/number-formatter.pipe';
import { DadyinSelectComponent } from '../../widgets/dadyin-select/dadyin-select.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-order-transaction-packages',
    templateUrl: './order-transaction-packages.component.html',
    styleUrls: ['./order-transaction-packages.component.scss'],
    imports: [
        DadyinButtonComponent,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        NgClass,
        ExtendedModule,
        NgbTooltip,
        MatTooltip,
        DadyinSelectComponent,
        DecimalPipe,
        NumberFormatterPipe
    ]
})
export class OrderTransactionPackagesComponent implements OnInit {
  orderFormService = inject(OrderFormsService);
  businessAccountService = inject(BusinessAccountService);
  toastr = inject(ToastrService);
  apiService = inject(ApiService);
  router = inject(Router);

  @Input() tierPriceView: boolean = false;
  @Input() productPackages: any;
  @Input() isEditable: any;
  @Input() orderForm: any;
  @Input() productsList;
  @Input() type: string; // 'order' or 'quotation'
  @Output() calculate = new EventEmitter();
  @Output() getProducts = new EventEmitter();
  @Output() generatePoFromPdf = new EventEmitter();
  private searchSubject = new Subject<string>();

  @Input() displayedColumns = [];

  @Input() orderFile: any;

  packages: string[] = ['BOX', 'BALE', 'PALLET', 'BUNDLE', 'UNIT'];

  imgUrl = environment.imgUrl;
  hoveredElement: any = null;
  loading = false;
  salesData: any[] = [];
  avgQty = 0;
  avgSales = 0;
  avgPrice = 0;
  customerCount = 0;
  tooltipPosition = { top: 0, left: 0 };
  private hoverTimeout: any = null;
  
  // Tooltip hover management
  private salesHideTimeout: any = null;
  private currentSalesTooltipRef: any = null;
  private isMouseOverSalesTooltip: boolean = false;
  private salesTooltipMouseEnterHandler: any = null;
  private salesTooltipMouseLeaveHandler: any = null;
  private currentSalesTooltipElement: HTMLElement = null;
  
  // QOH specific properties
  purchaseHoveredElement: any = null;
  purchaseLoading = false;
  private qohHoverTimeout: any = null;
  
  // Purchase tooltip hover management
  private purchaseHideTimeout: any = null;
  private currentPurchaseTooltipRef: any = null;
  private isMouseOverPurchaseTooltip: boolean = false;
  private purchaseTooltipMouseEnterHandler: any = null;
  private purchaseTooltipMouseLeaveHandler: any = null;
  private currentPurchaseTooltipElement: HTMLElement = null;

  ngOnInit(): void {
    console.log(this.router.url);
    this.searchSubject.pipe(debounceTime(500)).subscribe((value) => {
      this.getProducts.emit(value);
    });
    
    // Handle window resize to reposition tooltip
    window.addEventListener('resize', () => {
      if (this.hoveredElement) {
        this.closeSalesTooltip();
      }
      if (this.purchaseHoveredElement) {
        this.closePurchaseTooltip();
      }
    });
  }

  get buyingType() {
    return this.orderForm.get('buyingType');
  }
  get status() {
    return this.orderForm.get('status');
  }

  getMetricCostControl(productPackage) {
    const ctrl = productPackage.get('metricCost').get('attributeValue');
    const val = Number(ctrl.value);

    if (!isNaN(val) && val % 1 !== 0) {
      // keep 2 decimals
      let roundedVal = Math.ceil(val * 100) / 100;
      ctrl.setValue(roundedVal.toFixed(2), { emitEvent: false });
    }

    return ctrl;
    // return productPackage.get('metricCost').get('attributeValue');
  }
  getMetricCostControlUom(productPackage) {
    return productPackage.get('metricCost').get('userConversionUom');
  }

  getMetricCost(productPackage) {
    return (
      productPackage.get('metricCost').value?.attributeValue +
      ' ' +
      productPackage.get('metricCost').value?.userConversionUom
    );
  }

  changeCostByUser(productPackageForm) {
    productPackageForm.get('isCostInputByUser').patchValue(true);
    this.calculateValues();
  }

  changeQuantityInOrder(i) {
    if (!this.productPackages.controls[i].get('productId').value) {
      return;
    }
    if (!this.isEditable) {
      return;
    }
    const quantityControl = this.productPackages.controls[i].get('quantity');
    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value);
    this.calculateValues();
  }

  isQuantityLessThanContainerMqo(i) {
    const productControl = this.productPackages.controls[i];
    const quantityControl = this.productPackages.controls[i].get('quantity');
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      ) &&
      quantityControl.value < productControl.value.productDetails?.containerMqo
    ) {
      return (
        'Quantity is less than container MQO ' +
        productControl.value.productDetails?.containerMqo
      );
    } else {
      return '';
    }
  }

  updateProductQuantityInOrder(i, quantity) {
    if (!this.productPackages.controls[i].get('productId').value) {
      return;
    }
    if (!this.isEditable) {
      return;
    }
    const quantityControl = this.productPackages.controls[i].get('quantity');

    if (quantityControl.value < 1) {
      quantityControl.patchValue(1);
      return;
    }
    quantityControl.patchValue(quantityControl.value + quantity);
    this.calculateValues();
  }

  addProductPackage() {
    if (this.type == 'quotation' && this.status.value != 'DRAFT') {
      this.toastr.warning('You can add product in Draft status only');
      return;
    }
    const productPackageForm = this.orderFormService.productPackageForm();
    productPackageForm.get('quantity').patchValue(1);
    this.productPackages.push(productPackageForm);
  }

  deleteProductPackage(i: any) {
    if (this.type == 'quotation' && this.status.value != 'DRAFT') {
      this.toastr.warning('You can delete product in Draft status only');
      return;
    }
    this.productPackages.removeAt(i);
    this.calculateValues();
  }

  calculateValues() {
    this.calculate.emit(null);
  }

  onChange(item, productPackage: UntypedFormGroup) {
    productPackage.patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('productDetails').patchValue(item, {
      emitEvent: false,
      onlySelf: true,
    });
    if (
      ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
        this.buyingType?.value
      )
    ) {
      if (item?.containerMqo) {
        productPackage.get('quantity').patchValue(item?.containerMqo);
      } else {
        productPackage.get('quantity').patchValue(1);
      }
    } else {
      productPackage.get('quantity').patchValue(1);
    }
    productPackage.get('id').patchValue(null);
    productPackage.get('productId').patchValue(item.id);
    productPackage.get('packageId').patchValue(item.skuPackageId);
    console.log(item?.productMetaBusinessAccountId + " " +item?.productBusinessAccountId )
    console.log(productPackage.get('productDetails').get('productMetaBusinessAccountId'))
    productPackage.get('productDetails').get('productMetaBusinessAccountId').setValue(item?.productMetaBusinessAccountId);
    productPackage.get('productDetails').get('productBusinessAccountId').setValue(item?.productBusinessAccountId);
    console.log(productPackage.get('productDetails').get('productMetaBusinessAccountId').value + " " + productPackage.get('productDetails').get('productBusinessAccountId').value)
    this.calculateValues();
  }

  getProductsList(event) {
    this.searchSubject.next(event);
  }

  onChangePercentage(control: any, type) {
    const value = control.value;
    if (value > 100) {
      this.toastr.warning('Percentage cannot be greater than 100');
      control.patchValue(100);
    } else if (value < 0) {
      this.toastr.warning('Percentage cannot be less than 0');
      control.patchValue(0);
    }
    this.orderForm.get(type).setValue('PERCENTAGE');
    this.checkIfNullOrEmpty();
    this.calculateValues();
  }

  onChangeCost(control: any, type) {
    this.orderForm.get(type).setValue('COST');
    this.checkIfNullOrEmpty();
    this.calculateValues();
  }

  checkIfNullOrEmpty() {
    if (!this.orderForm.get('discountType').value) {
      this.orderForm.get('discountType').setValue('PERCENTAGE');
    }

    if (!this.orderForm.get('salesTaxType').value) {
      this.orderForm.get('salesTaxType').setValue('PERCENTAGE');
    }
  }

  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

  onChangeDeliveryCost() {
    this.orderForm.get('deliveryCostInputByUser').patchValue(true);
    this.calculateValues();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior
  }
  fileSelected(event: any, type: string, fileInput: HTMLInputElement) {
    event.preventDefault(); // Prevent default behavior
    if (type === 'drop') {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.generatePoFromPdf.emit(files[0]);
        fileInput.value = ''; // Clear the file input after selection
      }
    } else {
      const files = fileInput.files;
      if (files && files.length > 0) {
        this.generatePoFromPdf.emit(files[0]);
        fileInput.value = ''; // Clear the file input after selection
      }
    }
  }

  onPaste(event) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            this.generatePoFromPdf.emit(pastedFile);
          }
        }
      }
    }
  }

  deleteFile(file, i) {
    const oldmediaurls = this.media_urls.value ?? [];
    this.apiService.deleteFiles(file).then((res: any) => {
      oldmediaurls.splice(i, 1);
      this.media_urls.patchValue(oldmediaurls);
    });
  }
  uploadFiles(files: any, fileinput: HTMLInputElement) {
    this.apiService.uploadFiles(files).then(
      (res: any) => {
        const resp: any = res;
        const media_url_ids: any[] = [];
        resp.data.forEach((element) => {
          media_url_ids.push(element.id);
        });
        const oldmediaurlids = this.media_url_ids.value ?? [];
        const oldmediaurls = this.media_urls.value ?? [];
        const media_url_merge_ids = [...oldmediaurlids, ...media_url_ids];
        const media_urls = [...oldmediaurls, ...resp.data];
        this.media_urls.patchValue(media_urls);
        this.media_url_ids.patchValue(media_url_merge_ids);
        fileinput.value = ''; // Clear the file input after selection
      },
      (err) => {
        fileinput.value = ''; // Clear the file input after selection
      }
    );
  }
  get noteId() {
    return this.orderForm.get('noteTemplate').get('id');
  }

  get media_url_ids() {
    return this.orderForm.get('media_url_ids');
  }

  get media_urls() {
    return this.orderForm.get('media_urls');
  }

  viewFile(name: any) {
    const item = this.media_urls.value.find((obj) =>
      obj.media_url.includes(name)
    );
    if (item) {
      window.open(environment.imgUrl + item.media_url, '_blank');
    }
  }

  getLabel() {
    return this.router.url.includes('vendor') ? 'Vendor' : 'Customer'
  }

  showPopover(productPackage: any, _event?: MouseEvent, tooltipRef?: any) {
    // Close any existing sales tooltip first
    if (this.currentSalesTooltipRef && this.currentSalesTooltipRef !== tooltipRef) {
      this.currentSalesTooltipRef.close();
    }
    
    if (this.salesHideTimeout) {
      clearTimeout(this.salesHideTimeout);
      this.salesHideTimeout = null;
    }
    
    // Remove old event listeners
    this.removeSalesTooltipHandlers();
    
    const productId = productPackage.get('productId').value;
    const businessAccountId = this.businessAccountService.currentBusinessAccountId;
    
    if (!productId || !businessAccountId) {
      return;
    }

    this.currentSalesTooltipRef = tooltipRef;
    this.isMouseOverSalesTooltip = false;
    this.hoveredElement = productPackage;
    this.loading = true;
    this.salesData = [];
    
    if (tooltipRef) {
      tooltipRef.open();
    }
    
    // Attach handlers to tooltip when it appears
    this.attachSalesTooltipHandlers();
    
    // Wait for 2 seconds before making API call
    this.hoverTimeout = setTimeout(() => {
      // Double check if still hovering the same element
      if (this.hoveredElement === productPackage) {
        this.loading = true;
        this.fetchPreviousSalesData(productId, businessAccountId);
      }
    }, 2000);
  }

  hidePopover(tooltipRef?: any) {
    if (this.salesHideTimeout) clearTimeout(this.salesHideTimeout);
    
    // Give more time to move cursor to tooltip
    this.salesHideTimeout = setTimeout(() => {
      // Only close if mouse is not over tooltip
      if (!this.isMouseOverSalesTooltip) {
        this.closeSalesTooltip();
      }
    }, 300);
  }
  
  private attachSalesTooltipHandlers() {
    let attempts = 0;
    const maxAttempts = 5;
    
    const tryAttach = () => {
      attempts++;
      const tooltip = document.querySelector('.tooltip .prev-sales-tooltip') || 
                     document.querySelector('.prev-sales-tooltip') ||
                     document.querySelector('.tooltip .custom-tooltip') ||
                     document.querySelector('.tooltip');
      
      if (tooltip && !this.salesTooltipMouseEnterHandler) {
        this.currentSalesTooltipElement = tooltip as HTMLElement;
        
        this.salesTooltipMouseEnterHandler = () => {
          this.isMouseOverSalesTooltip = true;
          if (this.salesHideTimeout) {
            clearTimeout(this.salesHideTimeout);
            this.salesHideTimeout = null;
          }
        };
        
        this.salesTooltipMouseLeaveHandler = () => {
          this.isMouseOverSalesTooltip = false;
          this.closeSalesTooltip();
        };
        
        tooltip.addEventListener('mouseenter', this.salesTooltipMouseEnterHandler);
        tooltip.addEventListener('mouseleave', this.salesTooltipMouseLeaveHandler);
      } else if (!tooltip && !this.salesTooltipMouseEnterHandler && attempts < maxAttempts) {
        setTimeout(tryAttach, 100);
      }
    };
    
    tryAttach();
  }

  private removeSalesTooltipHandlers() {
    if (this.currentSalesTooltipElement && this.salesTooltipMouseEnterHandler) {
      this.currentSalesTooltipElement.removeEventListener('mouseenter', this.salesTooltipMouseEnterHandler);
      this.currentSalesTooltipElement.removeEventListener('mouseleave', this.salesTooltipMouseLeaveHandler);
    }
    this.salesTooltipMouseEnterHandler = null;
    this.salesTooltipMouseLeaveHandler = null;
    this.currentSalesTooltipElement = null;
  }

  private closeSalesTooltip() {
    if (this.salesHideTimeout) {
      clearTimeout(this.salesHideTimeout);
      this.salesHideTimeout = null;
    }
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this.isMouseOverSalesTooltip = false;
    this.removeSalesTooltipHandlers();
    this.hoveredElement = null;
    this.salesData = [];
    this.loading = false;
    if (this.currentSalesTooltipRef) {
      this.currentSalesTooltipRef.close();
      this.currentSalesTooltipRef = null;
    }
  }

  fetchPreviousSalesData(productId: number, businessAccountId: number) {
    // Set flags to prevent multiple calls
    this.loading = true;
    
    // Call the API service to fetch previous sales data
    this.apiService.getPreviousSalesData(productId, businessAccountId)
      .subscribe((response: any) => {
        this.salesData = response.salesData || [];
        this.loading = false;
      });
  }

  // QOH specific methods
  showPurchasePopover(productPackage: any, event: MouseEvent, tooltipRef?: any) {
    // Close any existing purchase tooltip first
    if (this.currentPurchaseTooltipRef && this.currentPurchaseTooltipRef !== tooltipRef) {
      this.currentPurchaseTooltipRef.close();
    }
    
    if (this.purchaseHideTimeout) {
      clearTimeout(this.purchaseHideTimeout);
      this.purchaseHideTimeout = null;
    }
    
    // Remove old event listeners
    this.removePurchaseTooltipHandlers();
    
    const productId = productPackage.get('productId').value;
    const businessAccountId = this.businessAccountService.currentBusinessAccountId;
    
    if (!productId || !businessAccountId) {
      return;
    }

    this.currentPurchaseTooltipRef = tooltipRef;
    this.isMouseOverPurchaseTooltip = false;
    this.purchaseHoveredElement = productPackage;
    this.purchaseLoading = true;
    this.salesData = [];
    
    if (tooltipRef) {
      tooltipRef.open();
    }
    
    // Attach handlers to tooltip when it appears
    this.attachPurchaseTooltipHandlers();
    
    // Add a small delay to prevent rapid hover events
    this.qohHoverTimeout = setTimeout(() => {
      this.fetchPurchaseData(productId, businessAccountId);
    }, 2000);
  }

  hidePurchasePopover(tooltipRef?: any) {
    if (this.purchaseHideTimeout) clearTimeout(this.purchaseHideTimeout);
    
    // Give more time to move cursor to tooltip
    this.purchaseHideTimeout = setTimeout(() => {
      // Only close if mouse is not over tooltip
      if (!this.isMouseOverPurchaseTooltip) {
        this.closePurchaseTooltip();
      }
    }, 300);
  }
  
  private attachPurchaseTooltipHandlers() {
    let attempts = 0;
    const maxAttempts = 5;
    
    const tryAttach = () => {
      attempts++;
      const tooltip = document.querySelector('.tooltip .prev-sales-tooltip') || 
                     document.querySelector('.prev-sales-tooltip') ||
                     document.querySelector('.tooltip .custom-tooltip') ||
                     document.querySelector('.tooltip');
      
      if (tooltip && !this.purchaseTooltipMouseEnterHandler) {
        this.currentPurchaseTooltipElement = tooltip as HTMLElement;
        
        this.purchaseTooltipMouseEnterHandler = () => {
          this.isMouseOverPurchaseTooltip = true;
          if (this.purchaseHideTimeout) {
            clearTimeout(this.purchaseHideTimeout);
            this.purchaseHideTimeout = null;
          }
        };
        
        this.purchaseTooltipMouseLeaveHandler = () => {
          this.isMouseOverPurchaseTooltip = false;
          this.closePurchaseTooltip();
        };
        
        tooltip.addEventListener('mouseenter', this.purchaseTooltipMouseEnterHandler);
        tooltip.addEventListener('mouseleave', this.purchaseTooltipMouseLeaveHandler);
      } else if (!tooltip && !this.purchaseTooltipMouseEnterHandler && attempts < maxAttempts) {
        setTimeout(tryAttach, 100);
      }
    };
    
    tryAttach();
  }

  private removePurchaseTooltipHandlers() {
    if (this.currentPurchaseTooltipElement && this.purchaseTooltipMouseEnterHandler) {
      this.currentPurchaseTooltipElement.removeEventListener('mouseenter', this.purchaseTooltipMouseEnterHandler);
      this.currentPurchaseTooltipElement.removeEventListener('mouseleave', this.purchaseTooltipMouseLeaveHandler);
    }
    this.purchaseTooltipMouseEnterHandler = null;
    this.purchaseTooltipMouseLeaveHandler = null;
    this.currentPurchaseTooltipElement = null;
  }

  private closePurchaseTooltip() {
    if (this.purchaseHideTimeout) {
      clearTimeout(this.purchaseHideTimeout);
      this.purchaseHideTimeout = null;
    }
    if (this.qohHoverTimeout) {
      clearTimeout(this.qohHoverTimeout);
      this.qohHoverTimeout = null;
    }
    this.isMouseOverPurchaseTooltip = false;
    this.removePurchaseTooltipHandlers();
    this.purchaseHoveredElement = null;
    this.salesData = [];
    this.purchaseLoading = false;
    if (this.currentPurchaseTooltipRef) {
      this.currentPurchaseTooltipRef.close();
      this.currentPurchaseTooltipRef = null;
    }
  }

  fetchPurchaseData(productId: number, businessAccountId: number) {
    // Set flags to prevent multiple calls
    this.purchaseLoading = true;
    
    // Call the API service to fetch QOH data (you'll need to create this method in ApiService)
    this.apiService.getPreviousPurchasesData(productId, businessAccountId)
      .subscribe((response: any) => {
        this.salesData = response.purchaseData || [];
        this.purchaseLoading = false;
      });
  }



}
