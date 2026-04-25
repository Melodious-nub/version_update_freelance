import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'add-cost',
    templateUrl: './add-cost-dialog.component.html',
    styleUrls: ['./add-cost-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class AddCostDialogComponent implements OnInit {
  addCost: UntypedFormGroup;

  public dialogRef = inject<MatDialogRef<AddCostDialogComponent>>(MatDialogRef);
  public data = inject(MAT_DIALOG_DATA);
  private _fb = inject(UntypedFormBuilder);

  constructor() {}

  ngOnInit(): void {
    this.addCost = this._fb.group({
      costName: [''],
      price: [''],
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    const costData = {
      description: this.addCost.value.costName,
      amount: parseFloat(this.addCost.value.price),
    };
    this.dialogRef.close(costData);
  }
}
