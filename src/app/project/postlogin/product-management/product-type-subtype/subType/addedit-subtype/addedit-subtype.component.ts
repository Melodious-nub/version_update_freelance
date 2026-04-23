import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, FormControl, UntypedFormGroup, Validators, FormBuilder, Form, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductManagementService } from '../../../service/product-management.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { ProductTypeFormService } from '../../service/product-type-form.service';
import { BuyingCapacityCommonComponent } from '../../common/buying-capacity-common/buying-capacity-common.component';
import { AdditionalCostCommonComponent } from '../../common/additional-cost-common/additional-cost-common.component';
import { NgFor } from '@angular/common';
import { DadyinInputComponent } from '../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-addedit-subtype',
    templateUrl: './addedit-subtype.component.html',
    styleUrls: ['./addedit-subtype.component.scss'],
    standalone: true,
    imports: [DadyinButtonComponent, FormsModule, ReactiveFormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, DadyinInputComponent, NgFor, AdditionalCostCommonComponent, BuyingCapacityCommonComponent]
})
export class AddeditSubtypeComponent implements OnInit {
    public productSubTypeForm: UntypedFormGroup = this.formService.createProductSubTypeForm()
    public productTemplatesList: any = [];




    constructor(public productmanagementService: ProductManagementService,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService, public apiService: ApiService, public dialog: MatDialog, public formService: ProductTypeFormService) {
    }

    ngOnInit(): void {
        this.apiService.getAllMetaDatas()
        this.loadProductTemplates();

        if (this.route.snapshot.params.id) {
            this.patchEditData(this.route.snapshot.params.id)
        }

        this.apiService.Get_Product_Types();
    }


    get productSubTypes() {
        return this.productSubTypeForm.get('productSubTypes')
    }


    get selectedProductCategories() {
        return this.productSubTypeForm.get('productCategoryIds');
    }

    get additionalCosts() {
        return this.productSubTypeForm.get('additionalCosts') as UntypedFormArray;
    }


    get buyingCapacities() {
        return this.productSubTypeForm.get('buyingCapacities') as UntypedFormArray;
    }


    async patchEditData(id: any) {
        try {
            const data = await this.productmanagementService
                .getProductSubTypeBindingData(id)
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


            this.productSubTypeForm.patchValue(data)
            
        }
        catch (err) {

            this.toastr.error(err?.error?.userMessage ?? 'Something went wrong')
        }

    }

    get productTypeId() {
      return  this.productSubTypeForm.get('productTypeId')
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
        this.router.navigateByUrl('home/product-management/product-type?currentIndex=1');
    }





    async onClickSave() {
        try {
            let request: any = this.productSubTypeForm.getRawValue();
            await this.productmanagementService.saveProductSubType(request)
            this.toastr.success("Product Sub Type Updated Successfully.");
            this.router.navigateByUrl('home/product-management/product-type?currentIndex=1');
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
                    this.deleteProductSubType();
                }
            });
    }

    async deleteProductSubType() {
        try {
            const productSubTypeId: any = this.route.snapshot.params.id;
            const data = await this.productmanagementService
                .deleteProductSubType(productSubTypeId)
                .toPromise();
            this.toastr.success('Successfully Deleted');
            this.router.navigateByUrl('home/product-management/product-type?currentIndex=1')
        } catch (err: any) {

            this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
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

    goBack() {

        if (this.productSubTypeForm.dirty) {
            this.dialog
                .open(ConfirmDialogComponent, {
                    width: '25%',
                })
                .afterClosed()
                .subscribe(async (res) => {
                    if (res) {
                        this.router.navigateByUrl("/home/product-management/product-type?currentIndex=1")
                    }
                });
        }
        else {
            this.router.navigateByUrl("/home/product-management/product-type?currentIndex=1")
        }
    }

}
