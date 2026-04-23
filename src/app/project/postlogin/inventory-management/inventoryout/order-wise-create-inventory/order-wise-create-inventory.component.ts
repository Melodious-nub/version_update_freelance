import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryoutmanagementService } from '../service/inventoryout-management.service';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InventoryAssigningModalComponent } from '../modals/inventory-assigning-modal/inventory-assigning-modal.component';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../product-management/product-template/product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinSelectComponent } from '../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-order-wise-create-inventory',
    templateUrl: './order-wise-create-inventory.component.html',
    styleUrls: ['./order-wise-create-inventory.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        MatIcon,
        NgIf,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinSelectComponent,
        NgClass,
        ExtendedModule,
        NgFor,
    ],
})
export class OrderWiseCreateInventoryComponent implements OnInit {
  id = '';
  inventoryForm: any;
  data = null;
  employees = [];
  containerTypes = [];
  triggerCalculate = new Subject();
  dbPalletInventoriesofSelectedProduct: any = [];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public inventoryoutmanagement: InventoryoutmanagementService,
    public fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public toastr: ToastrService
  ) {
    this.inventoryForm = this.fb.group({
      advanceOrder: [null],
      billNumber: [null],
      containerId: [null],
      containerNumber: [null],
      containerTypeId: [null],
      dadyInPoints: [null],
      debugInformation: [null],
      deliveryPickup: [null],
      dockNumber: [null],
      expectedByDate: [null],
      id: [null],
      inventoryDetails: this.fb.array([]),
      lotIdSequence: [null],
      orderDate: [null],
      purchaseOrderDetail: [null],
      purchaseOrderId: [null],
      purchaseOrderTransactionId: [null],
      receivedDate: [null],
      saleOrderId: [null],
      saleOrderTransactionId: [null],
      salesPersonId: [null],
      shipDate: [null],
      shipVia: [null],
      shipmentDelivered: [null],
      status: [null],
      totalQuantity: [null],
      verifierId: [null],
    });
  }

  ngOnInit(): void {
    this.triggerCalculate.subscribe((pid) => {
      this.calculate(pid);
    });
    this.id = this.route.snapshot.params['id'];
    this.inventoryoutmanagement.getEmployees().subscribe((res) => {
      this.employees = res;
    });
    this.inventoryoutmanagement.getContainerTypes().subscribe((res) => {
      this.containerTypes = res;
    });
    if (window.location.href.includes('update')) {
      this.inventoryoutmanagement.getInventory(this.id).subscribe((res) => {
        this.data = res;
        this.patchWithCalcData(res);
      });
    } else {
      this.inventoryoutmanagement.getSalesOrder(this.id).subscribe((res) => {
        this.data = res;
        this.patchForm(this.data);
      });
    }
  }
  get inventoryDetails() {
    return this.inventoryForm.get('inventoryDetails') as UntypedFormArray;
  }

  onClickConfirm() {
    let overallStatus = 'COMPLETED';
    this.inventoryDetails.controls.forEach((control) => {
      if (control.value.status != 'COMPLETED') {
        overallStatus = 'DRAFT';
      }
    });
    if (overallStatus == 'DRAFT') {
      const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Confirmation',
          message:
            'Your inventory will be partially completed. Do you want to proceed ? ',
        },
      });
      confirmDialog.afterClosed().subscribe((result) => {
        if (result === true) {
          this.inventoryoutmanagement
            .createInventory({
              ...this.inventoryForm.getRawValue(),
              ...{
                status: overallStatus,
              },
            })
            .subscribe(
              (res) => {
                this.data = res;
                this.navigateToList();
              },
              (err) => {
                this.toastr.error(err?.message ?? 'Some Error Occoured');
              }
            );
        } else {
          // nothing
        }
      });
    } else {
      this.inventoryoutmanagement
        .createInventory({
          ...this.inventoryForm.getRawValue(),
          ...{
            status: overallStatus,
          },
        })
        .subscribe(
          (res) => {
            this.data = res;
            this.navigateToList();
          },
          (err) => {
            this.toastr.error(err?.message ?? 'Some Error Occoured');
          }
        );
    }
  }

  onSaveDraft() {
    let flag = false;
    this.inventoryDetails.controls.forEach((control) => {
      if (control.value.status == 'COMPLETED') {
        flag = true;
      }
    });

    if (flag) {
      const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Confirmation',
          message:
            'All your inventories will be converted to draft. Do you want to proceed? ',
        },
      });
      confirmDialog.afterClosed().subscribe((result) => {
        if (result === true) {
          this.inventoryDetails.controls.forEach((control) => {
            control.patchValue({ status: 'DRAFT' });
          });
          this.inventoryoutmanagement
            .createInventory({
              ...this.inventoryForm.getRawValue(),
              ...{
                status: 'DRAFT',
              },
            })
            .subscribe(
              (res: any) => {
                this.router.navigateByUrl(
                  `/home/inventory-management/inventoryout/order-wise-update-inventory/${res.id}`
                );
              },
              (err) => {
                this.toastr.error(err?.message ?? 'Some Error Occoured');
              }
            );
        } else {
          // nothing
        }
      });
    } else {
      this.inventoryDetails.controls.forEach((control) => {
        control.patchValue({ status: 'DRAFT' });
      });
      this.inventoryoutmanagement
        .createInventory({
          ...this.inventoryForm.getRawValue(),
          ...{
            status: 'DRAFT',
          },
        })
        .subscribe(
          (res: any) => {
            this.router.navigateByUrl(
              `/home/inventory-management/inventoryout/order-wise-update-inventory/${res.id}`
            );
          },
          (err) => {
            this.toastr.error(err?.message ?? 'Some Error Occoured');
          }
        );
    }
  }

  navigateToList() {
    this.router.navigateByUrl(
      `/home/inventory-management/inventoryout?filter=expectedByDate:'${this.data.expectedByDate}'`
    );
  }

  patchForm(data) {
    let obj = {
      id: null,
      debugInformation: null,
      lotIdSequence: null,
      purchaseOrderTransactionId: null,
      receivedDate: data.receivedDate?.split('T')[0],
      expectedByDate: data.expectedByDate,
      orderDate: data.audit.createdDate.split('T')[0],
      billNumber: null,
      purchaseOrderDetail: null,
      deliveryPickup: data.deliveryPickup,
      dadyInPoints: data.dadyInPoints,
      status: null,
      totalQuantity: null,
      dockNumber: null,
      inventoryDetails: [],
      saleOrderTransactionId: null,
      shipDate: null,
      shipVia: null,
      shipmentDelivered: null,
      advanceOrder: null,
      containerNumber: null,
      purchaseOrderId: null,
      containerTypeId: data.containerTypeId,
      containerId: null,
      verifierId: null,
      salesPersonId: null,
      saleOrderId: data.id,
    };
    data.productPackages.forEach((item) => {
      this.inventoryDetails.push(this.createInventoryDetailForm());
      obj.inventoryDetails.push({
        afterQuantity: null,
        apackage: null,
        dbPalletInventories: null,
        debugInformation: null,
        description: item.productDetails.description,
        ibeforeQuantity: null,
        id: null,
        inventoryDirection: 'OUT',
        note: item.note,

        packageId: item.packageId,
        packageType: null,
        palletInventories: [],
        productCode: item.productDetails.productCode,
        productId: item.productId,
        quantityOrdered: item.quantity,
        quantityReceived: null,
        sortOrder: null,
        status: item.ststus,
        volume: null,
        weight: null,
        //
      });
    });
    this.inventoryForm.patchValue(obj);
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  createPalletInventory() {
    return this.fb.group({
      id: [null],
      debugInformation: [null],
      palletNumber: [null],
      rowNumber: [null],
      columnNumber: [null],
      singleBoxNumber: [null],
      numberOfItems: [null],
      remainingItems: [null],
      blockedItems: [null],
      dockNumber: [null],
      location: [null],
      handlingInstructions: [null],
      notes: [null],
      isSelected: [null],
      palletInventoryId: [null],
    });
  }

  createInventoryDetailForm() {
    return this.fb.group({
      id: [null],
      debugInformation: [null],
      quantityReceived: [null],
      ibeforeQuantity: [null],
      afterQuantity: [null],
      productCode: [null],
      description: [null],
      note: [null],
      inventoryDirection: [null],
      packageType: [null],
      quantityOrdered: [null],
      weight: this.fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      volume: this.fb.group({
        attributeValue: [],
        userConversionUom: [null],
      }),
      sortOrder: [null],
      status: [null],
      dbPalletInventories: [null],
      apackage: [null],
      productId: [null],
      packageId: [null],
      palletInventories: this.fb.array([]),
    });
  }

  getProductSKUType(item) {
  }

  calculate(productId: any, selectedPallets?: any) {
    this.inventoryoutmanagement
      .calculate(productId, [this.inventoryForm.getRawValue()], selectedPallets)
      .subscribe(
        (res: any) => {
          // this.dbPalletInventoriesofSelectedProduct = res.dbPalletInventories;
          this.patchWithCalcData(res.inventoryLots[0]);
        },
        (err) => {
          this.toastr.error(err?.message ?? 'Some Error Occoured');
        }
      );
  }

  patchWithCalcData(data) {
    this.inventoryDetails.clear();
    data.inventoryDetails.forEach((element) => {
      let fg = this.createInventoryDetailForm();
      element.palletInventories.forEach((item) => {
        (fg.get('palletInventories') as UntypedFormArray).push(
          this.createPalletInventory()
        );
      });
      this.inventoryDetails.push(fg);
    });
    data.receivedDate = data.receivedDate?.split('T')[0];
    data.orderedQuantity = data.quantity;
    this.inventoryForm.patchValue(data);
  }

  check(data) {
  }

  assignInventoryModal(productId, index) {
    this.inventoryoutmanagement
      .calculate(productId, [this.inventoryForm.getRawValue()])
      .subscribe(
        (res: any) => {
          this.patchWithCalcData(res.inventoryLots[0]);
          this.dialog
            .open(InventoryAssigningModalComponent, {
              data: {
                calculatedData: res.inventoryLots[0],
                pid: this.inventoryForm.get('inventoryDetails').value[index]
                  .productId,
                index: index,
                inventoryForm: this.inventoryForm,
                triggerCalculate: this.triggerCalculate,
                dbPalletInventories: res.dbPalletInventories,
              },
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.calculate(productId, res.selectedPallets);
              }
            });
        },
        (err) => {
          this.toastr.error(err?.message ?? 'Some Error Occoured');
        }
      );
  }
}
