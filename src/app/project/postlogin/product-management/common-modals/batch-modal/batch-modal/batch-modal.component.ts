import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/service/forms.service';
import { ApiService } from 'src/app/service/api.service';
import { UomService } from 'src/app/service/uom.service';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { NumberFormatterPipe } from '../../../../../../shared/pipes/number-formatter.pipe';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { DadyinSelectComponent } from '../../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-batch-modal',
    templateUrl: './batch-modal.component.html',
    styleUrls: ['./batch-modal.component.scss'],
    standalone: true,
    imports: [CdkDrag, CdkDragHandle, DadyinButtonComponent, MatTooltipModule, MatExpansionModule, FormsModule, ReactiveFormsModule, DadyinSelectComponent, MatTabsModule, NgFor, NgIf, NgClass, ExtendedModule, DatePipe, NumberFormatterPipe]
})
export class BatchModalComponent implements OnInit {

  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  batchForm: UntypedFormGroup = this.formsService.createBatchForm();
  isSaving = false;
  isEditMode = false;
  selectedTabIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BatchModalComponent>,
    private formsService: FormsService,
    public apiService: ApiService,
    private toastr: ToastrService,
    private uomService: UomService,
    public containerService: ContainerManagementService
  ) { }

  async ngOnInit() {
    this.containerService.Get_All_employees();

    this.isEditMode = this.data?.productionDetails?.id ? true : false;

    let uomQuery = ``;
    this.data.componentUoms.controls.forEach((element) => {
      uomQuery =
        uomQuery +
        `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
        }`;
    });
    uomQuery = encodeURI(uomQuery);
    await this.apiService.Get_All_Product_List_Uom_Based(uomQuery);
    if (this.data?.productionDetails) {
      this.patchBatchFormWithData(this.data.productionDetails);
    }

  }

  get templateProcessMaterialType() {
    return this.batchForm.get('templateProcessMaterialType');
  }

  /**
   * Patch the batchForm with production details, useful for reusing
   * when batch details are loaded by id or for initial dialog data.
   * @param preserveTabIndex - If true, preserves the selected tab index after patching
   */
  patchBatchFormWithData(productionDetails: any, preserveTabIndex: boolean = false) {
    const logProcesses = this.batchForm.get('logProcesses') as UntypedFormArray;
    // Defensive rewrite: ensure nested properties exist before assignment to avoid runtime error
    if (productionDetails?.fixedProcess) {
      if (typeof productionDetails.fixedProcess.isTotalWasteAddedByUser !== 'boolean') {
        productionDetails.fixedProcess.isTotalWasteAddedByUser = false;
      }
    }

    if (productionDetails?.rawMaterialProcess) {
      if (typeof productionDetails.rawMaterialProcess.isTotalWasteAddedByUser !== 'boolean') {
        productionDetails.rawMaterialProcess.isTotalWasteAddedByUser = false;
      }
    }
    // If preserving tab index, NEVER clear - always update in place
    if (preserveTabIndex) {
      // Ensure we have the right number of log processes
      const targetLength = productionDetails?.logProcesses?.length || 0;

      // Add or remove log processes to match target length
      while (logProcesses.length < targetLength) {
        logProcesses.push(this.formsService.createProcessForm());
      }
      while (logProcesses.length > targetLength) {
        logProcesses.removeAt(logProcesses.length - 1);
      }

      // Update existing controls without clearing
      productionDetails?.logProcesses?.forEach((logProcess: any, index: number) => {
        if (!logProcess?.process.isTotalWasteAddedByUser) {
          logProcess.process.isTotalWasteAddedByUser = false
        }
        if (index < logProcesses.length) {
          const existingLogProcess = logProcesses.at(index) as UntypedFormGroup;
          const process = existingLogProcess.get('process') as UntypedFormGroup;

          // Update processCalculatorOptions
          const processCalculatorOptions = process.get('processCalculatorOptions') as UntypedFormArray;
          this.updateFormArray(processCalculatorOptions, logProcess.process.processCalculatorOptions || [],
            () => this.formsService.createWasteOptionForm(), undefined, true);

          // Update processProducts
          const processProducts = process.get('processProducts') as UntypedFormArray;
          this.updateFormArray(processProducts, logProcess.process.processProducts || [],
            () => this.formsService.createBatchProcessProductForm(), (form, data) => {
              const processProductAttributeValues = form.get('processProductAttributeValues') as UntypedFormArray;
              this.updateFormArray(processProductAttributeValues, data.processProductAttributeValues || [],
                () => this.formsService.createAttributeForm(), undefined, true);
            }, true);

          // Update processConversionTypes
          const processConversionTypes = process.get('processConversionTypes') as UntypedFormArray;
          this.updateFormArray(processConversionTypes, logProcess.process.processConversionTypes || [],
            () => this.formsService.createProcessConversionTypeForm(), undefined, true);

          // Patch the logProcess form - use patchValue with emitEvent false to prevent unnecessary updates
          existingLogProcess.patchValue(logProcess, { emitEvent: false });
        }
      });
    } else {


      // Original behavior: clear and rebuild (for initial load or when structure changes)
      logProcesses.clear();
      productionDetails?.logProcesses?.forEach((logProcess: any, index: number) => {
        if (!logProcess?.process.isTotalWasteAddedByUser) {
          logProcess.process.isTotalWasteAddedByUser = false
        }
        const batchLogProcess = this.formsService.createProcessForm();
        const process = batchLogProcess.get('process') as UntypedFormGroup;

        const processCalculatorOptions = process.get('processCalculatorOptions') as UntypedFormArray;
        processCalculatorOptions.clear();
        logProcess.process.processCalculatorOptions?.forEach((processCalculatorOption: any, idx: number) => {
          processCalculatorOptions.push(this.formsService.createWasteOptionForm());
          processCalculatorOptions.at(idx).patchValue(processCalculatorOption);
        });

        const processProducts = process.get('processProducts') as UntypedFormArray;
        processProducts.clear();
        logProcess.process.processProducts?.forEach((processProduct: any, idx: number) => {
          const batchprocessProductForm = this.formsService.createBatchProcessProductForm();
          const processProductAttributeValues = batchprocessProductForm.get('processProductAttributeValues') as UntypedFormArray;
          processProductAttributeValues.clear();
          processProduct.processProductAttributeValues?.forEach((processProductAttributeValue: any, jdx: number) => {
            processProductAttributeValues.push(this.formsService.createAttributeForm());
            processProductAttributeValues.at(jdx).patchValue(processProductAttributeValue);
          });
          batchprocessProductForm.patchValue(processProduct);
          processProducts.push(batchprocessProductForm);
        });

        const processConversionTypes = process.get('processConversionTypes') as UntypedFormArray;
        processConversionTypes.clear();
        logProcess.process.processConversionTypes?.forEach((processConversionType: any, idx: number) => {
          processConversionTypes.push(this.formsService.createProcessConversionTypeForm());
          processConversionTypes.at(idx).patchValue(processConversionType);
        });

        logProcesses.push(batchLogProcess);
      });
    }

    if (productionDetails?.logDate) {
      const normalized = productionDetails.logDate.replace('Z', '');
      // trim to "yyyy-MM-ddTHH:mm" so datetime-local can patch
      productionDetails.logDate = normalized.slice(0, 16);
    }
    this.batchForm.patchValue(productionDetails, { emitEvent: false });
  }

  /**
   * Helper method to update FormArray without clearing if structure matches
   */
  private updateFormArray(
    formArray: UntypedFormArray,
    dataArray: any[],
    createFormFn: () => UntypedFormGroup,
    beforePatchFn?: (form: UntypedFormGroup, data: any) => void,
    preserveStructure: boolean = false
  ) {
    const targetLength = dataArray.length;

    if (preserveStructure) {
      // When preserving structure, add/remove items without clearing
      while (formArray.length < targetLength) {
        formArray.push(createFormFn());
      }
      while (formArray.length > targetLength) {
        formArray.removeAt(formArray.length - 1);
      }

      // Update existing controls
      dataArray.forEach((data, index) => {
        const form = formArray.at(index) as UntypedFormGroup;
        if (beforePatchFn) {
          beforePatchFn(form, data);
        }
        form.patchValue(data, { emitEvent: false });
      });
    } else {
      // If lengths match, update existing controls
      if (formArray.length === targetLength) {
        dataArray.forEach((data, index) => {
          const form = formArray.at(index) as UntypedFormGroup;
          if (beforePatchFn) {
            beforePatchFn(form, data);
          }
          form.patchValue(data, { emitEvent: false });
        });
      } else {
        // If lengths don't match, clear and rebuild
        formArray.clear();
        dataArray.forEach((data) => {
          const newForm = createFormFn();
          if (beforePatchFn) {
            beforePatchFn(newForm, data);
          }
          newForm.patchValue(data, { emitEvent: false });
          formArray.push(newForm);
        });
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }


  get logProcesses(): UntypedFormArray {
    return this.batchForm.get('logProcesses') as UntypedFormArray;
  }
  getprocessProducts(index: number) {
    const control = <UntypedFormArray>(
      this.logProcesses.at(index).get('process').get('processProducts')
    );
    return control;
  }
  getProcessConversionTypes(index: number) {
    const control = <UntypedFormArray>(
      this.logProcesses.at(index).get('process').get('processConversionTypes')
    );
    return control;
  }
  resetProduct(index: number, productIndex: number) {
    this.getprocessProducts(index).at(productIndex).get('productTypeId').setValue(null);
    this.getprocessProducts(index).at(productIndex).get('subProductId').setValue(null);
    this.getprocessProducts(index).at(productIndex).get('density').reset();
    this.getprocessProducts(index).at(productIndex).get('metricCost').reset();
    this.getprocessProducts(index).at(productIndex).get('subProductMetricCost').reset();
    this.getprocessProducts(index).at(productIndex).get('subProductDensity').reset();
    this.getprocessProducts(index).at(productIndex).get('usedPercent').setValue(0);
    this.getprocessProducts(index).at(productIndex).get('wastePercent').setValue(0);
  }

  getAttribute(index: number, productIndex: number, value: string): any {
    return this.getprocessProducts(index).at(productIndex).get(value) as UntypedFormControl;
  }

  getAttributeValue(index: number, productIndex: number, attr: string) {
    return this.getAttribute(index, productIndex, attr).get('attributeValue') as UntypedFormControl;
  }

  getUserConversionUom(index: number, productIndex: number, attr: string) {
    return this.getAttribute(index, productIndex, attr).get('userConversionUom') as UntypedFormControl;
  }

  async getProductData(event: any, index: number, productIndex: number) {
    let id: any = this.getprocessProducts(index).at(productIndex).value.id;
    const product: any = this.apiService.allproductsListForProcess.find(
      (item) => Number(event.target.value) == item?.id
    );

    this.getprocessProducts(index).at(productIndex).patchValue(product);
    this.getprocessProducts(index).at(productIndex).get('id').setValue(id);
    // set metric cost and density
    this.setProcessProductCostandDensity(index, product, productIndex);
    // Calculate values after product selection
    this.calculateValues();
  }

  setProcessProductCostandDensity(index: number, product: any, productIndex: number) {
    // set metric cost and density
    this.getprocessProducts(index).at(productIndex)
      .get('subProductMetricCost')
      .get('attributeValue')
      .setValue(product?.metricCost?.attributeValue);
  }

  // getFilteredProductsList(index: number, productIndex: number) {
  //   if (this.getAttribute(index, productIndex, 'productTypeId').value) {
  //     const data: any[] = this.apiService.filterArray(
  //       this.apiService.allproductsListForProcess,
  //       'productTypeId',
  //       Number(this.getAttribute(index, productIndex, 'productTypeId').value)
  //     );
  //     return data;
  //   } else {
  //     return this.apiService.allproductsListForProcess;
  //   }
  // }
  removeProcessProduct(index: number, productIndex: number) {
    this.getprocessProducts(index).removeAt(productIndex);
    this.calculateValues();
  }
  addNewProcessProductControl(index: number, productIndex: number) {
    this.getprocessProducts(index).push(this.formsService.createBatchProcessProductForm());
  }

  saveBatch() {
    // if (this.batchForm.invalid) {
    //   this.batchForm.markAllAsTouched();
    //   console.log(this.batchForm);
    //   this.toastr.error('Please fill all the required fields');
    //   return;
    // }

    const payload = this.batchForm.getRawValue();

    if (payload?.logDate && typeof payload.logDate === 'string') {
      const hasTime = payload.logDate.includes('T') && payload.logDate.length >= 16;
      const iso = hasTime
        ? new Date(payload.logDate).toISOString()
        : `${payload.logDate}T00:00:00Z`;
      // backend expects no milliseconds; trim 2025-12-12T11:26:00Z
      payload.logDate = iso.replace(/\.\d{3}Z$/, 'Z');
    }

    this.isSaving = true;
    const save$ = this.apiService.saveProductionLog(payload);

    save$.subscribe({
      next: (response: any) => {
        this.toastr.success(this.isEditMode ? 'Batch updated successfully' : 'Batch saved successfully');
        this.dialogRef.close(response);
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err?.error?.userMessage || 'Error saving batch details');
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  removeConversionType(index: number, conversionTypeIndex: number) {
    this.getProcessConversionTypes(index).removeAt(conversionTypeIndex);
    this.calculateValues();
  }
  addNewConversionType(index: number) {
    this.getProcessConversionTypes(index).push(this.formsService.createProcessConversionTypeForm());
  }

  calculateValues() {
    const payload = this.batchForm.getRawValue();

    if (payload?.logDate && typeof payload.logDate === 'string') {
      const hasTime = payload.logDate.includes('T') && payload.logDate.length >= 16;
      const iso = hasTime
        ? new Date(payload.logDate).toISOString()
        : `${payload.logDate}T00:00:00Z`;
      // backend expects no milliseconds; trim 2025-12-12T11:26:00Z
      payload.logDate = iso.replace(/\.\d{3}Z$/, 'Z');
    }
    const calculate$ = this.apiService.calculateProductionLogValues(payload);
    calculate$.subscribe({
      next: (response: any) => {
        // Preserve tab index when patching after calculation
        this.patchBatchFormWithData(response, true);
        this.toastr.success('Batch details calculated successfully');
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.userMessage || 'Error calculating batch details');
      }
    });
  }

  onSelectOption(event: any) {
    this.calculateValues();
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  trackByLogProcess(index: number, item: any): any {
    return index;
  }



  getSumOfUsedPercent(index: number) {
    let sum = 0;
    this.getprocessProducts(index).controls.forEach((element) => {
      sum = sum + element.get('usedPercent').value;
    });
    return sum
  }
  getSumOfWastePercent(index: number) {
    let sum = 0;
    this.getprocessProducts(index).controls.forEach((element) => {
      sum = sum + element.get('wastePercent').value;
    });
    return sum
  }

  changeTotalWasteWeight(index: number) {
    this.logProcesses.at(index).get('process').get('isTotalWasteAddedByUser').setValue(true)
    this.calculateValues()
  }

}
