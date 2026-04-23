import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, FormGroup, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { InventoryoutmanagementService } from '../../service/inventoryout-management.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { NgFor } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-inventory-assigning-modal',
    templateUrl: './inventory-assigning-modal.component.html',
    styleUrls: ['./inventory-assigning-modal.component.scss'],
    standalone: true,
    imports: [
        MatDialogClose,
        MatIcon,
        DadyinButtonComponent,
        NgFor,
        FormsModule,
        DataTableComponent,
    ],
})
export class InventoryAssigningModalComponent implements OnInit {
  inventoryDetailsData: any;
  public filterValue: string;
  list: any = [];
  public inventoryLedgerHeader = [
    { name: 'DATE', prop: 'orderDate', sortable: true },
    { name: 'QTY IN/OUT', prop: 'quantityReceived', sortable: true },
    { name: 'TXN Id#', prop: 'purchaseOrderTransactionId', sortable: true },
    { name: 'Before', prop: 'beforeQuantity', sortable: true },
    { name: 'After', prop: 'afterQuantity', sortable: true },
    { name: 'VERF. BY', prop: 'verifierName', sortable: true },
    { name: 'POINTS', prop: 'dadyInPoints', sortable: true },
    { name: 'Notes', prop: 'portDescription', sortable: true },
  ];
  public inventoryArrivingHeader = [
    { name: 'Date Arrive', prop: 'orderDate', sortable: true },
    { name: 'QTY', prop: 'quantityOrdered', sortable: true },
    { name: 'Container', prop: 'containerNumber', sortable: true },
    { name: 'PO#', prop: 'purchaseOrderTransactionId', sortable: true },
    { name: 'SO#', prop: 'id', sortable: true },
  ];
  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  public pageConfig = null;
  palletDetails = null;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public apiService: ApiService,
    public inventoryoutmanagement: InventoryoutmanagementService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.inventoryDetailsData = this.data.calculatedData.inventoryDetails.find(
      (item) => item.productId == this.data.pid
    );
    
    this.inventoryoutmanagement
      .getPalletDetailOrderWise(this.data.pid)
      .subscribe((res) => {
        ;
        this.palletDetails = res;
      });
  }

  calculate() {
    this.data.triggerCalculate.next(this.data.pid);
  }

  get palletInventories() {
    return this.inventoryDetails
      .at(this.data.index)
      ?.get('palletInventories') as UntypedFormArray;
  }
  get inventoryDetails() {
    return this.data.inventoryForm.get('inventoryDetails') as UntypedFormArray;
  }

  get purchaseOrderId() {
    return this.data.inventoryForm.get('purchaseOrderId').value;
  }

  mergePallet() {
    this.inventoryDetails
      .at(this.data.index)
      .patchValue({ status: 'COMPLETED' });
    let selectedPalletsIdsString = this.data.dbPalletInventories
      .filter((item) => item.isSelected)
      .map((item) => item.id)
      .join(',');
    this.dialogRef.close({ selectedPallets: selectedPalletsIdsString });
  }

  get status() {
    return this.inventoryDetails.at(this.data.index).value.status;
  }
}
