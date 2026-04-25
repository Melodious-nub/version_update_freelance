import {
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { TemplateCalculatorComponent } from './product-templates-steps/template-calculator/template-calculator.component';
import { TemplateProcessComponent } from './product-templates-steps/template-process/template-process.component';
import { TemplateInfoComponent } from './product-templates-steps/template-info/template-info.component';
import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-product-template-list-form',
    templateUrl: './product-template-list-form.component.html',
    styleUrls: ['./product-template-list-form.component.scss'],
    imports: [
        DadyinButtonComponent,
        NgClass,
        ExtendedModule,
        MatTooltip,
        FormsModule,
        ReactiveFormsModule,
        MatTabGroup,
        MatTab,
        TemplateInfoComponent,
        MatTabLabel,
        TemplateProcessComponent,
        TemplateCalculatorComponent
    ]
})
export class ProductTemplateListFormComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.uomSetting = false;
  }

  // ************* Variable Declarations *************
  currentStepIndex = 0;
  uomSetting = false;
  public templateForm = this.formsService.createTemplateForm();

  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();

  constructor(
    public apiService: ApiService,
    public uomService: UomService,
    private formsService: FormsService,
    private route: ActivatedRoute,
    public router: Router,
    public toastr: ToastrService,
    private dialog: MatDialog,
    public commonService: CommonService
  ) { }

  async ngOnInit() {
    // Reset global save flag on entry so UI controls start enabled
    this.apiService.finalSave = true;
    this.getPreference();
    this.apiService.getAllDatas();
    if (this.editMode) {
      this.SetEditData();
    }
    this.setDefaultUoms();
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForContainer = this.preferredUoms.find(
        (item) => item.componentType == 'PRODUCT_TEMPLATE'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      if (!this.editMode) {
        this.onGlobalUomChange(null, true);
      }
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  async SetEditData() {
    try {
      const templateId: any = this.route.snapshot.params.id;
      const data = await this.apiService
        .Get_Single_Product_Template(templateId)
        .toPromise();
      this.patchEditData(data, false);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async onClickNext() {
    this.currentStepIndex++;
  }

  public onClickBack(): void {
    if (this.currentStepIndex >= 1) {
      this.currentStepIndex--;
    }
  }

  async calculateValues(event?: any) {
    try {
      let templateFormValue: any = this.templateForm?.getRawValue();

      if (this.rawMaterialProcess?.invalid) {
        templateFormValue.rawMaterialProcess = null;
      }
      if (this.fixedProcess?.invalid) {
        templateFormValue.fixedProcess = null;
      }

      const res: any = await this.apiService
        .calculateTemplateValues(templateFormValue)
        .toPromise();
      this.patchEditData(res, true, templateFormValue, event);
    } catch (err) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  get inDraftMode() {
    return this.templateForm.get('inDraftMode');
  }

  async onClickSave(draftMode) {
    // Store previous status in case of error
    const prevStatus = this.templateForm.get('status').value;
    try {
      this.templateForm.get('inDraftMode').setValue(draftMode);

      // Set status based on draftMode
      if (draftMode) {
        this.templateForm.get('status').setValue('DRAFT');
      } else {
        this.templateForm.get('status').setValue('PUBLISHED');
      }

      if (
        this.templateForm.get('templateCode').invalid ||
        this.templateForm.get('templateName').invalid
      ) {
        this.markTouchTemplateForm();
        const invalidControlNames = this.commonService.findInvalidControlNames(this.templateForm);
        this.toastr.error('Fields Invalid: ' + invalidControlNames);
      }

      if (this.isValidTemplateForm() || draftMode) {
        this.markTouchTemplateForm();
        let templateFormValue = this.templateForm.getRawValue();
        if (this.templateProcesses?.invalid) {
          templateFormValue.templateProcesses = [];
        }
        if (this.rawMaterialProcess?.invalid) {
          templateFormValue.rawMaterialProcess = null;
        }
        if (this.fixedProcess?.invalid) {
          templateFormValue.fixedProcess = null;
        }

        if (this.fixedProcess?.valid) {
          templateFormValue.fixedProcess.description = templateFormValue.description + '_Fixed';
        }
        if (this.rawMaterialProcess?.valid) {
          templateFormValue.rawMaterialProcess.description = templateFormValue.rawMaterialProcess.description
            ? templateFormValue.rawMaterialProcess.description
            : templateFormValue.description + '_RawMaterial';
          templateFormValue.rawMaterialProcess.productOfProcess.productMeta.description =
            templateFormValue.rawMaterialProcess.productOfProcess.productMeta.description
              ? templateFormValue.rawMaterialProcess.productOfProcess.productMeta.description
              : templateFormValue.description + '_RawMaterial';
        }
        try {
          const templateResponse = await this.apiService.saveTemplateInfo(templateFormValue);
          this.patchEditData(templateResponse, false, null, null, true);
          this.toastr.success('Saved Successfully');
        } catch (err: any) {
          // Reset status if API save fails
          this.templateForm.get('status').setValue(prevStatus);
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      } else {
        this.markTouchTemplateForm();
        const invalidControlNames = this.commonService.findInvalidControlNames(this.templateForm);
        this.toastr.error('Fields Invalid: ' + invalidControlNames);
      }
    } catch (err: any) {
      // Reset status if any unexpected error happens above
      this.templateForm.get('status').setValue(prevStatus);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }





  async patchEditData(
    editData: any,
    calculate: any,
    oldData?: any,
    event?: any,
    save?: any
  ) {
    try {
      if (!calculate && !save) {
        this.setGlobalUoms(editData);
      }

      let productCalculatorTemplateAttributeValues = this.templateForm
        .get('productTemplateCalculator')
        .get('productCalculatorTemplateAttributeValues') as UntypedFormArray;
      productCalculatorTemplateAttributeValues.clear();
      editData?.productTemplateCalculator?.productCalculatorTemplateAttributeValues?.forEach(
        (item) => {
          productCalculatorTemplateAttributeValues.push(
            this.formsService.createProductCalculatorTemplateAttributeForm()
          );
        }
      );

      let packageCalculatorTemplates = this.templateForm
        .get('productTemplateCalculator')
        .get('packageCalculatorTemplates') as UntypedFormArray;

      packageCalculatorTemplates.clear();

      for (
        let index = 0;
        index <
        editData?.productTemplateCalculator?.packageCalculatorTemplates?.length;
        index++
      ) {
        packageCalculatorTemplates.push(
          this.formsService.createPackageCalculatorTemplates()
        );
        let packageCalculatorTemplateAttributeValues =
          packageCalculatorTemplates.controls[index].get(
            'packageCalculatorTemplateAttributeValues'
          ) as UntypedFormArray;
        packageCalculatorTemplateAttributeValues.clear();
        for (
          let index2 = 0;
          index2 <
          editData?.productTemplateCalculator?.packageCalculatorTemplates[index]
            .packageCalculatorTemplateAttributeValues?.length;
          index2++
        ) {
          packageCalculatorTemplateAttributeValues.push(
            this.formsService.createPackageCalculatorTemplateAttributeValues()
          );
        }
      }

      this.templateProcesses.clear();
      // Avoid possible errors by safer property checks
      if (editData?.fixedProcess) {
        if (typeof editData.fixedProcess.isTotalWasteAddedByUser !== 'boolean') {
          editData.fixedProcess.isTotalWasteAddedByUser = false;
        }
      }

      if (editData?.rawMaterialProcess) {
        if (typeof editData.rawMaterialProcess.isTotalWasteAddedByUser !== 'boolean') {
          editData.rawMaterialProcess.isTotalWasteAddedByUser = false;
        }
      }
      editData?.templateProcesses?.forEach(async (processData: any, index) => {
        const processForm = this.formsService.createProcessForm();
        if (calculate) {
          processForm
            .get('isExistingProcess')
            .patchValue(oldData?.templateProcesses[index]?.isExistingProcess);

        }

        this.templateProcesses.push(processForm);

        let processProducts = this.templateProcesses.controls[index]
          .get('process')
          .get('processProducts') as UntypedFormArray;
        processProducts.clear();

        processData?.process?.processProducts?.forEach(
          async (processProduct, j) => {
            const processProductForm =
              this.formsService.createProcessProductForm();

            const processProductAttributeValues = processProductForm.get(
              'processProductAttributeValues'
            ) as UntypedFormArray;

            processProduct?.processProductAttributeValues?.forEach(
              (processProductAttributeValue) => {
                processProductAttributeValues.push(
                  this.formsService.createAttributeForm()
                );
              }
            );
            processProducts.push(processProductForm);
            const product: any = await this.apiService.Get_Product_ById(
              processProduct.subProductId
            );
            processProducts.controls[j]
              .get('productTypeId')
              .patchValue(product?.productTypeId);
          }
        );

        let processConversionTypes = this.templateProcesses.controls[index]
          .get('process')
          .get('processConversionTypes') as UntypedFormArray;
        processConversionTypes.clear();
        processData?.process?.processConversionTypes?.forEach((element, k) => {
          processConversionTypes.push(
            this.formsService.createConversionTypeForm()
          );
        });

        let processCalculatorOptions = this.templateProcesses.controls[index]
          .get('process')
          .get('processCalculatorOptions') as UntypedFormArray;
        processCalculatorOptions.clear();
        processData?.process?.processCalculatorOptions?.forEach(
          (element, k) => {
            processCalculatorOptions.push(
              this.formsService.createWasteOptionForm()
            );
          }
        );

        if (!processData.process.isTotalWasteAddedByUser) {
          processData.process.isTotalWasteAddedByUser = false
        }
      });

      let rawMaterialprocessProducts = this.rawMaterialProcess.get(
        'processProducts'
      ) as UntypedFormArray;
      rawMaterialprocessProducts.clear();
      editData?.rawMaterialProcess?.processProducts?.forEach(
        async (processProduct: any, j) => {
          const processProductForm =
            this.formsService.createProcessProductForm();
          const processProductAttributeValues = processProductForm.get(
            'processProductAttributeValues'
          ) as UntypedFormArray;
          processProduct.processProductAttributeValues.forEach(
            (processProductAttributeValue) => {
              processProductAttributeValues.push(
                this.formsService.createAttributeForm()
              );
            }
          );
          rawMaterialprocessProducts.push(processProductForm);
          const selectedProduct: any = await this.apiService.Get_Product_ById(
            processProduct.subProductId
          );
          // const selectedProduct: any = this.apiService.allproductsListForProcess.find(
          //   (item) => processProduct.subProductId == item?.id
          // );
          rawMaterialprocessProducts.controls[j]
            .get('productTypeId')
            .patchValue(selectedProduct?.productTypeId);
        }
      );

      let rawMaterialprocessConversionTypes = this.rawMaterialProcess.get(
        'processConversionTypes'
      ) as UntypedFormArray;
      rawMaterialprocessConversionTypes.clear();
      editData?.rawMaterialProcess?.processConversionTypes?.forEach(
        async (conversionType: any, index) => {
          const processConversionTypeForm =
            this.formsService.createConversionTypeForm();
          rawMaterialprocessConversionTypes.push(processConversionTypeForm);
        }
      );

      let processCalculatorOptions = this.rawMaterialProcess.get(
        'processCalculatorOptions'
      ) as UntypedFormArray;
      processCalculatorOptions.clear();
      editData?.rawMaterialProcess?.processCalculatorOptions?.forEach(
        (element, k) => {
          processCalculatorOptions.push(
            this.formsService.createWasteOptionForm()
          );
        }
      );

      this.templateForm.get('templateCost').reset();
      this.templateForm.get('templateDensity').reset();
      this.templateForm.patchValue(editData, {
        emitEvent: false,
        onlySelf: true,
      });
      this.templateForm
        .get('industryTypeId')
        .setValue(editData?.industryTypeId);
      this.templateForm
        .get('industrySubTypeId')
        .setValue(editData?.industrySubTypeId);
      this.templateProcesses.disable();
      if (event) {
        this.templateProcesses.controls[event.index].enable();
      }
      if (!this.templateProcessType.value) {
        this.templateProcessType.setValue('PROCESS');
      }
      if (!this.templateForm.get('templateProcessMaterialType')?.value) {
        this.templateForm.get('templateProcessMaterialType').setValue('FIXED_MATERIAL');
      }
      // Mark all fields as touched in edit mode to show validation immediately
      if (this.editMode && !calculate) {
        this.templateForm.markAllAsTouched();
      }
    } catch (err) { }
  }

  isValidTemplateForm() {
    return (
      this.templateForm.get('templateCode').valid &&
      this.templateForm.get('templateName').valid &&
      this.templateForm.get('description').valid &&
      this.templateForm.get('industryTypeId').valid &&
      this.templateForm.get('industrySubTypeId').valid
    );
  }
  markTouchTemplateForm() {
    this.templateForm.get('templateCode').markAsTouched();
    this.templateForm.get('templateName').markAsTouched();
    this.templateForm.get('description').markAsTouched();
    this.templateForm.get('industryTypeId').markAsTouched();
    this.templateForm.get('industrySubTypeId').markAsTouched();
  }

  get editMode() {
    if (this.route.snapshot.params.id) {
      return true;
    } else {
      return false;
    }
  }

  get templateProcessType() {
    return this.templateForm.get('templateProcessType');
  }

  get templateProcesses() {
    return this.templateForm.get('templateProcesses') as UntypedFormArray;
  }

  get rawMaterialProcess() {
    return this.templateForm.get('rawMaterialProcess');
  }

  get fixedProcess() {
    return this.templateForm.get('fixedProcess');
  }

  getUomName(attributeName: string) {
    const attribute = this.apiService.allAttributes.find(
      (item) =>
        item.description?.replace(/\s/g, '')?.toUpperCase() ==
        attributeName?.toUpperCase()
    );
    return attribute?.description ?? '';
  }

  setDefaultUoms() {
    this.templateProcessType.valueChanges.subscribe((res) => {
      const componentUoms: any = this.componentUoms.getRawValue();
      if (res === 'RAW_MATERIAL') {
        componentUoms.forEach((element) => {
          if (element.attributeName?.toUpperCase() == 'METRICCOST') {
            this.rawMaterialProcess
              .get('materialMetricCost')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('materialMetricCostSecondary')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('conversionMetricCost')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('conversionMetricCostSecondary')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('productOfProcess')
              .get('metricCost')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('productOfProcess')
              .get('metricCostSecondary')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
          }
          if (element.attributeName?.toUpperCase() == 'DENSITY') {
            this.rawMaterialProcess
              .get('productOfProcess')
              .get('density')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
            this.rawMaterialProcess
              .get('productOfProcess')
              .get('densitySecondary')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
          }
        });
        this.calculateValues();
      } else if (res === 'FIXED') {
        componentUoms.forEach((element) => {
          if (element.attributeName?.toUpperCase() == 'METRICCOST') {
            this.fixedProcess
              .get('materialMetricCost')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);

            this.fixedProcess
              .get('conversionMetricCost')
              .get('userConversionUom')
              .setValue(element?.userConversionUom);
          }
        });
        this.calculateValues();
      } else {
        this.calculateValues();
      }
    });
  }

  replaceUserConversionUOM(obj: any, value: any, parentObjName: string = null) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const childObj = obj[key];
        if (typeof childObj === 'object' && childObj !== null) {
          this.replaceUserConversionUOM(childObj, value, key);
        } else if (
          key === 'userConversionUom' &&
          (parentObjName === null || obj.hasOwnProperty(parentObjName))
        ) {
          obj[key] = value;
        }
      }
    }

    return obj;
  }

  async onGlobalUomChange(event: any, ext?: any, editData?: any) {
    if (event?.target?.value || ext) {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      await this.apiService.Get_All_Product_List_Uom_Based(uomQuery);
      await this.apiService.Get_All_Processes(uomQuery);
    } else {
      return;
    }
  }

  setGlobalUoms(editData) {
    if (editData?.templateProcesses?.length > 0) {
      const metricCost = this.componentUoms.controls.find(
        (item) => item.value.attributeName?.toUpperCase() == 'METRICCOST'
      );
      if (!metricCost) {
        return;
      }
      metricCost
        .get('userConversionUom')
        .setValue(
          editData?.templateProcesses[0].process.productOfProcess.metricCost
            .userConversionUom
        );
      const density = this.componentUoms.controls.find(
        (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
      );
      density
        .get('userConversionUom')
        .setValue(
          editData?.templateProcesses[0].process.productOfProcess.density
            .userConversionUom
        );
      this.onGlobalUomChange(null, true, editData);
    } else if (this.editMode && editData?.templateProcesses?.length == 0) {
      this.onGlobalUomChange(null, true);
    }
  }

  markAsTouched(event) {
    if (
      event.target.innerText == 'Calculator' ||
      event.target.innerText == 'Processes'
    ) {
      this.templateForm.markAllAsTouched();
    }
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteTemplate();
        }
      });
  }

  async deleteTemplate() {
    try {
      const templateId: any = this.route.snapshot.params.id;
      const data = await this.apiService
        .delete_Product_Template(templateId)
        .toPromise();
      this.toastr.success('Successfully Deleted');
      this.router.navigateByUrl('/home/product-management/product-template');
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  goBack() {
    if (this.templateForm.dirty) {
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '25%',
        })
        .afterClosed()
        .subscribe(async (res) => {
          if (res) {
            this.router.navigateByUrl(
              '/home/product-management/product-template'
            );
          }
        });
    } else {
      this.router.navigateByUrl('/home/product-management/product-template');
    }
  }
}
