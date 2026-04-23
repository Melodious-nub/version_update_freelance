import { FormsService } from '../../../../../../../../../../service/forms.service';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ProcessWasteModalComponent } from '../../../../components/process-waste-modal/process-waste-modal.component';
import { ActivatedRoute } from '@angular/router';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinButtonComponent } from '../../../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';
@Component({
    selector: 'app-edit-process',
    templateUrl: './edit-process.component.html',
    styleUrls: ['./edit-process.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        NgIf,
        NgFor,
        DadyinSearchableSelectComponent,
        DadyinButtonComponent,
        MatExpansionPanelContent,
        NgClass,
        ExtendedModule,
    ],
})
export class EditProcessComponent implements OnInit {
  @Input() process: any;
  @Input() templateForm: any;
  @Input() index: number = 0;
  @Input() isExpandAll: boolean;

  @Output() calculate = new EventEmitter();
  @Output() deleteProcessEvent = new EventEmitter();
  @Input() componentUoms: any;

  isExpanded = true;
  isProcessSaved = true;

  constructor(
    public apiService: ApiService,
    private FormsService: FormsService,
    private dialog: MatDialog,
    public uomService: UomService,
    public toastr: ToastrService,
    public route: ActivatedRoute
  ) { }

  async ngOnInit() { }

  ngOnChanges() {
    this.isExpanded = this.isExpandAll;
  }

  updatevalue() {
    this.templateForm.updateValueAndValidity();
  }



  async enableForm() {

    this.process.enable();
    this.apiService.finalSave = false;
    this.templateProcessType.disable({ emitEvent: false, onlySelf: true });
    this.isExistingProcess.setValue(false);
  }

  async disableForm() {
    this.process.disable();
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

  addNewProcessProductControl(remainingPercent?: any) {
    if (this.process.disabled) {
      return;
    }
    const processProductForm = this.FormsService.createProcessProductForm();
    processProductForm
      .get('sortOrder')
      .patchValue(this.getprocessProducts.controls.length);

    if (remainingPercent) {
      processProductForm.get('usedPercent').setValue(remainingPercent)
    }

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
    if (this.getProcessConversionTypes.invalid) {
      this.getProcessConversionTypes.markAsTouched()
      return;
    }
    const metricCost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'METRICCOST'
    );
    const conversionTypeForm = this.FormsService.createConversionTypeForm()
    conversionTypeForm.get('metricCost').get('userConversionUom').setValue(metricCost.get('userConversionUom').value);
    this.getProcessConversionTypes.push(
      conversionTypeForm
    );
  }

  removeProcessProduct(i) {
    this.getprocessProducts.removeAt(i);
    this.calculateValues();
  }

  removeConversion(i) {
    this.getProcessConversionTypes.removeAt(i);
    this.calculateValues();
  }

  // End Calculation

