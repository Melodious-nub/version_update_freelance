import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { DadyinButtonComponent } from '../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';


@Component({
    selector: 'app-create-dropdown-field-modal',
    templateUrl: './create-dropdown-field-modal.component.html',
    styleUrls: ['./create-dropdown-field-modal.component.scss'],
    standalone: true,
    imports: [MatDialogClose, FormsModule, ReactiveFormsModule, DadyinButtonComponent]
})
export class CreateDropdownFieldModalComponent implements OnInit {

  attributeValueExpression: UntypedFormArray;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { attributeName: UntypedFormControl, attributeType: any ,attributeValueExpression:any},
    public fb: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateDropdownFieldModalComponent>
  ) {
    this.attributeValueExpression = this.fb.array([])
  }

  ngOnInit(): void {
    console.log(this.data,'this.data');
    this.attributeValueExpression.clear()
   const attributeExpression = this.getArray(this.data.attributeValueExpression)
   if(attributeExpression?.length>0) {
     attributeExpression.forEach(element => {
      const form = this.createAttributeExpression()
      form.patchValue(element)
      this.attributeValueExpression.push(form)
      });
   }
    
  }

  addArray() {
    this.attributeValueExpression.push(this.createAttributeExpression())
  }

  createAttributeExpression() {
    return this.fb.group({
      choice: [''],
      attributeValue: [''],
      userConversionUom: [''],
    });
  }

  onCancel() {
    this.attributeValueExpression.clear()
  }

  removeArray(index) {
    this.attributeValueExpression.removeAt(index)
  }

  onConfirm() {
    let data = {
      attributeName: this.data.attributeName.value,
      attributeValueExpression: JSON.stringify(this.attributeValueExpression.value),
    }
    this.attributeValueExpression.clear()
    console.log(data,'data');
    this.dialogRef.close(data);
  }

  getArray(str: String) {
    if(!str) {
      return []
    }
    let prop = JSON.parse(str?.replace(/'/g, '"'));
    return prop;
  }
}
