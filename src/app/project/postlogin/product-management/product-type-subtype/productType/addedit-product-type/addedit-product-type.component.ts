import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductManagementService } from '../../../service/product-management.service';
import { ApiService } from 'src/app/service/api.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductTypeFormService } from '../../service/product-type-form.service';

@Component({
    selector: 'app-addedit-product-type',
    templateUrl: './addedit-product-type.component.html',
    styleUrls: ['./addedit-product-type.component.scss']
})

export class AddeditProductTypeComponent implements OnInit {

    public productTypeForm: any = this.formService.createProductTypeForm()
    public productTemplatesList: any[] = [];
    public productSubtypeList: any[] = [];
    public customerCategories: any[] = [];



    constructor(public productmanagementService: ProductManagementService,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService, public apiService: ApiService, public dialog: MatDialog, public formService: ProductTypeFormService) {
    }

    ngOnInit(): void {
        this.apiService.getAllMetaDatas()
        this.apiService.Get_Product_Types();
        this.loadProductTemplates();

        if (this.route.snapshot.params.id) {
            this.patchEditData(this.route.snapshot.params.id)
        }

    }

    handleSubType(event: any) {
        if (event) {
            this.loadProductSubTypes(event);
        }
    }

    get productSubTypes() {
        return this.productTypeForm.get('productSubTypes')
    }


    get selectedProductCategories() {
        return this.productTypeForm.get('productCategoryIds');
    }

    get additionalCosts() {
        return this.productTypeForm.get('additionalCosts') as UntypedFormArray;
    }


    get buyingCapacities() {
        return this.productTypeForm.get('buyingCapacities') as UntypedFormArray;
    }


    async patchEditData(id: any) {
        try {
            const data = await this.productmanagementService
                .getProductTypeBindingData(id)
                .toPromise();
            data.additionalCosts.forEach(element => {
                const form = this.formService.createAdditionalCostForm()
                const acValues = form.get('additionalCostValues') as UntypedFormArray;
                element.additionalCostValues.forEach(acvalue => {
                    const fy = this.formService.createAdditionalCostValueForm()
                    acValues.push(fy)
                })
                this.additionalCosts.push(form)
            });

            data.buyingCapacities.forEach(element => {
                const form = this.formService.createBuyingCapacityForm()
                this.buyingCapacities.push(form)
            });

            this.productTypeForm.patchValue(data, {
                emitEvent: false,
                onlySelf: true,
              })
        }

        catch (err) {
            console.log(err)
            this.toastr.error(err?.error?.userMessage ?? 'Something went wrong')
        }

    }

    loadProductSubTypes(searchText: string): void {
        this.productmanagementService.getProductSubTypes(searchText).subscribe((data: any) => {
            if (this.productSubTypes.value) {
                const filteredArray1 = data.filter(item1 => !this.productSubTypes.value.some(item2 => item1.id === item2.id));
                this.productSubtypeList = filteredArray1;
            }
            else {
                this.productSubtypeList = data;
            }
        });
    }


    loadProductTemplates(): void {
        this.productmanagementService.getPublishedProductTemplates().subscribe((data: any) => {
            data.forEach(element => {
                this.productTemplatesList.push({
                    description: element.templateName, id: element.id, data: element
                });
            });
            this.productTemplatesList = JSON.parse(JSON.stringify(this.productTemplatesList));
        });
    }




    onClickBack(): void {
        this.router.navigateByUrl('home/product-management/product-type');
    }



   async onClickSave() {
        try {
            let request: any = this.productTypeForm.getRawValue();
            await this.productmanagementService.saveProductType(request)   
            this.toastr.success("Product Type Updated Successfully.");
            this.router.navigateByUrl('home/product-management/product-type');
        }
        catch (err: any) {
            this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
    }


    confirmDelete() {
        this.dialog
            .open(ConfirmDialogComponent, {
                width: '25%',
            })
            .afterClosed()
            .subscribe(async (res) => {
                if (res) {
                    this.deleteProductType();
                }
            });
    }

    async deleteProductType() {
        try {
            const productTypeId: any = this.route.snapshot.params.id;
            const data = await this.productmanagementService
                .deleteProductType(productTypeId)
                .toPromise();
            this.toastr.success('Successfully Deleted');
            this.router.navigateByUrl('/home/product-management/product-type')
        } catch (err: any) {
            this.toastr.error(err ?? 'Some Error Occurred');
        }
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

    goBack(){     
        if(this.productTypeForm.dirty) {
          this.dialog
          .open(ConfirmDialogComponent, {
            width: '25%',
          })
          .afterClosed()
          .subscribe(async (res) => {
            if (res) {
              this.router.navigateByUrl("/home/product-management/product-type")
            }
          });
        }
        else {
          this.router.navigateByUrl("/home/product-management/product-type")
        }  
      }
    


}