  setProcess(data: any) {
    this.getprocessProducts.clear();
    this.getProcessConversionTypes.clear();
    data.processProducts.forEach((processProduct) => {
      const processProductForm = this.FormsService.createProcessProductForm();
      if (processProduct?.subProductId) {
        const res: any = this.apiService.allproductsListForProcess.find(
          (item) => processProduct?.subProductId == item?.id
        );
        processProductForm
          .get('productTypeId')
          .setValue(Number(res?.productTypeId));
      }
      const processProductAttributeValues = processProductForm.get(
        'processProductAttributeValues'
      ) as UntypedFormArray;
      processProduct.processProductAttributeValues.forEach(
        (processProductAttribute) => {
          processProductAttributeValues.push(
            this.FormsService.createAttributeForm()
          );
        }
      );
      this.getprocessProducts.push(processProductForm);
    });
    for (let i = 0; i < data.processConversionTypes.length; i++) {
      this.getProcessConversionTypes.push(
        this.FormsService.createConversionTypeForm()
      );
    }
    this.process.get('process').patchValue(data);
    this.process.get('existingProcessId').setValue(data.id);
    this.apiService.finalSave = true;
    this.templateProcessType.enable({
      emitEvent: false,
      onlySelf: true,
    });
    this.isProcessSaved = false;
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

  async getProcessName(event: any) {
    const pid = Number(event.target.value);
    const processTemplate: any = await this.apiService.Get_Process_ById(pid);
    this.setProcess(processTemplate);
    this.disableForm();
  }

  async getProductOfProcessName(event: any) {
    const id = Number(event.target.value);
    const process: any = this.apiService.processList.find(
      (item) => id == item?.productOfProcess?.id
    );
    const processTemplate: any = await this.apiService.Get_Process_ById(
      process.id
    );
    this.setProcess(processTemplate);
    this.disableForm();
  }

  // New methods

  async onEditProcessDetails() {
    this.setIdsToNullOnEdit();
    this.enableForm();
    this.getprocessId.reset();
    this.getProductOfProcessId.reset();
  }

  async onSaveProcessDetails() {
    try {
      if (this.processForm?.invalid) {
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
        collectInvalidControls(this.processForm);

        if (invalidControls.length > 0) {
          this.toastr.error(
            `Please fill required fields: ${invalidControls
              .map(k => k.split('.').join(' → '))
              .join(', ')}`
          );
        } else {
          this.toastr.error('Please fill required fields.');
        }
        this.processForm.markAllAsTouched();
        // Reset finalSave if validation fails
        this.apiService.finalSave = true;
        this.templateProcessType.enable({
          emitEvent: false,
          onlySelf: true,
        });
        return;
      } else if (!this.checkIfUsedPercentSum() && this.usedToggle.value && this.templateProcessMaterialType.value != 'LOG_SHEET') {
        this.toastr.error('Sum of Used Percent should be 100');
        // Reset finalSave if validation fails
        this.apiService.finalSave = true;
        this.templateProcessType.enable({
          emitEvent: false,
          onlySelf: true,
        });
        return;
      } else {
        const templateFormValue: any = this.templateForm.getRawValue();
        if (!this.route.snapshot.params.id) {
          templateFormValue.productTemplateCalculator = null;
        }
        if (
          this.rawMaterialProcess?.invalid ||
          templateFormValue?.rawMaterialProcess?.processProducts?.length == 0
        ) {
          templateFormValue.rawMaterialProcess = null;
        }
        if (this.templateProcesses?.invalid) {
          templateFormValue.templateProcesses = [];
        }
        if (this.fixedProcess?.invalid) {
          templateFormValue.fixedProcess = null;
        }

        if (this.fixedProcess?.valid) {
          templateFormValue.fixedProcess.description =
            templateFormValue.description + '_Fixed';
        }

        if (
          this.rawMaterialProcess?.valid &&
          templateFormValue?.rawMaterialProcess?.processProducts?.length > 0
        ) {
          templateFormValue.rawMaterialProcess.productOfProcess.productMeta.description =
            templateFormValue.description + '_RawMaterial';
        }
        let res: any = await this.apiService.saveProcessList(templateFormValue);
        this.apiService.finalSave = true;
        let uomQuery = ``;
        this.componentUoms.controls.forEach((element) => {
          uomQuery =
            uomQuery +
            `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
            }`;
        });
        uomQuery = encodeURI(uomQuery);
        await this.apiService.Get_All_Product_List_Uom_Based(uomQuery);
        await this.apiService.Get_All_Processes(uomQuery);
        setTimeout(() => {
          this.templateForm.patchValue(res, {
            emitEvent: false,
            onlySelf: true,
          });
        }, 500);
        this.disableForm();
        this.templateForm.patchValue(res, {
          emitEvent: false,
          onlySelf: true,
        });
        this.isExistingProcess.setValue(true);
        this.templateProcessType.enable({
          emitEvent: false,
          onlySelf: true,
        });
      }
    } catch (err) {
      console.log(err);
      // Reset finalSave on error so UI is not stuck
      this.apiService.finalSave = true;
      this.templateProcessType.enable({
        emitEvent: false,
        onlySelf: true,
      });
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

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
    setTimeout(() => {
      this.calculateValues();
    }, 500);
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

  confirmEdit() {
    if (this.isProcessSaved) {
      this.enableForm();
    } else {
      const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Editing a Current Process',
          message: 'It will create a new process, Do you wanna proceed ? ',
        },
      });
      confirmDialog.afterClosed().subscribe((result) => {
        if (result === true) {
          this.onEditProcessDetails();
        } else {
          // nothing
        }
      });
    }
  }

