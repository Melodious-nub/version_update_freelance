import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { WasteOptionModalComponent } from '../waste-option-modal/waste-option-modal.component';

@Component({
  selector: 'app-process-waste-modal',
  templateUrl: './process-waste-modal.component.html',
  styleUrls: ['./process-waste-modal.component.scss'],
})
export class ProcessWasteModalComponent implements OnInit {
  calculateOptionForm: UntypedFormGroup = this.formsService.calculateOptionsForm();
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { processForm: UntypedFormGroup; calculate: any; index: any },
    public apiService: ApiService,
    public formsService: FormsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.calculateWasteOptions(true);
  }

  async calculateWasteOptions(first: any) {
   
    if (first) {
      const resp = {
        wastePercent: this.data.processForm.getRawValue().processWastePercent,
        cost: this.data.processForm.getRawValue().productOfProcess.metricCost          .attributeValue,
        density: this.data.processForm.getRawValue().productOfProcess.density.attributeValue,

        processProductCalculators: [
          {
            usedPercent: 50,
            wastePercent: this.data.processForm.getRawValue().processWastePercent,
            cost: this.data.processForm.getRawValue().processProducts[0]?.subProductMetricCost?.attributeValue ?? 1000,
            density:this.data.processForm.getRawValue().processProducts[0]?.subProductDensity?.attributeValue ?? 0.5,
            productCalculatorOptions: this.processCalculatorOptions.value,
          },
          {
            usedPercent: 50,
            wastePercent: this.data.processForm.getRawValue().processWastePercent,
            cost: this.data.processForm.getRawValue().processProducts[1]?.subProductMetricCost?.attributeValue ?? 1000,
            density:this.data.processForm.getRawValue().processProducts[1]?.subProductDensity?.attributeValue ?? 0.5,
            productCalculatorOptions: this.processCalculatorOptions.value,
          },
        ],
      };
      this.calculateOptionForm.patchValue(resp);
    }

    this.getProductCalculatorOptions(0).patchValue(this.processCalculatorOptions.value)
    this.getProductCalculatorOptions(1).patchValue(this.processCalculatorOptions.value)

    let data: any = this.calculateOptionForm.getRawValue();
    const res: any = await this.apiService
      .calculate_waste_options(data)
      .toPromise();
    this.calculateOptionForm.patchValue(res);
   
  }

  get processCalculatorOptions() {
    return this.data.processForm.get('processCalculatorOptions') as UntypedFormArray;
  }



  removeProcessCalculatorOption(i) {
    this.processCalculatorOptions.removeAt(i);
  }

  addProcessCalculatorOptionForm() {
    this.processCalculatorOptions.push(
      this.formsService.createWasteOptionForm()
    );
  }

  openProcessWasteOptionModal() {
    this.dialog
      .open(WasteOptionModalComponent, {
        data: {
          processForm: this.data.processForm,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.calculateWasteOptions(false);
        }
      });
  }

  selectOption(processCalculatorOption) {
    this.processCalculatorOptions?.controls.forEach((item) => {
      item.get('isSelected').setValue(false);
    });
    processCalculatorOption.get('isSelected').setValue(true);
  }

  manageUsedPercent(j, event: any) {
    if (j == 0) {
      this.processProductCalculators.controls[1]
        .get('usedPercent')
        .setValue(100 - event.target.value);
      this.calculateWasteOptions(false);
    } else if (j == 1) {
      this.processProductCalculators.controls[0]
        .get('usedPercent')
        .setValue(100 - event.target.value);
      this.calculateWasteOptions(false);
    }
  }

  get processProductCalculators() {
    return this.calculateOptionForm.get(
      'processProductCalculators'
    ) as UntypedFormArray;
  }


  getProductCalculatorOptions(i) {
    return this.processProductCalculators.controls[i].get("productCalculatorOptions") as UntypedFormArray
  }


  getProductLabel(j:any) {
    // const product = this.apiService.allproductsListFull.find(item=>item.id==this.data.processForm.getRawValue().processProducts[j]?.subProductId)
    return ('Product ' + (j+1))
  }



}
