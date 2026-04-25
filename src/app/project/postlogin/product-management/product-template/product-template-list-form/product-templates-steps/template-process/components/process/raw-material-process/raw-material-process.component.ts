import { ActivatedRoute } from '@angular/router';
import { Observable, debounceTime } from 'rxjs';
import { FormsService } from '../../../../../../../../../../service/forms.service';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { UntypedFormArray, FormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { MatDialog } from '@angular/material/dialog';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinSearchableSelectComponent } from '../../../../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { DadyinButtonComponent } from '../../../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { NgClass } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';
@Component({
    selector: 'app-raw-material-process',
    templateUrl: './raw-material-process.component.html',
    styleUrls: ['./raw-material-process.component.scss'],
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    DadyinButtonComponent,
    DadyinSearchableSelectComponent,
    MatExpansionPanelContent,
    NgClass,
    ExtendedModule
],
})
export class RawMaterialProcessComponent implements OnInit {
  @Input() templateForm: any;
  @Input() index: number = 0;
  @Input() isExpandAll: boolean;
  @Input() componentUoms: any;
  @Output() calculate = new EventEmitter();
  filteredProductList$: Observable<any>;

  isExpanded = true;

  constructor(
    public apiService: ApiService,
    private FormsService: FormsService,
    public uomService: UomService,
    public toastr: ToastrService,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {

  }

  ngOnChanges(): void {
  }

  get process() {
    return this.templateForm.get('rawMaterialProcess');
  }

  getFilteredProductsList(i) {
    if (this.getAttribute(i, 'productTypeId').value) {
      const data: any[] = this.apiService.filterArray(
        this.apiService.allproductsListForProcess,
        'productTypeId',
        Number(this.getAttribute(i, 'productTypeId').value)
      );
      return data;
    } else {
      return this.apiService.allproductsListForProcess;
    }
  }

  get processCalculatorOptions() {
    return this.process.get('processCalculatorOptions') as UntypedFormArray;
  }


  onSelectOption(event: any) {
    this.processCalculatorOptions?.controls.forEach((item) => {
      item.get('isSelected').setValue(false);
    });
    const control = this.processCalculatorOptions.controls.find(
      (item) => item.get('name').value == event.target.value
    );
    control.get('isSelected').setValue(true);
    this.calculateValues();
  }

  // Start Getters

  get priceUom() {
    return this.getprocessProducts?.controls[0]
      ?.get('subProductMetricCost')
      .get('userConversionUom');
  }
  get densityUom() {
    return this.getprocessProducts?.controls[0]
      ?.get('subProductDensity')
      .get('userConversionUom');
  }
  get avgDensityUom() {
    return this.getprocessProducts?.controls[0]
      ?.get('density')
      .get('userConversionUom');
  }
  get costAddOnUom() {
    return this.getprocessProducts?.controls[0]
      ?.get('metricCost')
      .get('userConversionUom');
  }

  get getprocessDescription() {
    const control = this.process.get('description');
    return control;
  }
  get getProductOfProcessDescription() {
    const control = this.process
      .get('productOfProcess')
      .get('productMeta')
      .get('description');
    return control;
  }

  get getprocessID() {
    const control = this.process.get('id');
    return control;
  }
  get getProductOfProcessId() {
    const control = this.process.get('productOfProcess').get('id');
    return control;
  }

  get getprocessProducts() {
    const control = <UntypedFormArray>this.process.get('processProducts');
    return control;
  }
  get getProcessConversionTypes() {
    const control = <UntypedFormArray>this.process.get('processConversionTypes');
    return control;
  }

  get productOfProcess() {
    const control = <UntypedFormGroup>this.process.get('productOfProcess');
    return control;
  }

  addNewProcessProductControl() {
    const processProductForm = this.FormsService.createProcessProductForm();
    const metricCost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'METRICCOST'
    );
    const density = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
    );
    processProductForm
      .get('metricCost')
      .get('userConversionUom')
      .setValue(metricCost.get('userConversionUom').value);
    processProductForm
      .get('subProductMetricCost')
      .get('userConversionUom')
      .setValue(metricCost.get('userConversionUom').value);
    processProductForm
      .get('density')
      .get('userConversionUom')
      .setValue(density.get('userConversionUom').value);
    processProductForm
      .get('subProductDensity')
      .get('userConversionUom')
      .setValue(density.get('userConversionUom').value);
    this.getprocessProducts.push(processProductForm);
  }
  addNewProcessConversionTypeControl() {
    const conversionTypeForm = this.FormsService.createConversionTypeForm();
    const metricCost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'METRICCOST'
    );
    conversionTypeForm
      .get('metricCost')
      .get('userConversionUom')
      .setValue(metricCost.get('userConversionUom').value);
    conversionTypeForm
      .get('conversionTypeId')
      .setValue(this.apiService.conversionTypes[0]?.id);
    this.getProcessConversionTypes.push(conversionTypeForm);
  }

  removeProcessProduct(i) {
    this.getprocessProducts.removeAt(i);
    this.calculateValues();
  }

  removeConversion(i) {
    this.getProcessConversionTypes.removeAt(i);
    this.calculateValues();
  }

  getAttribute(index: any, value: string): any {
    return this.getprocessProducts.controls[index].get(value);
  }

  getAttributeValue(index: number, attr: string) {
    return this.getAttribute(index, attr).get('attributeValue');
  }

  getUserConversionUom(index: number, attr: string) {
    return this.getAttribute(index, attr).get('userConversionUom');
  }

  getProductOfProcessAttribute(value: string): any {
    return this.productOfProcess.get(value);
  }
  getProductOfProcessAttributeValue(attr: string) {
    return this.getProductOfProcessAttribute(attr).get('attributeValue');
  }
  getProductOfProcessUserConversionUom(attr: string) {
    return this.getProductOfProcessAttribute(attr).get('userConversionUom');
  }

  getConversionTypeAttribute(index: any, value: string): any {
    return this.getProcessConversionTypes.controls[index].get(value);
  }
  getConversionTypeAttributeValue(index: number, attr: string) {
    return this.getConversionTypeAttribute(index, attr).get('attributeValue');
  }
  getConversionTypeUserConversionUom(index: number, attr: string) {
    return this.getConversionTypeAttribute(index, attr).get(
      'userConversionUom'
    );
  }

  // End Calculation

  getConversionTypesList(): any[] {
    return this.apiService.conversionTypes;
  }

  getAvailableUOMs(description: string) {
    const attribute = this.apiService.getDataByAttr(
      this.apiService.allAttributes,
      'description',
      description
    );

    if (attribute) {
      const attributeType = this.apiService.getDataByAttr(
        this.apiService.allAttributesTypes,
        'id',
        attribute.attributeTypeId
      );

      return attributeType;
    } else {
      return {};
    }
  }

  // New methods

  async getProductData(event: any, index: number) {
    let id: any = this.getprocessProducts.controls[index].value.id;
    const product: any = this.apiService.allproductsListForProcess.find(
      (item) => Number(event.target.value) == item?.id
    );
    this.getprocessProducts.controls[index].patchValue(product);
    this.getprocessProducts.controls[index].get('id').setValue(id);
    if (!this.route.snapshot.params.id) {
      this.setIdsToNullOnEdit();
    }
    // set metric cost and density
    this.setProcessProductCostandDensity(index, product);
    this.calculateValues();
  }

  setProcessProductCostandDensity(index, product) {
    // set metric cost and density
    this.getprocessProducts.controls[index]
      .get('subProductMetricCost')
      .get('attributeValue')
      .setValue(product?.metricCost?.attributeValue);
    this.getprocessProducts.controls[index]
      .get('subProductDensity')
      .get('attributeValue')
      .setValue(product?.density?.attributeValue);
    this.getprocessProducts.controls[index]
      .get('subProductMetricCost')
      .get('userConversionUom')
      .setValue(product?.metricCost?.userConversionUom);
    this.getprocessProducts.controls[index]
      .get('subProductDensity')
      .get('userConversionUom')
      .setValue(product?.density?.userConversionUom);
  }

  async setIdsToNullOnEdit() {
    let data = this.process.getRawValue();
    const newData = this.cleanDataId(data);
    this.process.patchValue(newData);
  }

  cleanDataId(data) {
    if (typeof data != 'object') return;
    if (!data) return; // null object
    for (const key in data) {
      if (
        typeof data[key] != 'object' ||
        (typeof data[key] == 'object' && data[key] == null)
      ) {
        if (key == 'id') {
          data[key] = null;
        }
        if (key === 'existingProcessId') {
          data[key] = 0;
        }
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          this.cleanDataId(item);
        });
      } else if (typeof data[key] == 'object') {
        this.cleanDataId(data[key]);
      }
    }

    return data;
  }

  checkIfusedPercentSum() {
    let sum = 0;
    this.getprocessProducts.controls.forEach((element) => {
      sum = sum + element.get('usedPercent').value;
    });
    if (sum != 100) {
      return false;
    } else {
      return true;
    }
  }


  get sumOfUsedPercent() {
    let sum = 0;
    this.getprocessProducts.controls.forEach((element) => {
      sum = sum + element.get('usedPercent').value;
    });
    return sum
  }

  // Get Converted Price

  // controls for uoms

  // converted totals

  get alltotalCostUomValue() {
    return this.process.get('materialMetricCost').get('userConversionUom')
      ?.value;
  }

  get alltotalCostValueValue() {
    return this.process.get('materialMetricCost').get('attributeValue')?.value;
  }

  get totalCostUom() {
    return this.process
      .get('materialMetricCostSecondary')
      .get('userConversionUom');
  }

  get convertedTotalCost() {
    return this.process
      .get('materialMetricCostSecondary')
      .get('attributeValue');
  }

  get conversionCostUom() {
    return this.process
      .get('conversionMetricCostSecondary')
      .get('userConversionUom');
  }

  get convertedConversionCost() {
    return this.process
      .get('conversionMetricCostSecondary')
      .get('attributeValue');
  }

  get convertedGrossTotal() {
    return this.getProductOfProcessAttributeValue('metricCostSecondary');
  }

  get grossTotalUom() {
    return this.getProductOfProcessUserConversionUom('metricCostSecondary');
  }

  get convertedDensity() {
    return this.getProductOfProcessAttributeValue('densitySecondary');
  }
  get grossDensityUom() {
    return this.getProductOfProcessUserConversionUom('densitySecondary');
  }

  async calculateValues() {
    if (this.process?.invalid) {
      // Find all controls that are invalid and collect their names
      const invalidControls = [];
      const collectInvalidControls = (formGroup, parentKey = '') => {
        Object.keys(formGroup.controls).forEach(key => {
          const control = formGroup.get(key);
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          if (control.invalid) {
            if (control instanceof UntypedFormGroup || control instanceof UntypedFormArray) {
              collectInvalidControls(control, fullKey);
            } else {
              invalidControls.push(fullKey);
            }
          }
        });
      };
      collectInvalidControls(this.process);
      if (invalidControls.length > 0) {
        this.toastr.error(
          `Please fill required fields: ${invalidControls
            .map(k => k.split('.').join(' → '))
            .join(', ')}`
        );
      } else {
        this.toastr.error('Please fill required fields.');
      }
      this.process.markAllAsTouched();
      return;
    }
    this.calculate.emit();
  }

  resetProduct(i) {
    this.getprocessProducts.controls[i].get('id').setValue(null);
    this.getprocessProducts.controls[i].get('subProductId').setValue(null);
    this.getprocessProducts.controls[i].get('density').reset();
    this.getprocessProducts.controls[i].get('metricCost').reset();
    this.getprocessProducts.controls[i].get('subProductMetricCost').reset();
    this.getprocessProducts.controls[i].get('subProductDensity').reset();
    this.getprocessProducts.controls[i].get('usedPercent').setValue(0);
    this.getprocessProducts.controls[i].get('wastePercent').setValue(0);
  }

  getProductsListCount(type: any) {
    if (type) {
      const data: any[] = this.apiService.filterArray(
        this.apiService.allproductsListForProcess,
        'productTypeId',
        Number(type.id)
      );
      return data?.length;
    } else {
      return 0;
    }
  }


  trackByFn(index, item) {
    return index;
  }


}
