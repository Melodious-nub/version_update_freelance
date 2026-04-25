import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { InventoryinmanagementService } from '../service/inventoryin-management.service';
import { UntypedFormArray, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InventoryAssigningModalComponent } from '../modals/inventory-assigning-modal/inventory-assigning-modal.component';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../../../product-management/product-template/product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { Location } from '@angular/common';
import { DataTableComponent } from '../../../../../shared/component/data-table/data-table.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
@Component({
    selector: 'app-product-wise-create-inventory',
    templateUrl: './product-wise-create-inventory.component.html',
    styleUrls: ['./product-wise-create-inventory.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatIcon,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        FormsModule,
        ReactiveFormsModule,
        DataTableComponent
    ]
})
export class ProductWiseCreateInventoryComponent implements OnInit {
  productId: any;
  response: any;
  public filterValue: string;
  list: any = [];
  inventoryLotForm: any;
  productCode = '';
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
    public inventoryinmanagementService: InventoryinmanagementService,
    public route: ActivatedRoute,
    public fb: UntypedFormBuilder,
    public toastr: ToastrService,
    private dialog: MatDialog,
    private _location: Location,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.inventoryLotForm = this.fb.array([]);
    this.productId = this.route.snapshot.params['id'];
    this.inventoryinmanagementService
      .getProductWiseInventoryDetails(this.productId)
      .subscribe(
        (res: any) => {
          this.response = res;
          this.response.inventoryLots.forEach((element) => {
            element.inventoryDetails.forEach((item) => {
              if (item.productId == this.productId) {
                this.productCode = item.productCode;
              }
            });
          });
          this.patchForm(res.inventoryLots);
        },
        (err) => {}
      );
  }

  patchForm(inventoryLots: any) {
    this.inventoryLotForm = this.fb.array([]);
    inventoryLots.forEach((inventory) => {
      let fg = this.inventoryFormGroup();
      inventory.inventoryDetails.forEach((detail) => {
        let inventoryDetail = this.createInventoryDetailForm();
        detail.palletInventories.forEach((pallet) => {
          let palletFg = this.createPalletInventory();
          (inventoryDetail.get('palletInventories') as UntypedFormArray).push(
            palletFg
          );
        });
        (fg.get('inventoryDetails') as UntypedFormArray).push(inventoryDetail);
      });
      fg.patchValue(inventory);
      this.inventoryLotForm.push(fg);
    });
  }

  inventoryFormGroup() {
    return this.fb.group({
      audit: [''],
      billNumber: [0],
      containerId: [''],
      containerTypeId: [''],
      dadyInPoints: [''],
      debugInformation: [''],
      deliveryPickup: [''],
      dockNumber: [''],
      expectedByDate: [''],
      id: [''],
      inventoryDetails: this.fb.array([]),
      lotIdSequence: [''],
      orderDate: [''],
      purchaseOrderDetail: [''],
      purchaseOrderId: [''],
      purchaseOrderTransactionId: [''],
      receivedDate: [''],
      salesPersonId: [302],
      status: [''],
      totalQuantity: [''],
      verifierId: [''],
    });
  }

  createPalletInventory() {
    return this.fb.group({
      audit: [''],
      columnNumber: [''],
      debugInformation: [''],
      dockNumber: [''],
      handlingInstructions: [''],
      id: [''],
      location: [''],
      notes: [''],
      numberOfItems: [''],
      palletNumber: [''],
      rowNumber: [''],
      singleBoxNumber: [''],
      remainingItems: [null],
      blockedItems: [null],
    });
  }

  createInventoryDetailForm() {
    return this.fb.group({
      afterQuantity: [''],
      audit: [''],
      beforeQuantity: [''],
      debugInformation: [''],
      description: [''],
      id: [''],
      inventoryDirection: [''],
      note: [''],
      packageId: [''],
      packageType: [''],
      palletInventories: this.fb.array([]),
      productCode: [''],
      productId: [''],
      quantityOrdered: [''],
      quantityReceived: [''],
      sortOrder: [''],
      status: [''],
      weight: this.fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      volume: this.fb.group({
        attributeValue: [],
        userConversionUom: [null],
      }),
    });
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

  calculate() {
    this.inventoryinmanagementService
      .calculateProductWise(this.inventoryLotForm.getRawValue())
      .subscribe(
        (res) => {
          this.patchForm(res);
        },
        (err) => {
          this.toastr.error(err?.message ?? 'Some Error Occoured');
        }
      );
  }

  confirm() {
    // let overallStatus="COMPLETED"

    // this.inventoryLotForm.controls.forEach(control => {
    //   control.get('inventoryDetails').controls.forEach(detailControl=>{
    //     if(detailControl.value.status!='COMPLETED' && detailControl.value.productId==this.productId){
    //       overallStatus='DRAFT'
    //     }
    //   })
    // });
    // if(overallStatus=='DRAFT'){
    //   const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
    //     data: {
    //       title: 'Confirmation',
    //       message: 'Your inventory will be partially completed. Do you want to proceed ? ',
    //     },
    //   });
    //   confirmDialog.afterClosed().subscribe((result) => {
    //     if (result === true) {
    //       this.inventoryinmanagementService.productWiseSave(this.productId,this.inventoryLotForm.getRawValue()).subscribe(res=>{
    //         this.toastr.success("Saved Successfully");
    //         this.navigateToList()
    //       },err=>{
    //         this.toastr.error(err?.message??"Some Error Occoured");
    //       })
    //     } else {
    //       // nothing
    //     }
    //   });
    // }else{
    this.inventoryinmanagementService
      .productWiseSave(this.productId, this.inventoryLotForm.getRawValue())
      .subscribe(
        (res) => {
          this.toastr.success('Saved Successfully');
          this.navigateToList();
        },
        (err) => {
          this.toastr.error(err?.message ?? 'Some Error Occoured');
        }
      );
    // }
  }

  draft() {
    const confirmDialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation',
        message:
          'All your inventories will be converted to draft. Do you want to proceed? ',
      },
    });
    confirmDialog.afterClosed().subscribe((result) => {
      if (result === true) {
        this.inventoryLotForm.controls.forEach((control) => {
          control.get('inventoryDetails').controls.forEach((detailControl) => {
            if (detailControl.value.productId == this.productId) {
              detailControl.patchValue({ status: 'DRAFT' });
            }
          });
        });
        this.inventoryinmanagementService
          .productWiseSave(this.productId, this.inventoryLotForm.getRawValue())
          .subscribe(
            (res) => {
              this.toastr.success('Saved as Draft');
            },
            (err) => {
              this.toastr.error(err?.message ?? 'Some Error Occoured');
            }
          );
      } else {
        // nothing
      }
    });
  }

  navigateToList() {
    let navigationExtras: NavigationExtras = {};
    if (this.route.snapshot.queryParams.expectedByDate) {
      navigationExtras = {
        queryParams: {
          filter:
            'expectedByDate:' + this.route.snapshot.queryParams.expectedByDate,
          poView: 'productWise',
        },
        queryParamsHandling: 'merge',
      };
    }

    this.router.navigate(
      ['/home/inventory-management/inventoryin'],
      navigationExtras
    );
  }
}
