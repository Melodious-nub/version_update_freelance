import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { ContainerFormsService } from '../../service/container-forms.service';
import { ContainerManagementService } from '../../service/container-management.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
@Component({
  selector: 'app-container-steps',
  templateUrl: './container-steps.component.html',
  styleUrls: ['./container-steps.component.scss'],
})
export class ContainerStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  containerForm: UntypedFormGroup;
  currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  purchaseOrdersList: any[] = [];
  quotationsList: any[] = [];
  purchaseOrdersListLoaded = false;
  quotationsListLoaded = false;
  uomSetting = false;
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  public preferredUoms: any[];

  constructor(
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public commonService: CommonService,
    private fb: UntypedFormBuilder,
    public containerFormService: ContainerFormsService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public formsService: FormsService,
    public dialog: MatDialog
  ) {
    this.containerForm = this.containerFormService.createContainerForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Order Details',
      index: 0,
    },
    {
      id: 2,
      name: 'Container Info',
      index: 1,
    },
    {
      id: 3,
      name: 'Unloading',
      index: 2,
    },
    {
      id: 4,
      name: 'Expenses',
      index: 3,
    },
    {
      id: 5,
      name: 'Documents',
      index: 4,
    },
  ];

  async ngOnInit() {
    this.getPreference();
    this.containerService.getAllDatas();
    this.businessAccountService.Get_All_CustomersList();
    this.businessAccountService.Get_All_Exporter_Vendors();
    if (this.isExport) {
      this.containerForm.get('isExport').setValue(true);
      this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
        this.currentBusinessAccount = res;
        this.containerForm
          .get('requestFromId')
          .setValue(this.currentBusinessAccount?.id);
      });
    } else {
      this.containerForm.get('isExport').setValue(false);
      this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
        this.currentBusinessAccount = res;
        this.containerForm
          .get('requestToId')
          .setValue(this.currentBusinessAccount?.id);
      });
    }

    if (this.containerId) {
      this.containerService
        .getContainerById(this.containerId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (res: any) => {
          await this.patchEditData(res, false);
        });
    }
  }

  onGlobalUomChange(event: any, ext?: any) {
    if (event?.target?.value || ext) {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      this.getContainerTypes();
    } else {
      return;
    }
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForContainer = this.preferredUoms.find(
        (item) => item.componentType == 'CONTAINER'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      if (!this.containerId) {
        this.onGlobalUomChange(null, true);
      }
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  getContainerTypes() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.containerService.Get_All_ContainerTypes(uomQuery);

    if (!this.containerId) {
      this.containerTypeId.setValue(3);
    }

    if (this.isQuotation) {
      this.loadQuotationsList(uomQuery);
    } else {
      if (this.isExport) {
        this.loadPurchaseOrdersExportList(uomQuery);
      } else {
        this.loadPurchaseOrdersList(uomQuery);
      }
    }
  }

  async patchEditData(editData: any, calculate: any) {
    try {
      if (editData) {
        editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
        editData.arrivalDate = editData?.arrivalDate?.slice(0, 10) ?? null;
        editData.gateCloseDate = editData?.gateCloseDate?.slice(0, 10) ?? null;
        editData.gateOpenDate = editData?.gateOpenDate?.slice(0, 10) ?? null;
        editData.loadingDate = editData?.loadingDate?.slice(0, 10) ?? null;
        editData.departureDate = editData?.departureDate?.slice(0, 10) ?? null;
        editData.containerDate = editData?.containerDate?.slice(0, 10) ?? null;

        const containerOrders = this.containerForm.get(
          'containerOrders'
        ) as UntypedFormArray;
        containerOrders.clear();

        editData?.containerOrders?.forEach((element, i) => {
          const containerOrder = this.containerFormService.containerOrderForm();
          const purchaseOrderDetail = containerOrder.get('purchaseOrderDetail');
          const containerProducts = containerOrder.get(
            'containerProducts'
          ) as UntypedFormArray;
          containerProducts.clear();
          element?.containerProducts?.forEach((containerProductValue, j) => {
            const containerProduct =
              this.containerFormService.containerProductForm();
            containerProduct.patchValue(containerProductValue);
            containerProducts.push(containerProduct);

            const orderPalletReceivedInformations = containerProducts.controls[
              j
            ].get('orderPalletReceivedInformations') as UntypedFormArray;
            containerProductValue.orderPalletReceivedInformations.forEach(
              (orderPalletReceivedInformationValue) => {
                const orderPalletReceivedInformation =
                  this.containerFormService.orderPalletForm();
                orderPalletReceivedInformation.patchValue(
                  orderPalletReceivedInformationValue
                );
                orderPalletReceivedInformations.push(
                  orderPalletReceivedInformation
                );
              }
            );

            const orderPalletLoadedInformations = containerProducts.controls[
              j
            ].get('orderPalletLoadedInformations') as UntypedFormArray;
            containerProductValue.orderPalletLoadedInformations.forEach(
              (orderPalletLoadedInformationValue) => {
                const orderPalletLoadedInformation =
                  this.containerFormService.orderPalletForm();
                orderPalletLoadedInformation.patchValue(
                  orderPalletLoadedInformationValue
                );
                orderPalletLoadedInformations.push(
                  orderPalletLoadedInformation
                );
              }
            );
          });

          const productPackages = purchaseOrderDetail.get(
            'productPackages'
          ) as UntypedFormArray;
          productPackages.clear();
          element?.purchaseOrderDetail?.productPackages?.forEach(
            (productPackageValue) => {
              const productPackageForm =
                this.containerFormService.productPackageForm();
              productPackageForm.patchValue(productPackageValue);
              productPackages.push(productPackageForm);
            }
          );

          containerOrder.patchValue(element);
          containerOrders.push(containerOrder);
        });

        const containerQuotations = this.containerForm.get(
          'containerQuotations'
        ) as UntypedFormArray;
        containerQuotations.clear();

        editData?.containerQuotations?.forEach((element, i) => {
          const containerQuotation =
            this.containerFormService.containerQuotationForm();
          const quotationListView = containerQuotation.get('quotationListView');
          const containerProducts = containerQuotation.get(
            'containerProducts'
          ) as UntypedFormArray;
          containerProducts.clear();
          element?.containerProducts?.forEach((containerProductValue, j) => {
            const containerProduct =
              this.containerFormService.containerProductForm();
            containerProduct.patchValue(containerProductValue);
            containerProducts.push(containerProduct);

            const orderPalletReceivedInformations = containerProducts.controls[
              j
            ].get('orderPalletReceivedInformations') as UntypedFormArray;
            containerProductValue.orderPalletReceivedInformations.forEach(
              (orderPalletReceivedInformationValue) => {
                const orderPalletReceivedInformation =
                  this.containerFormService.orderPalletForm();
                orderPalletReceivedInformation.patchValue(
                  orderPalletReceivedInformationValue
                );
                orderPalletReceivedInformations.push(
                  orderPalletReceivedInformation
                );
              }
            );

            const orderPalletLoadedInformations = containerProducts.controls[
              j
            ].get('orderPalletLoadedInformations') as UntypedFormArray;
            containerProductValue.orderPalletLoadedInformations.forEach(
              (orderPalletLoadedInformationValue) => {
                const orderPalletLoadedInformation =
                  this.containerFormService.orderPalletForm();
                orderPalletLoadedInformation.patchValue(
                  orderPalletLoadedInformationValue
                );
                orderPalletLoadedInformations.push(
                  orderPalletLoadedInformation
                );
              }
            );
          });

          const productPackages = quotationListView.get(
            'productPackages'
          ) as UntypedFormArray;
          productPackages.clear();
          element?.quotationListView?.productPackages?.forEach(
            (productPackageValue) => {
              const productPackageForm =
                this.containerFormService.productPackageForm();
              productPackageForm.patchValue(productPackageValue);
              productPackages.push(productPackageForm);
            }
          );

          containerQuotation.patchValue(element);
          containerQuotations.push(containerQuotation);
        });

        const containerContacts = this.containerForm
          .get('containerExpense')
          ?.get('containerContacts') as UntypedFormArray;
        containerContacts.clear();
        editData?.containerExpense?.containerContacts?.forEach((element) => {
          const containerContactForm =
            this.containerFormService.containerContactForm();
          containerContactForm.patchValue(element);
          containerContacts.push(containerContactForm);
        });

        const unloadingMaterialExpenses = this.containerForm
          .get('containerExpense')
          .get('unloadingMaterialExpenses') as UntypedFormArray;
        unloadingMaterialExpenses.clear();
        editData?.containerExpense?.unloadingMaterialExpenses?.forEach(
          (element) => {
            const unloadingMaterialExpense =
              this.containerFormService.unloadingMaterialExpenseForm();
            unloadingMaterialExpense.patchValue(element);
            unloadingMaterialExpenses.push(unloadingMaterialExpense);
          }
        );

        const labourExpenses = this.containerForm
          .get('containerExpense')
          .get('labourExpenses') as UntypedFormArray;
        labourExpenses.clear();
        editData?.containerExpense?.labourExpenses?.forEach((element) => {
          const labourExpense = this.containerFormService.labourExpenseForm();
          labourExpense.patchValue(element);
          labourExpenses.push(labourExpense);
        });

        const miscellaneousExpenses = this.containerForm
          .get('containerExpense')
          ?.get('miscellaneousExpenses') as UntypedFormArray;
        miscellaneousExpenses.clear();
        editData?.containerExpense?.miscellaneousExpenses?.forEach(
          (element) => {
            const miscellaneousExpense =
              this.containerFormService.miscellaneousExpenseForm();
            miscellaneousExpense.patchValue(element);
            miscellaneousExpenses.push(miscellaneousExpense);
          }
        );
        setTimeout(() => {
          this.containerForm.patchValue(editData);

          const importCost = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'IMPORTCOST'
          );
          const exportCost = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'EXPORTCOST'
          );
          const weight = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'WEIGHT'
          );
          const volume = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'VOLUME'
          );

          if (editData?.importCost?.userConversionUom && importCost) {
            importCost
              .get('userConversionUom')
              .setValue(editData?.importCost?.userConversionUom);
          }

          if (editData?.exportCost?.userConversionUom && exportCost) {
            exportCost
              .get('userConversionUom')
              .setValue(editData?.exportCost?.userConversionUom);
          }

          if (this.containerTypeWeightUom.value) {
            weight
              .get('userConversionUom')
              .setValue(this.containerTypeWeightUom.value);
          }

          if (this.containerTypeVolumeUom.value) {
            volume
              .get('userConversionUom')
              .setValue(this.containerTypeVolumeUom.value);
          }
          if (!calculate) {
            this.onGlobalUomChange(null, true);
          }
        }, 500);
      }
    } catch (err) {}
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async onClickNext() {
    try {
      this.currentStepIndex++;
    } catch (err: any) {}
  }

  public onClickBack(): void {
    if (this.currentStepIndex >= 1) {
      this.currentStepIndex--;
    }
  }

  public onClickSave(status: any): void {
    let data = this.containerForm.getRawValue();
    data.status = data.status ? data.status : status;
    this.containerService
      .addUpdateContainer(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res, false);
          this.toastr.success('Saved Successfully');
          if (this.isExport) {
            this.router.navigateByUrl(
              '/home/container-management/container/export'
            );
          } else {
            this.router.navigateByUrl(
              '/home/container-management/container/import'
            );
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  getCalculatedValues() {
    const data: any = this.containerForm.getRawValue();
    let editOldData: any = JSON.parse(JSON.stringify(data));
    this.containerService
      .calculateContainer(data)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          editOldData?.containerOrders?.forEach((containerOrder, i) => {
            res.containerOrders[i].purchaseOrderDetail.productPackages =
              containerOrder.purchaseOrderDetail.productPackages;
            res.containerOrders[i].purchaseOrderDetail.expanded =
              editOldData?.containerOrders[i].purchaseOrderDetail?.expanded ??
              false;
            containerOrder?.containerProducts?.forEach(
              (containerProduct, j) => {
                res.containerOrders[i].containerProducts[j].expanded =
                  containerProduct?.expanded ?? false;
              }
            );
          });
          this.patchEditData(res, true);
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  loadPurchaseOrdersList(uomQuery: any) {
    this.containerService
      .Get_All_PurchaseOrders(uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.purchaseOrdersList = res?.content;
          const poIds = this.purchaseOrdersList.map((it) => it.id);
          if (poIds?.length > 0) {
            this.loadPurchaseOrderPackagesList(uomQuery, poIds);
          } else {
            this.purchaseOrdersListLoaded = true;
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          this.purchaseOrdersListLoaded = true;
        }
      );
  }

  loadQuotationsList(uomQuery: any) {
    this.containerService
      .Get_All_Quotations(uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.quotationsList = res?.content;
          const quotationIds = this.quotationsList.map((it) => it.id);
          if (quotationIds?.length > 0) {
            this.loadQuotationPackagesList(uomQuery, quotationIds);
          } else {
            this.quotationsListLoaded = true;
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          this.quotationsListLoaded = true;
        }
      );
  }

  loadQuotationPackagesList(uomQuery: any, quotationIds: any) {
    this.containerService
      .Get_All_QuotationPackages(uomQuery, quotationIds)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.quotationsList = res;
          const productIds = [];
          this.quotationsList.forEach((quotation) => {
            quotation.productPackages.forEach((productpackage, index) => {
              productIds.push(productpackage.productId);
            });
          });
          this.containerService
            .getProductDetailByIds(productIds.join(','))
            .subscribe((res) => {
              this.quotationsList.forEach((quotation) => {
                quotation.productPackages.forEach((productPackage) => {
                  const productDetails = res.find(
                    (it) => it.id == productPackage.productId
                  );
                  productPackage.productDetails = productDetails;
                });
              });

              let containerQuotations = this.containerForm.get(
                'containerQuotations'
              ) as UntypedFormArray;
              containerQuotations.controls.forEach((containerQuotation, i) => {
                const po = this.purchaseOrdersList.find(
                  (po) => po.id == containerQuotation.value.quotationListView.id
                );
                const productPackages = containerQuotation
                  .get('quotationListView')
                  .get('productPackages') as UntypedFormArray;
                productPackages.clear();
                po?.productPackages?.forEach((productPackageValue) => {
                  const productPackageForm =
                    this.containerFormService.productPackageForm();
                  productPackageForm.patchValue(productPackageValue);
                  productPackages.push(productPackageForm);
                });
                containerQuotation.get('quotationListView').patchValue(po);
              });

              this.quotationsListLoaded = true;
            });
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          this.quotationsListLoaded = true;
        }
      );
  }

  loadPurchaseOrderPackagesList(uomQuery: any, poIds: any) {
    this.containerService
      .Get_All_PurchaseOrdersPackages(uomQuery, poIds)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.purchaseOrdersList = res;
          const productIds = [];
          this.purchaseOrdersList.forEach((order) => {
            order.productPackages.forEach((productpackage, index) => {
              productIds.push(productpackage.productId);
            });
          });
          this.containerService
            .getProductDetailByIds(productIds.join(','))
            .subscribe((res) => {
              this.purchaseOrdersList.forEach((order) => {
                order.productPackages.forEach((productPackage) => {
                  const productDetails = res.find(
                    (it) => it.id == productPackage.productId
                  );
                  productPackage.productDetails = productDetails;
                });
              });
              let containerOrders = this.containerForm.get(
                'containerOrders'
              ) as UntypedFormArray;
              containerOrders.controls.forEach((containerOrder, i) => {
                const po = this.purchaseOrdersList.find(
                  (po) => po.id == containerOrder.value.purchaseOrderDetail.id
                );
                const productPackages = containerOrder
                  .get('purchaseOrderDetail')
                  .get('productPackages') as UntypedFormArray;
                productPackages.clear();
                po?.productPackages?.forEach((productPackageValue) => {
                  const productPackageForm =
                    this.containerFormService.productPackageForm();
                  productPackageForm.patchValue(productPackageValue);
                  productPackages.push(productPackageForm);
                });
                containerOrder.get('purchaseOrderDetail').patchValue(po);
              });
              this.purchaseOrdersListLoaded = true;
            });
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          this.purchaseOrdersListLoaded = true;
        }
      );
  }

  loadPurchaseOrdersExportList(uomQuery: any) {
    this.containerService
      .Get_All_PurchaseOrdersExport(uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.purchaseOrdersList = res?.content;
          const poIds = this.purchaseOrdersList.map((it) => it.id);
          if (poIds?.length > 0) {
            this.loadPurchaseOrderPackagesList(uomQuery, poIds);
          } else {
            this.purchaseOrdersListLoaded = true;
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          this.purchaseOrdersListLoaded = true;
        }
      );
  }

  get containerOrderToName() {
    if (this.isExport) {
      const item = this.businessAccountService.customerList.find(
        (item) =>
          item.relationAccountId == this.containerForm.get('requestToId').value
      );
      return item?.name ? item?.name : 'Container Order To';
    } else {
      return this.currentBusinessAccount?.name;
    }
  }

  get containerTypeId() {
    return this.containerForm
      .get('containerTypeInformation')
      .get('containerTypeId');
  }

  get containerTypeWeightUom() {
    return this.containerForm
      .get('containerTypeInformation')
      .get('weight')
      .get('userConversionUom');
  }

  get containerTypeVolumeUom() {
    return this.containerForm
      .get('containerTypeInformation')
      .get('volume')
      .get('userConversionUom');
  }

  get containerOrders() {
    return this.containerForm.get('containerOrders') as UntypedFormArray;
  }

  isGlobalUomDisabled() {
    if (
      this.containerTypeId.value ||
      this.containerOrders?.controls?.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  actions(event) {
    this.currentStepIndex = event.index;
  }

  get isExport() {
    if (
      window.location.href.includes('export') ||
      window.location.href.includes('quotation')
    ) {
      return true;
    } else {
      return false;
    }
  }

  get isQuotation() {
    if (window.location.href.includes('quotation')) {
      return true;
    } else {
      return false;
    }
  }

  sendQuotation() {}

  navigateToHome() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
        data: { title: 'Save your changes before leaving?' },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          if (this.containerId) {
            this.onClickSave('DRAFT');
          } else {
            this.onClickSave('PUBLISH');
          }
        } else {
          if (this.isExport) {
            this.router.navigateByUrl(
              '/home/container-management/container/export'
            );
          } else {
            this.router.navigateByUrl(
              '/home/container-management/container/import'
            );
          }
        }
      });
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteContainer();
        }
      });
  }

  async deleteContainer() {
    try {
      const id: any = this.containerId;
      const data = await this.containerService.deleteContainer(id).toPromise();
      this.toastr.success('Successfully Deleted');
      if (this.isExport) {
        this.router.navigateByUrl(
          '/home/container-management/container/export'
        );
      } else {
        this.router.navigateByUrl(
          '/home/container-management/container/import'
        );
      }
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  get containerId() {
    return this.route.snapshot.params.id;
  }
}