  checkIfUsedPercentSum() {
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
  get sumOfWastePercent() {
    let sum = 0;
    this.getprocessProducts.controls.forEach((element) => {
      sum = sum + element.get('wastePercent').value;
    });
    return sum
  }



  deleteProcess() {
    this.deleteProcessEvent.emit();
  }

  calculateValues() {
    this.calculate.emit({ index: this.index });
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

  openProcessWasteModal() {
    this.dialog
      .open(ProcessWasteModalComponent, {
        data: {
          processForm: this.processForm,
          productList: this.apiService.allproductsListForProcess,
          calculate: this.calculate,
          index: this.index,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.calculateValues();
      });
  }

  get processCalculatorOptions() {
    return this.processForm.get('processCalculatorOptions') as UntypedFormArray;
  }

  // controls for uoms

  getAttribute(index: any, value: string): any {
    return this.getprocessProducts.controls[index].get(value);
  }

  getAttributeValue(index: number, attr: string) {
    return this.getAttribute(index, attr).get('attributeValue');
  }

  getUserConversionUom(index: number, attr: string) {
    return this.getAttribute(index, attr).get('userConversionUom');
  }

  getProductOfProcessAttribute(value: string): UntypedFormControl {
    return this.productOfProcess.get(value) as UntypedFormControl;
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

  getWastePercent(index: number) {
    return this.getAttribute(index, 'wastePercent');
  }

  getUsedPercent(index: number) {
    return this.getAttribute(index, 'usedPercent');
  }

  getSubProductId(index: number) {
    return this.getAttribute(index, 'subProductId');
  }

  // converted totals

  // Start Getters

  get processForm() {
    const control = this.process.get('process') as UntypedFormGroup;
    return control;
  }

  get getprocessDescription() {
    const control = this.process.get('process').get('description');
    return control;
  }
  get getProductOfProcessDescription() {
    const control = this.process
      .get('process')
      .get('productOfProcess')
      .get('productMeta')
      .get('description');
    return control;
  }

  get getProductOfProcessId() {
    const control = this.process
      .get('process')
      .get('productOfProcess')
      .get('id');
    return control;
  }
  get getprocessId() {
    const control = this.process.get('process').get('id');
    return control;
  }

  get getprocessProducts() {
    const control = <UntypedFormArray>(
      this.process.get('process').get('processProducts')
    );
    return control;
  }
  get getProcessConversionTypes() {
    const control = <UntypedFormArray>(
      this.process.get('process').get('processConversionTypes')
    );
    return control;
  }

  get productOfProcess() {
    const control = <UntypedFormGroup>(
      this.process.get('process').get('productOfProcess')
    );
    return control;
  }

  get totalCostUom() {
    return this.processForm
      .get('materialMetricCostSecondary')
      .get('userConversionUom');
  }

  get convertedTotalCost() {
    return this.processForm
      .get('materialMetricCostSecondary')
      .get('attributeValue');
  }

  get conversionCostUom() {
    return this.processForm
      .get('conversionMetricCostSecondary')
      .get('userConversionUom');
  }

  get convertedConversionCost() {
    return this.processForm
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

  get templateProcesses() {
    return this.templateForm.get('templateProcesses') as UntypedFormArray;
  }

  get templateProcessType() {
    return this.templateForm.get('templateProcessType') as UntypedFormControl;
  }

  get usedToggle() {
    return this.processForm.get('isLayerPercentageCalculated');
  }

  get isExistingProcess() {
    return this.process.get('isExistingProcess');
  }
  get metricCostUom() {
    return this.getprocessProducts.controls[0]
      ?.get('metricCost')
      .get('userConversionUom');
  }
  get priceUom() {
    return this.getprocessProducts.controls[0]
      ?.get('subProductMetricCost')
      .get('userConversionUom');
  }
  get densityUom() {
    return this.getprocessProducts.controls[0]
      ?.get('subProductDensity')
      .get('userConversionUom');
  }
  get avgDensityUom() {
    return this.getprocessProducts.controls[0]
      ?.get('density')
      .get('userConversionUom');
  }

  get usedWeightUom() {
    return this.getprocessProducts.controls[0]
      ?.get('usedWeight')
      .get('userConversionUom');
  }
  get usedWeight() {
    return this.getprocessProducts.controls[0]
      ?.get('usedWeight')
      .get('attributeValue');
  }

  get wasteWeightUom() {
    return this.getprocessProducts.controls[0]
      ?.get('wasteWeight')
      .get('userConversionUom');
  }
  get wasteWeight() {
    return this.getprocessProducts.controls[0]
      ?.get('wasteWeight')
      .get('attributeValue');
  }


  get rawMaterialProcess() {
    return this.templateForm.get('rawMaterialProcess');
  }

  get fixedProcess() {
    return this.templateForm.get('fixedProcess');
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



  trackByFn(index, item) {
    return index;
  }
  setToggle(value) {
    this.usedToggle.setValue(value)
  }

  resetUsedPercent() {
    this.getprocessProducts.controls.forEach((processproduct, i) => {
      processproduct.get('usedPercent').reset()
    });
  }

  changeUsedPercent() {
    const remainingPercent = 100 - this.sumOfUsedPercent
    if (remainingPercent <= 0) {
      this.calculateValues()
      return
    }
    this.addNewProcessProductControl(remainingPercent)
    this.calculateValues()
  }

  get templateProcessMaterialType() {
    return this.templateForm.get('templateProcessMaterialType');
  }

  changeTotalWasteWeight() {
    this.processForm.get('isTotalWasteAddedByUser').setValue(true)
    this.calculateValues()
  }


}
