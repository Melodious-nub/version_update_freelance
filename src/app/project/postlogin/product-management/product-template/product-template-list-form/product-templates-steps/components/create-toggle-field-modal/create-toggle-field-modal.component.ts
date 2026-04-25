import { Component, Inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';


@Component({
    selector: 'app-create-toggle-field-modal',
    templateUrl: './create-toggle-field-modal.component.html',
    styleUrls: ['./create-toggle-field-modal.component.scss'],
    imports: [
        MatDialogClose,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class CreateToggleFieldModalComponent {
  attributeValueExpression = this.fb.array([]);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { attributeName: UntypedFormControl; attributeType: any },
    public fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateToggleFieldModalComponent>
  ) {
    this.attributeValueExpression.clear();
    for (let index = 0; index < 2; index++) {
      this.attributeValueExpression.push(this.createAttributeExpression());
    }
  }

  createAttributeExpression() {
    return this.fb.group({
      choice: [''],
      attributeValueExpression: [''],
      userConversionUom: ['Number'],
      selected: [false]
    });
  }

  onCancel() {
    this.attributeValueExpression.clear();
  }

  onConfirm() {
    let data = {
      attributeName: this.data.attributeName.value,
      attributeValueExpression: JSON.stringify(
        this.attributeValueExpression.value
      ),
      attributeType: this.data.attributeType,
    };
    this.attributeValueExpression.clear();

    this.dialogRef.close(data);
  }
}
