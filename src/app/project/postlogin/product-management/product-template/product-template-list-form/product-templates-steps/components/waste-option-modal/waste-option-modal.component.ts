import { Component, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';

@Component({
    selector: 'app-waste-option-modal',
    templateUrl: './waste-option-modal.component.html',
    styleUrls: ['./waste-option-modal.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogClose,
    ]
})
export class WasteOptionModalComponent {
  data = inject<{
    processForm: any;
}>(MAT_DIALOG_DATA);
  apiService = inject(ApiService);
  formsService = inject(FormsService);
  dialogRef = inject<MatDialogRef<WasteOptionModalComponent>>(MatDialogRef);

  formulaValue = '';
  wasteOptionform: any
  currentControl: any;
  constructor() {
    this.wasteOptionform = this.formsService.createWasteOptionForm()
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
