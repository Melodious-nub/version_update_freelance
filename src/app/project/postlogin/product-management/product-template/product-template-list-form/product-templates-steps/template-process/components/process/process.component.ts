import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { EditProcessComponent } from './edit-process/edit-process.component';
import { ProcessListComponent } from './process-list/process-list.component';
import { DadyinButtonComponent } from '../../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-create-process',
    templateUrl: './process.component.html',
    styleUrls: ['./process.component.scss'],
    standalone: true,
    imports: [
    NgClass,
    ExtendedModule,
    DadyinButtonComponent,
    ProcessListComponent,
    EditProcessComponent
],
})
export class ProcessComponent implements OnInit {
  // ************* Variable Declarations *************
  @Input() public templateForm: UntypedFormGroup;
  @Input() componentUoms: any;

  isShowProcessList: boolean = false;
  isExpandAll: boolean = true;

  constructor(
    public apiService: ApiService,
    private formsService: FormsService,
    public uomService: UomService,
    public route: ActivatedRoute,
    public toastr: ToastrService
  ) { }

  @Output() calculate = new EventEmitter();

  calculateValues(event: any) {
    this.calculate.emit(event);
  }

  ngOnInit(): void { }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }
  get templateProcessType() {
    return this.templateForm.get('templateProcessType');
  }
  async createNewProcess(existing: boolean) {
    try {
      const processForm = this.formsService.createProcessForm();
      this.apiService.finalSave = false;
      this.templateProcessType.disable({ onlySelf: true, emitEvent: false });
      if (existing) {
        this.templateProcesses.push(processForm);
      } else {
        processForm.get('isExistingProcess').setValue(false);
        processForm
          .get('process')
          .get('materialMetricCost')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('materialMetricCostSecondary')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('conversionMetricCost')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('conversionMetricCostSecondary')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('cost')
          .get('userConversionUom')
          .setValue(this.getUomByName('cost'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('weight')
          .get('userConversionUom')
          .setValue(this.getUomByName('weight'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('metricCost')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('metricCostSecondary')
          .get('userConversionUom')
          .setValue(this.getUomByName('metricCost'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('density')
          .get('userConversionUom')
          .setValue(this.getUomByName('density'));
        processForm
          .get('process')
          .get('productOfProcess')
          .get('densitySecondary')
          .get('userConversionUom')
          .setValue(this.getUomByName('density'));

        let length = this.templateProcesses.controls.length;
        if (length > 0) {
          let productOfProcess = this.templateProcesses?.controls[length - 1]
            ?.get('process')
            ?.get('productOfProcess').value;
          let processData=  this.templateProcesses?.controls[length - 1]
          ?.get('process').value;
          let processProducts = processForm
            ?.get('process')
            ?.get('processProducts') as UntypedFormArray;
          const processProductForm =
            this.formsService.createProcessProductForm();
          processProductForm
            .get('sortOrder')
            .patchValue(processProducts.controls.length);

          processProducts.push(processProductForm);
          let firstProcessProduct = processProducts.controls[0];
          if (firstProcessProduct) {
            firstProcessProduct
              .get('productTypeId')
              .setValue(productOfProcess?.productTypeId);
            firstProcessProduct
              .get('subProductId')
              .setValue(productOfProcess?.id);
            firstProcessProduct
              .get('metricCost')
              .get('userConversionUom')
              .setValue(productOfProcess?.metricCost?.userConversionUom);
            firstProcessProduct
              .get('density')
              .get('userConversionUom')
              .setValue(productOfProcess?.density?.userConversionUom);
            firstProcessProduct
              .get('subProductMetricCost')
              .get('attributeValue')
              .setValue(productOfProcess?.metricCost?.attributeValue);
            firstProcessProduct
              .get('subProductMetricCost')
              .get('userConversionUom')
              .setValue(productOfProcess?.metricCost?.userConversionUom);
            firstProcessProduct
              .get('subProductDensity')
              .get('attributeValue')
              .setValue(productOfProcess?.density?.attributeValue);
            firstProcessProduct
              .get('subProductDensity')
              .get('userConversionUom')
              .setValue(productOfProcess?.density?.userConversionUom);
              
              firstProcessProduct.get('usedWeight').get('attributeValue').setValue(processData.totalNetWeight.attributeValue);
              firstProcessProduct.get('usedWeight').get('userConversionUom').setValue(processData.totalNetWeight?.userConversionUom);
              // firstProcessProduct.get('wasteWeight').get('attributeValue').setValue(processData.totalWaste.attributeValue);
              // firstProcessProduct.get('wasteWeight').get('userConversionUom').setValue(processData.totalWaste?.userConversionUom);
          }
        }
        this.templateProcesses.push(processForm);
      }
      processForm
        .get('sortOrder')
        .patchValue(this.templateProcesses.controls.length);
      this.calculateValues({ index: this.templateProcesses.length - 1 });
    } catch (err) {
      console.log(err);
      // If anything fails we must re-enable final save so UI is not stuck
      this.apiService.finalSave = true;
      this.toastr.error(err?.error?.userMessage ?? 'Someting went wrong');
    }
  }

  removeProcess(i) {
    this.templateProcesses.removeAt(i);
    this.apiService.finalSave = true;
    this.templateProcessType.enable();
  }

  get templateProcesses() {
    return this.templateForm.get('templateProcesses') as UntypedFormArray;
  }

  getTemplateCost() {
    return (
      (this.templateForm.get('templateCost').get('attributeValue').value ??
        '') +
      ' ' +
      (this.templateForm.get('templateCost').get('userConversionUom').value ??
        '')
    );
  }

  getTemplateDensity() {
    return (
      (this.templateForm.get('templateDensity').get('attributeValue').value ??
        '') +
      ' ' +
      (this.templateForm.get('templateDensity').get('userConversionUom')
        .value ?? '')
    );
  }

  get templateProcessMaterialType() {
    return this.templateForm.get('templateProcessMaterialType');
  }

  setTemplateProcessMaterialType(type: string) {
    this.templateProcessMaterialType.setValue(type);
    if (type == 'FIXED_MATERIAL') {
      this.templateProcesses?.controls?.forEach(processCtrl => {
        const processGroup = processCtrl.get('process');
        const processProducts = processGroup.get('processProducts') as UntypedFormArray;
        processProducts.controls.forEach(processProductCtrl => {
          processProductCtrl.get('usedWeight').get('attributeValue').setValue(null);
          processProductCtrl.get('usedWeight').get('userConversionUom').setValue(null);
        });
      });
    }
  }


  





}
