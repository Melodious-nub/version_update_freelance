import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject, takeUntil } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ThreeSceneComponent } from 'src/app/shared/component/three-scene/three-scene.component';
import { OrderManagementService } from 'src/app/project/postlogin/order-management/service/order-management.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {
  containerData: any;

  @ViewChild('expansionPanel2') expansionPanel2;
  @ViewChild('threejs') threejs!: ThreeSceneComponent;

  squares: number[] = [];
  numParts = 62; // Default number of parts (e.g., divide into 4 equal squares)
  height: any;
  width: any;
  poView: any = 'orderWise';
  @Input() componentUoms: any;
  @Input() isExport: any;
  @Input() isQuotation: any;
  @Input() containerForm: UntypedFormGroup;
  @Input() currentBusinessAccount: any;
  @Output() calculate = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  @Input() purchaseOrdersList: any[] = [];
  filteredPurchasedOrdersList: any[] = [];
  filteredQuotationsList: any[] = [];
  @Input() quotationsList: any[] = [];
  filterTermPo = new UntypedFormControl();
  filterTermQuotation = new UntypedFormControl();
  map1 = false;
  map2 = false;
  imgUrl = environment.imgUrl;
  public orderHeaders = [
    { name: 'PO#', prop: 'transactionId', sortable: true },
    { name: 'DATE', prop: 'salesOrdertransactionId', sortable: true },
    {
      name: 'CUSTOMER NAME',
      prop: 'requestFrom.name',
      sortable: true,
    },
    {
      name: 'VENDOR NAME',
      prop: 'requestTo.name',
      sortable: true,
    },
    {
      name: 'INCO',
      prop: 'incoTermId',
      sortable: true,
    },
    {
      name: 'WEIGHT',
      prop: 'weight',
      type: 'uom',
      sortable: true,
    },
    {
      name: 'VOLUME',
      prop: 'volume',
      type: 'uom',
      sortable: true,
    },
    {
      name: 'ODOMETER',
      prop: 'odometer',
      sortable: true,
    },
    {
      name: '# PRODUCT',
      prop: 'productPackages',
      type: 'count',
      sortable: true,
    },
    {
      name: 'TOTAL SKUs',
      prop: 'totalSku',
      sortable: true,
    },
    {
      name: 'REQ. DATE',
      prop: 'requiredByDate',
      type: 'date',
      sortable: true,
    },
    {
      name: 'PRICE',
      prop: 'cost',
      type: 'uom',
      sortable: true,
    },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];
  public tabelActions: any = [
    {
      label: 'Add',
      icon: 'add-dash',
    },
  ];

  constructor(
    public fb: UntypedFormBuilder,
    public containerService: ContainerManagementService,
    public containerFormService: ContainerFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public businessAccountService: BusinessAccountService,
    public orderManagementService: OrderManagementService
  ) {}

  ngAfterViewInit() {
    this.calculateSquares();
    this.calculateValues();
  }

  calculateSquares() {
    const columns = Math.ceil(Math.sqrt(this.numParts));
    const rows = Math.ceil(this.numParts / columns);
    this.height = 100 / rows;
    this.width = 100 / columns;
    this.squares = Array(this.numParts).fill(0);
  }

  async ngOnInit() {
    this.filteredPurchasedOrdersList = this.purchaseOrdersList;
    this.filteredQuotationsList = this.quotationsList;

    this.filterTermPo.valueChanges.subscribe((res) => {
      this.getFilteredPOs();
    });
    this.filterTermQuotation.valueChanges.subscribe((res) => {
      this.getFilteredQuotations();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openMap(type: any) {
    if (type == 1) {
      this.map1 = !this.map1;
    }
    if (type == 2) {
      this.map2 = !this.map2;
    }
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

  getAttributeUserConversionUom(value1: any, value2: string): any {
    return this.containerForm.get(value1).get(value2).get('userConversionUom');
  }
  getAttributeAttributeValue(value1: any, value2: string): any {
    return this.containerForm.get(value1).get(value2).get('attributeValue');
  }

  get containerOrders() {
    return this.containerForm.get('containerOrders') as UntypedFormArray;
  }

  get containerQuotations() {
    return this.containerForm.get('containerQuotations') as UntypedFormArray;
  }

  getPurchaseOrderDetail(i) {
    return this.containerOrders.controls[i].get('purchaseOrderDetail');
  }

  getProductPackages(i) {
    return this.getPurchaseOrderDetail(i).get('productPackages') as UntypedFormArray;
  }

  getQuotationListViewQuotation(i) {
    return this.containerQuotations.controls[i].get('quotationListView');
  }
  getProductPackagesQuotation(i) {
    return this.getQuotationListViewQuotation(i).get(
      'productPackages'
    ) as UntypedFormArray;
  }

  async addInContainerOrder(purchaseOrder: any) {
    if (!this.containerTypeId.value) {
      this.containerTypeId.patchValue(3);
    }
    this.requestFromId.patchValue(purchaseOrder?.requestTo?.id);
    this.onChangeVendor();
    const containerOrder = this.containerFormService.containerOrderForm();
    const productPackages = containerOrder
      .get('purchaseOrderDetail')
      .get('productPackages') as UntypedFormArray;
    productPackages.clear();
    for (
      let index = 0;
      index < purchaseOrder?.productPackages.length;
      index++
    ) {
      const productPackage = purchaseOrder?.productPackages[index];
      const productPackageForm = this.containerFormService.productPackageForm();
      productPackages.push(productPackageForm);
      productPackages.at(index).patchValue(productPackage);
    }
    containerOrder.get('purchaseOrderId').setValue(purchaseOrder?.id);
    containerOrder.get('purchaseOrderDetail').patchValue(purchaseOrder);
    this.containerOrders.push(containerOrder);
    this.onContainerTypeChange();
  }

  async addInContainerQuotation(quotation: any) {
    if (!this.containerTypeId.value) {
      this.containerTypeId.patchValue(3);
    }
    this.requestToId.patchValue(quotation?.requestTo?.id);
    this.onChangeVendor();
    const containerQuotation =
      this.containerFormService.containerQuotationForm();
    const productPackages = containerQuotation
      .get('quotationListView')
      .get('productPackages') as UntypedFormArray;
    productPackages.clear();
    for (let index = 0; index < quotation?.productPackages.length; index++) {
      const productPackage = quotation?.productPackages[index];
      const productPackageForm = this.containerFormService.productPackageForm();
      productPackages.push(productPackageForm);
      productPackages.at(index).patchValue(productPackage);
    }
    containerQuotation.get('quotationId').setValue(quotation?.id);
    containerQuotation.get('quotationListView').patchValue(quotation);
    this.containerQuotations.push(containerQuotation);
    this.onContainerTypeChange();
  }

  get containerTypeId() {
    return this.containerForm
      .get('containerTypeInformation')
      .get('containerTypeId');
  }

  getContainerLabel() {
    const container = this.containerService.containerTypesList.find(
      (it) => it.id == this.containerTypeId.value
    );
    return container?.label;
  }

  prepareThreeJsData() {
    // if (this.containerOrders.controls.length == 0) {
    //   return;
    // }

    this.assignedColors = new Map();
    this.colorIndex = 0;
    const container = this.containerService.containerTypesList.find(
      (it) => it.id == this.containerTypeId.value
    );

    this.containerData = null;
    const productInContainers = [];
    if (this.isQuotation) {
      this.containerQuotations.controls.forEach((order, i) => {
        const productPackages = order
          .get('quotationListView')
          .get('productPackages') as UntypedFormArray;
        productPackages.controls.forEach((product) => {
          product.value.productDetails.packages.forEach((pck: any) => {
            if (pck.isSku) {
              const productObj = {
                id: product.value.productDetails.productCode,
                description: product.value.productDetails.description,
                dimensions: {
                  length: this.getValueFromAttribute(
                    14,
                    pck.packageAttributeValues
                  ),
                  width: this.getValueFromAttribute(
                    13,
                    pck.packageAttributeValues
                  ),
                  height: this.getValueFromAttribute(
                    30,
                    pck.packageAttributeValues
                  ),
                },
                weight: Number(product.value.totalWeight.attributeValue),
                weightUom: product.value.totalWeight.userConversionUom,
                quantity: Number(product.value.quantity),
                color: this.getColourFromProductCode(
                  product.value.productDetails.productCode
                ),
                volume: Number(product.value.totalVolume.attributeValue),
                volumeUom: product.value.totalVolume.userConversionUom,
                odometer:
                  (product.value.productDetails.skuOdometer.type == 'VOLUME'
                    ? 'V'
                    : 'W') + product.value.productDetails.skuOdometer.value,
                img: product.value.productDetails.productImageFileNames[0],
              };
              productInContainers.push(productObj);
            }
          });
        });
      });
    } else {
      this.containerOrders.controls.forEach((order, i) => {
        const productPackages = order
          .get('purchaseOrderDetail')
          .get('productPackages') as UntypedFormArray;
        productPackages.controls.forEach((product) => {
          product.value.productDetails.packages.forEach((pck: any) => {
            if (pck.isSku) {
              const productObj = {
                id: product.value.productDetails.productCode,
                description: product.value.productDetails.description,
                dimensions: {
                  length: this.getValueFromAttribute(
                    14,
                    pck.packageAttributeValues
                  ),
                  width: this.getValueFromAttribute(
                    13,
                    pck.packageAttributeValues
                  ),
                  height: this.getValueFromAttribute(
                    30,
                    pck.packageAttributeValues
                  ),
                },
                weight: Number(product.value.totalWeight.attributeValue),
                weightUom: product.value.totalWeight.userConversionUom,
                quantity: Number(product.value.quantity),
                color: this.getColourFromProductCode(
                  product.value.productDetails.productCode
                ),
                volume: Number(product.value.totalVolume.attributeValue),
                volumeUom: product.value.totalVolume.userConversionUom,
                odometer:
                  (product.value.productDetails.skuOdometer.type == 'VOLUME'
                    ? 'V'
                    : 'W') + product.value.productDetails.skuOdometer.value,
                img: product.value.productDetails.productImageFileNames[0],
              };
              productInContainers.push(productObj);
            }
          });
        });
      });
    }

    this.containerData = {
      label: container.description,
      type: container.label,
      dimensions: container.dimensions,
      products: productInContainers,
    };
    this.expansionPanel2.open();
    setTimeout(() => {
      const ProductIdsArray = [];
      this.threejs.create3DScene(ProductIdsArray);
    }, 1000);
  }

  colors: string[] = [
    '#CC9F9F',
    '#CCB19F',
    '#CCBF8F',
    '#B3CC8D',
    '#9ACF8F',
    '#8CCCAB',
    '#7FCCCC',
    '#9BA3CC',
    '#9A8FCC',
    '#B3CCCC',
    '#CC66B0',
    '#CC6F6F',
    '#CC5F5F',
    '#CC8A6F',
    '#CCB366',
    '#99CC52',
    '#66B34D',
    '#46B376',
    '#1FBBBB',
    '#4669CC',
    '#6652CC',
    '#992FC2',
    '#A6398A',
    '#BF4F52',
    '#CC3D3D',
    '#CC692D',
    '#CCAA22',
    '#7AA61B',
    '#3D9119',
    '#076B35',
    '#099B9A',
    '#0035B3',
    '#261490',
    '#7F099E',
    '#8C1566',
    '#851215',
  ];

  assignedColors: Map<string, string> = new Map();
  colorIndex = 0;
  getColourFromProductCode(input: any): string {
    // If the string already has a color assigned, return it
    if (this.assignedColors.has(input)) {
      return this.assignedColors.get(input)!;
    }

    // Assign a new color
    let color: string;
    if (this.colorIndex < this.colors.length) {
      color = this.colors[this.colorIndex];
      this.colorIndex++;
    } else {
      // Generate a new color if pre-defined colors are exhausted
      color = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')}`;
    }

    this.assignedColors.set(input, color);
    return color;
  }

  getValueFromAttribute(id: any, attributeObjectsArray: any) {
    const obj = attributeObjectsArray.find((it) => it.attributeId == id);
    if (obj?.attributeValue) {
      if (obj.userConversionUom == 'in') {
        return Number(obj.attributeValue) * 25.4;
      }
      return Number(obj.attributeValue ?? 0);
    } else {
      return 0;
    }
  }

  removeInContainerOrder(i) {
    this.containerOrders.removeAt(i);
    this.calculateValues();
  }

  removeInContainerQuotation(i) {
    this.containerQuotations.removeAt(i);
    this.calculateValues();
  }

  calculateValues() {
    this.calculate.emit();
    this.prepareThreeJsData();
  }

  onContainerTypeChange() {
    if (this.containerService.containerTypesList?.length == 0) {
      return;
    }
    const item = this.containerService.containerTypesList.find(
      (item) => item.id.toString() === this.containerTypeId.value.toString()
    );
    this.containerForm
      .get('containerTypeInformation')
      .get('weight')
      .setValue(item?.weight);
    this.containerForm
      .get('containerTypeInformation')
      .get('volume')
      .setValue(item?.volume);

    this.calculateValues();
  }

  getCentralOdometerValue() {
    const containerType = this.containerService.containerTypesList.find(
      (item) => item.id.toString() === this.containerTypeId.value?.toString()
    );

    if (containerType) {
      const weight = containerType.weight.attributeValue * 1000;
      const volume = containerType.volume.attributeValue;

      if (weight && volume) {
        const centralOdometerValue = weight / volume;
        return centralOdometerValue;
      }
    }

    return null;
  }

  onContainerDateChange(event: any) {
    let date = new Date(event);
    let data = this.addDays(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
      20
    );
    let newDate = new Date(data.year, data.month, data.date).toISOString();

    const editTillDate = this.containerForm.get('editTillDate');
    if (!editTillDate.value) {
      editTillDate.setValue(newDate.slice(0, 10));
    }
    const arrivalDate = this.containerForm.get('arrivalDate');
    if (!arrivalDate.value) {
      arrivalDate.setValue(newDate.slice(0, 10));
    }
    const gateCloseDate = this.containerForm.get('gateCloseDate');
    if (!gateCloseDate.value) {
      gateCloseDate.setValue(newDate.slice(0, 10));
    }
    const gateOpenDate = this.containerForm.get('gateOpenDate');
    if (!gateOpenDate.value) {
      gateOpenDate.setValue(newDate.slice(0, 10));
    }
    const loadingDate = this.containerForm.get('loadingDate');
    if (!loadingDate.value) {
      loadingDate.setValue(newDate.slice(0, 10));
    }
    const departureDate = this.containerForm.get('departureDate');
    if (!departureDate.value) {
      departureDate.setValue(newDate.slice(0, 10));
    }
  }

  getWeightWidth() {
    if (
      this.containerForm.get('weight').get('attributeValue').value &&
      this.containerForm
        .get('containerTypeInformation')
        .get('weight')
        .get('attributeValue').value
    ) {
      const percent =
        (this.containerForm.get('weight').get('attributeValue').value /
          this.containerForm
            .get('containerTypeInformation')
            .get('weight')
            .get('attributeValue').value) *
        100;
      const width = percent;
      return width;
    } else {
      return 0;
    }
  }

  getVolumeWidth() {
    if (
      this.containerForm.get('volume').get('attributeValue').value &&
      this.containerForm
        .get('containerTypeInformation')
        .get('volume')
        .get('attributeValue').value
    ) {
      const percent =
        (this.containerForm.get('volume').get('attributeValue').value /
          this.containerForm
            .get('containerTypeInformation')
            .get('volume')
            .get('attributeValue').value) *
        100;
      const width = percent;
      return width;
    } else {
      return 0;
    }
  }

  search($event) {
    this.filterTermPo.setValue($event);
  }

  getFilteredPOs() {
    this.filteredPurchasedOrdersList = this.purchaseOrdersList;
    for (let j = 0; j < this.containerOrders.controls?.length; j++) {
      this.filteredPurchasedOrdersList =
        this.filteredPurchasedOrdersList.filter(
          (item) =>
            item.transactionId !=
            this.getPurchaseOrderDetail(j).value.transactionId
        );
    }
    if (this.filterTermPo.value) {
      this.filteredPurchasedOrdersList =
        this.filteredPurchasedOrdersList.filter((item) =>
          item.transactionId
            ?.toUpperCase()
            .includes(this.filterTermPo.value?.toUpperCase())
        );
    }

    return this.filteredPurchasedOrdersList;
  }

  getFilteredQuotations() {
    this.filteredQuotationsList = this.quotationsList;
    for (let j = 0; j < this.containerQuotations.controls?.length; j++) {
      const ele = this.containerQuotations.controls[j];
      this.filteredQuotationsList = this.filteredQuotationsList.filter(
        (item) =>
          item.transactionId !==
          ele.get('quotationListView').value.transactionId
      );
    }
    if (this.filterTermQuotation.value) {
      this.filteredQuotationsList = this.filteredQuotationsList.filter((item) =>
        item.transactionId
          ?.toUpperCase()
          .includes(this.filterTermQuotation.value?.toUpperCase())
      );
    }
    return this.filteredQuotationsList;
  }

  get requestFromId() {
    return this.containerForm.get('requestFromId');
  }

  get requestToId() {
    return this.containerForm.get('requestToId');
  }

  get requestFromAddress() {
    if (!this.isExport) {
      const item = this.businessAccountService.customerList.find(
        (item) =>
          item.relationAccountId ==
          this.containerForm.get('requestFromId').value
      );
      return item
        ? `${item?.address?.addressLine},${item?.address?.addressCity},${item?.address?.addressState},${item?.address?.addressCountry},${item?.address?.addressZipCode}`
        : '';
    } else {
      return (
        this.currentBusinessAccount?.primaryContact?.city?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.state?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.country?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.zipcode
      );
    }
  }

  get requestToAddress() {
    if (!this.isExport) {
      return (
        this.currentBusinessAccount?.primaryContact?.city?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.state?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.country?.name +
        ',' +
        this.currentBusinessAccount?.primaryContact?.zipcode
      );
    } else {
      const item = this.businessAccountService.exportersVendorList.find(
        (item) =>
          item.relationAccountId == this.containerForm.get('requestToId').value
      );
      return item
        ? `${item?.address?.addressLine},${item?.address?.addressCity},${item?.address?.addressState},${item?.address?.addressCountry},${item?.address?.addressZipCode}`
        : '';
    }
  }

  //  function to get date

  isLeap(y) {
    if ((y % 100 != 0 && y % 4 == 0) || y % 400 == 0) {
      return true;
    } else {
      return false;
    }
  }

  offsetDays(d, m, y) {
    let offset = d;
    if (m - 1 == 11) offset += 335;
    if (m - 1 == 10) offset += 304;
    if (m - 1 == 9) offset += 273;
    if (m - 1 == 8) offset += 243;
    if (m - 1 == 7) offset += 212;
    if (m - 1 == 6) offset += 181;
    if (m - 1 == 5) offset += 151;
    if (m - 1 == 4) offset += 120;
    if (m - 1 == 3) offset += 90;
    if (m - 1 == 2) offset += 59;
    if (m - 1 == 1) offset += 31;
    if (this.isLeap(y) && m > 2) {
      offset += 1;
    }
    return offset;
  }

  revoffsetDays(offset, y) {
    let month = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (this.isLeap(y)) {
      month[2] = 29;
    }
    let i;
    for (i = 1; i <= 12; i++) {
      if (offset <= month[i]) break;
      offset = offset - month[i];
    }
    let d2 = offset;
    let m2 = i;
    return { date: d2, month: m2 - 1 };
  }

  addDays(d1, m1, y1, x) {
    let offset1 = this.offsetDays(d1, m1, y1);
    let remDays = this.isLeap(y1) ? 366 - offset1 : 365 - offset1;
    let y2,
      offset2 = 0;
    if (x <= remDays) {
      y2 = y1;
      offset2 = offset1 + x;
    } else {
      x -= remDays;
      y2 = y1 + 1;
      let y2days = this.isLeap(y2) ? 366 : 365;
      while (x >= y2days) {
        x -= y2days;
        y2++;
        y2days = this.isLeap(y2) ? 366 : 365;
      }
      offset2 = x;
    }
    let data = { ...this.revoffsetDays(offset2, y2), year: y2 };
    return data;
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }

  onChangeVendor() {
    const vendor = this.businessAccountService.exportersVendorList.find(
      (item) =>
        item.relationAccountId == this.containerForm.get('requestFromId').value
    );
    this.containerForm.get('incoTermId').patchValue(vendor?.incoTermId);
    this.containerForm.get('departurePortId').patchValue(vendor?.portId);
    this.containerForm
      .get('arrivalPortId')
      .patchValue(this.currentBusinessAccount?.portId);
    const currentDate = new Date();
    this.containerForm
      .get('date')
      .patchValue(currentDate.toISOString().split('T')[0]);

    // const futureDate = new Date(
    //   currentDate.getTime() +
    //   vendor?.fulfillmentLimitInDays * 24 * 60 * 60 * 1000
    // );
    // this.containerForm
    //   .get('containerDate')
    //   .setValue(futureDate.toISOString().split('T')[0]);
  }

  onChangeCustomer() {
    const customer = this.businessAccountService.customerList.find(
      (item) =>
        item.relationAccountId == this.containerForm.get('requestToId').value
    );
    this.containerForm.get('arrivalPortId').patchValue(customer?.portId);
    this.containerForm
      .get('departurePortId')
      .patchValue(this.currentBusinessAccount?.portId);

    const currentDate = new Date();
    this.containerForm
      .get('date')
      .patchValue(currentDate.toISOString().split('T')[0]);
  }

  getincoTermLabel(id: any) {
    const obj = this.containerService.incoTermsList.find(
      (item) => item.id == id
    );
    return obj?.description;
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  sortedData() {
    const sortedData = this.getFilteredPOs()
      .slice()
      .sort((a, b) => {
        let valA = this.getValue(a, this.sortColumn);
        let valB = this.getValue(b, this.sortColumn);
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    return sortedData;
  }

  sortedQuotationsData() {
    const sortedData = this.getFilteredQuotations()
      .slice()
      .sort((a, b) => {
        let valA = this.getValue(a, this.sortColumn);
        let valB = this.getValue(b, this.sortColumn);
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    return sortedData;
  }

  getValue(obj: any, path: string) {
    return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
  }

  getSortIcon() {
    if (!this.sortDirection) return '';
    return this.sortDirection === 'asc' ? 'north' : 'south';
  }

  refreshPo(data: any, j) {
    this.orderManagementService
      .Refresh_Order(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.sortedData()[j] = res;
          this.toastr.success('Refreshed Successfully');
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  // end
}
