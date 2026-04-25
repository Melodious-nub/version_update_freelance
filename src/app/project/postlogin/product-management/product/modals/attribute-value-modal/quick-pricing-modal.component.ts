import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { UomService } from 'src/app/service/uom.service';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-quick-pricing-modal',
    templateUrl: './quick-pricing-modal.component.html',
    styleUrls: ['./quick-pricing-modal.component.scss'],
    imports: [MatDialogClose, FormsModule, ReactiveFormsModule, DadyinButtonComponent]
})
export class QuickPricingModalComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<QuickPricingModalComponent>>(MatDialogRef);
  uomService = inject(UomService);

  tierPricingDetail:any

  ngOnInit(): void {
   this.tierPricingDetail=this.data.tierPricingDetail    
  }
  save() {
    this.dialogRef.close(null);
  }
}
