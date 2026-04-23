import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductTemplateListFormComponent } from './product-template-list-form/product-template-list-form.component';
import { ProductTemplateComponent } from './product-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProductTemplateRoutingModule } from './product-template-routing.module';
import { ProductTemplateListComponent } from './product-template-list/product-template-list.component';
import { TemplateInfoComponent } from './product-template-list-form/product-templates-steps/template-info/template-info.component';
import { TemplateProcessComponent } from './product-template-list-form/product-templates-steps/template-process/template-process.component';
import { TemplateCalculatorComponent } from './product-template-list-form/product-templates-steps/template-calculator/template-calculator.component';
import { ProcessComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/process.component';
import { EditProcessComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/edit-process/edit-process.component';
import { ProcessListComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/process-list/process-list.component';
import { SelectProcessNameComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/select-process-name.component';
import { ConfirmationDialogComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { SelectProductTypeComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-process-name/select-product-type/select-product-type.component';
import { SelectProductDropdownComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/edit-process/components/select-product-dropdown/select-product-dropdown.component';
import { CreateAttributeGroupModalComponent } from './product-template-list-form/product-templates-steps/components/create-attribute-group-modal/create-attribute-group-modal.component';
import { CreateToggleFieldModalComponent } from './product-template-list-form/product-templates-steps/components/create-toggle-field-modal/create-toggle-field-modal.component';
import { CreateDropdownFieldModalComponent } from './product-template-list-form/product-templates-steps/components/create-dropdown-field-modal/create-dropdown-field-modal.component';
import { UsageFormulasModalComponent } from './product-template-list-form/product-templates-steps/components/usage-formulas-modal/usage-formulas-modal.component';
import { ProductComponent } from './product-template-list-form/product-templates-steps/template-calculator/tabs/product/product.component';
import { PackageComponent } from './product-template-list-form/product-templates-steps/template-calculator/tabs/package/package.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AttributeValueModalComponent } from './product-template-list-form/product-templates-steps/components/attribute-value-modal/attribute-value-modal.component';
import { RawMaterialProcessComponent } from './product-template-list-form/product-templates-steps/template-process/components/process/raw-material-process/raw-material-process.component';
import { ProcessWasteModalComponent } from './product-template-list-form/product-templates-steps/components/process-waste-modal/process-waste-modal.component';
import { WasteOptionModalComponent } from './product-template-list-form/product-templates-steps/components/waste-option-modal/waste-option-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { A11yModule } from "@angular/cdk/a11y";
@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        ProductTemplateRoutingModule,
        MatTooltipModule,
        A11yModule,
        ProductTemplateComponent,
        ProductTemplateListFormComponent,
        ProductTemplateListComponent,
        TemplateInfoComponent,
        TemplateProcessComponent,
        TemplateCalculatorComponent,
        ProcessComponent,
        EditProcessComponent,
        RawMaterialProcessComponent,
        ProcessListComponent,
        SelectProcessNameComponent,
        ConfirmationDialogComponent,
        SelectProductTypeComponent,
        SelectProductDropdownComponent,
        CreateAttributeGroupModalComponent,
        CreateToggleFieldModalComponent,
        CreateDropdownFieldModalComponent,
        AttributeValueModalComponent,
        UsageFormulasModalComponent,
        ProductComponent,
        PackageComponent,
        ProcessWasteModalComponent,
        WasteOptionModalComponent
    ],
    exports: [
        CreateToggleFieldModalComponent,
        CreateDropdownFieldModalComponent
    ]
})
export class ProductTemplateModule { }
