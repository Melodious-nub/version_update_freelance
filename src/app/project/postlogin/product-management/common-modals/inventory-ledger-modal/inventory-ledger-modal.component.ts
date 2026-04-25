import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
@Component({
    selector: 'app-inventory-ledger-modal',
    templateUrl: './inventory-ledger-modal.component.html',
    styleUrls: ['./inventory-ledger-modal.component.scss'],
    standalone: true,
    imports: [MatDialogModule, NgFor, NgIf, MatPaginatorModule, DatePipe]
})
export class InventoryLedgerModalComponent implements OnInit {
  inventoryLedgerData: any[] = [];
  totalElements: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50, 100];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public apiService: ApiService, public toastr: ToastrService, public fb: UntypedFormBuilder, public formsService: FormsService, public dialogRef: MatDialogRef<InventoryLedgerModalComponent>) {

  }

  ngOnInit(): void {
    this.getInventoryLedgerData();
  }

  getInventoryLedgerData() {
    this.apiService
      .viewLedger(this.data.productData.id, this.data.manualAdjustmentOnly, this.pageIndex, this.pageSize, 'audit.createdDate%2Cdesc')
      .subscribe({
        next: (response: any) => {
          this.inventoryLedgerData = response?.content || [];
          this.totalElements = response.totalElements || 0;
          this.pageSize = response.size || 20;
          this.pageIndex = response.number || 0;
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error(err?.error?.userMessage || 'Error loading ledger data');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getInventoryLedgerData();
  }

}
