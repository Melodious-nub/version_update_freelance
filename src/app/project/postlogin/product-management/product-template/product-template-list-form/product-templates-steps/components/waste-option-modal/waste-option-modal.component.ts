import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';

@Component({
    selector: 'app-waste-option-modal',
    templateUrl: './waste-option-modal.component.html',
    styleUrls: ['./waste-option-modal.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogClose,
    ],
})
export class WasteOptionModalComponent implements OnInit {
  formulaValue = '';
  wasteOptionform: any
  currentControl: any;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { processForm: any },
    public apiService: ApiService,
    public formsService: FormsService,
    public dialogRef: MatDialogRef<WasteOptionModalComponent>
  ) {
    this.wasteOptionform = this.formsService.createWasteOptionForm()
  }

  ngOnInit(): void {
  }

  formula(item: UntypedFormControl) {
    this.currentControl = item;
    this.formulaValue = item.value;
  }
  setFormula() {
    if (this.currentControl) {
      this.currentControl.setValue(this.formulaValue);
    }

  }
  resetFormula() {
    this.formulaValue = '';
  }

  get processCalculatorOptions() {
    return this.data.processForm.get('processCalculatorOptions') as UntypedFormArray;
  }

  removeProcessCalculatorOption(i) {
    this.processCalculatorOptions.removeAt(i);
  }

  addProcessCalculatorOptionForm() {
    this.processCalculatorOptions.push(this.wasteOptionform);
    this.dialogRef.close(true)
  }



}
