import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryinmanagementService } from '../service/inventoryin-management.service';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InventoryAssigningModalComponent } from '../modals/inventory-assigning-modal/inventory-assigning-modal.component';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../product-management/product-template/product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { DadyinSelectComponent } from '../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

import { MatIcon } from '@angular/material/icon';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-order-wise-create-inventory',
    templateUrl: './order-wise-create-inventory.component.html',
    styleUrls: ['./order-wise-create-inventory.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatIcon,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        FormsModule,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinSelectComponent
    ]
})
export class OrderWiseCreateInventoryComponent implements OnInit {
  id = '';
  inventoryForm: any;
  data = null;
  employees = [];
  containerTypes = [];
  triggerCalculate = new Subject();
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public inventoryinmanagement: InventoryinmanagementService,
    public fb: UntypedFormBuilder,
    private dialog: MatDialog,
    public toastr: ToastrService
  ) {
    this.inventoryForm = this.fb.group({
      id: [null],
      purchaseOrderId: [null],
      billNumber: [''],
      transactionId: [''],
      containerTypeId: [1],
      deliveryPickup: [''],
      salesPersonId: [''],
      verifierId: [''],
      dockNumber: [''],
      receivedDate: [''],
      expectedByDate: [''],
      orderDate: [''],
      dadyInPoints: [''],
      loadingDock: [''],
      orderType: [''],
      inventoryDetails: this.fb.array([]),
      status:[''],
    });
  }

  ngOnInit(): void {
    this.triggerCalculate.subscribe((event) => {
      this.calculate();
    });
    this.id = this.route.snapshot.params['id'];
    this.inventoryinmanagement.getEmployees().subscribe((res) => {
      this.employees = res;
    });
    this.inventoryinmanagement.getContainerTypes().subscribe((res) => {
      this.containerTypes = res;
    });
    if (window.location.href.includes('update')) {
      this.inventoryinmanagement.getInventory(this.id).subscribe((res) => {
        this.data = res;
        this.patchWithCalcData(res);
      });
    } else {
      this.inventoryinmanagement.getPurchaseOrder(this.id).subscribe((res) => {
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
          this.inventoryinmanagement
            .createInventory({
              ...this.inventoryForm.getRawValue(),
              ...{
                status: overallStatus,
                purchaseOrderTransactionId:
                  this.data.purchaseOrderTransactionId ??
                  this.data.transactionId,
              },
            })
            .subscribe(
              (res) => {
                this.data = res;
                this.navigateToList();
              },
              (err) => {
                this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
              }
            );
        } else {
          // nothing
        }
      });
    } else {
      this.inventoryinmanagement
        .createInventory({
          ...this.inventoryForm.getRawValue(),
          ...{
            status: overallStatus,
            purchaseOrderTransactionId:
              this.data.purchaseOrderTransactionId ?? this.data.transactionId,
          },
        })
        .subscribe(
          (res) => {
            this.data = res;
            this.navigateToList();
          },
          (err) => {
            this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
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
          this.inventoryinmanagement
            .createInventory({
              ...this.inventoryForm.getRawValue(),
              ...{
                status: 'DRAFT',
                purchaseOrderTransactionId:
                  this.data.purchaseOrderTransactionId ??
                  this.data.transactionId,
              },
            })
            .subscribe(
              (res: any) => {
                this.router.navigateByUrl(
                  `/home/inventory-management/inventoryin/order-wise-update-inventory/${res.id}`
                );
              },
              (err) => {
                this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
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
      this.inventoryinmanagement
        .createInventory({
          ...this.inventoryForm.getRawValue(),
          ...{
            status: 'DRAFT',
            purchaseOrderTransactionId:
              this.data.purchaseOrderTransactionId ?? this.data.transactionId,
          },
        })
        .subscribe(
          (res: any) => {
            this.router.navigateByUrl(
              `/home/inventory-management/inventoryin/order-wise-update-inventory/${res.id}`
            );
          },
          (err) => {
            this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
          }
        );
    }
  }

  navigateToList() {
    this.router.navigateByUrl(
      `/home/inventory-management/inventoryin?filter=expectedByDate:'${this.data.expectedByDate}'`
    );
  }

  patchForm(data) {
    let obj = {
      purchaseOrderId: data.id,
      billNumber: '',
      transactionId: data.transactionId,
      containerTypeId: data.containerTypeId,
      deliveryPickup: data.deliveryPickup,
      salesPerson: '',
      verifierId: '',
      dockNumber: '',
      receivedDate: data.receivedDate?.split('T')[0],
      expectedByDate: data.expectedByDate,
      orderDate: data.audit.createdDate.split('T')[0],
      dadyInPoints: data.dadyInPoints,
      totalQuantity: '',
      loadingDock: '',
      orderType: '',
      inventoryDetails: [],
    };
    data.productPackages.forEach((item) => {
      this.inventoryDetails.push(this.createInventoryDetailForm());
      obj.inventoryDetails.push({
        productId: item.productId,
        packageId: null,
        productCode: item.productDetails.productCode,
        description: item.productDetails.description,
        note: item.note,
        packageType: null,
        quantityOrdered: item.quantity,
        quantityReceived: null,
        weight: null,
        volume: null,
        inventoryDirection: 'IN',
        palletInventories: [],
        qoh: item.productDetails.qoh,
        productDetails: item.productDetails,
        ststus: item.ststus,
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
      palletNumber: [null],
      rowNumber: [null],
      columnNumber: [null],
      singleBoxes: [null],
      singleBoxNumber: [null],
      skuPerPallet: [null],
      location: [null],
      dockNumber: [null],
      handlingInstructions: [null],
      numberOfItems: [null],
      notes: [null],
      remainingItems: [null],
      blockedItems: [null],
    });
  }

  createInventoryDetailForm() {
    return this.fb.group({
      productId: [null],
      packageId: [null],
      productCode: [null],
      description: [null],
      note: [null],
      packageType: [null],
      quantityOrdered: [null],
      quantityReceived: [null],
      inventoryDirection: ['IN'],
      weight: this.fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      volume: this.fb.group({
        attributeValue: [],
        userConversionUom: [null],
      }),
      palletInventories: this.fb.array([]),
      //extra attributes
      qoh: [null],
      productDetails: [null],
      orderedQuantity: [null],
      status: ['DRAFT'],
    });
  }

  getProductSKUType(item) {}

  calculate() {
    this.inventoryinmanagement
      .calculate(this.inventoryForm.getRawValue())
      .subscribe(
        (res) => {
          this.patchWithCalcData(res);
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
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

  check(data) {}

  assignInventoryModal(index) {
    this.inventoryinmanagement
      .calculate(this.inventoryForm.getRawValue())
      .subscribe(
        (res) => {
          this.patchWithCalcData(res);
          this.dialog
            .open(InventoryAssigningModalComponent, {
              data: {
                calculatedData: res,
                pid: this.inventoryForm.get('inventoryDetails').value[index]
                  .productId,
                index: index,
                inventoryForm: this.inventoryForm,
                triggerCalculate: this.triggerCalculate,
              },
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.calculate();
              }
            });
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occoured');
        }
      );
  }
}
