import {
    CUSTOM_ELEMENTS_SCHEMA,
    NgModule,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteDialogComponent } from './dialogs/delete/delete-dialog.component';
import { AddCostDialogComponent } from './dialogs/add-cost/add-cost-dialog.component';
import { AddNewAttributesDialogComponent } from './dialogs/add-new-attributes/add-new-attributes-dialog.component';
import { AddRawMaterialDialogComponent } from './dialogs/add-raw-material/add-raw-material-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm/confirm-dialog.component';
import { SuccessDialogComponent } from './dialogs/succes/success-dialog.component';
import { SearchFilterComponent } from './component/search-filter/search-filter.component';
import { NumberFormatterPipe } from './pipes/number-formatter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { EditCalculatorComponent } from './component/edit-calculator/edit-calculator.component';
import { SpinnerOverlayComponent } from './component/spinner-overlay/spinner-overlay.component';
import { TimePickerComponent } from './widgets/time-picker/time-picker.component';
import { ComponentDialogComponent } from './dialogs/component-dialog/component-dialog.component';
import { AlertDialogComponent } from './component/alert-dialog/alert-dialog.component';
import { HttpService } from '../service/http.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductTypesComponent } from './component/product-types/product-types.component';
import { ApiService } from '../service/api.service';
import { DadyinButtonComponent } from './widgets/dadyin-button/dadyin-button.component';
import { DadyinInputComponent } from './widgets/dadyin-input/dadyin-input.component';
import { DadyinCheckBoxComponent } from './widgets/dadyin-checkbox/dadyin-checkbox.component';
import { DadyinDatePickerComponent } from './widgets/dadyin-datepicker/dadyin-datepicker.component';
import { DadyinSelectComponent } from './widgets/dadyin-select/dadyin-select.component';
import { InviteDialogComponent } from './component/invite-dialog/invite-dialog.component';
import { DadyinRadioButtonComponent } from './widgets/dadyin-radio-button/dadyin-radio-button.component';
import { DadyinSelectedValueComponent } from './widgets/dadyin-selected-value/dadyin-selected-value.component';
import { BuddyDialogComponent } from './component/buddy-dialog/buddy-dialog.component';
import { DadyinTabComponent } from './widgets/dadyin-tab/dadyin-tab.component';
import { PrintTemplatesComponent } from './print-templates/print-templates.component';
import { UnloadingSheetComponent } from './print-templates/unloading-sheet/unloading-sheet.component';
import { DateScrollComponent } from './component/date-scroll/date-scroll.component';
import { SortFormArrayPipe } from './pipes/sort-formarray-sortorder.pipe';
import { SortNamePipe } from './pipes/sort-array-ascending-name.pipe';
import { MapDialogComponent } from './dialogs/map-dialog/map-dialog.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientJsonpModule } from '@angular/common/http';
import { DadyinMapAutoCompleteComponent } from './widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { RateDialogComponent } from './dialogs/rate-dialog/rate-dialog.component';
import { DadyinSearchSelectNewComponent } from './widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DataTableComponent } from './component/data-table/data-table.component';
import { ShortNamePipe } from './pipes/sort-format.pipe';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DadyinSearchableSelectComponent } from './widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { DadyinSliderComponent } from './widgets/dadyin-slider/dadyin-slider.component';
import { DadyinCardSliderComponent } from './widgets/dadyin-card-slider/dadyin-card-slider.component';
import { SwiperModule } from 'swiper/angular';
// import Swiper core and required modules
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { GridViewProductCardComponent } from '../project/postlogin/quick-checkout/order/grid-view-product-card/grid-view-product-card.component';
import { TermsDialogComponent } from './dialogs/terms/terms-dialog.component';
import { CustomizeGuidelineDialogComponent } from './dialogs/customizeGuideline/customizeGuideline-dialog.component';
import { SortProductPipe } from './pipes/sort-array-product.pipe';
import { QcmobileDialogComponent } from './dialogs/qcmobile/qcmobile-dialog.component';
import { SortNumberPropertyPipe } from './pipes/sort-number-property.pipe';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DataTableEditableComponent } from './component/data-table-editable/data-table-editable.component';
import { OrderTransactionPackagesComponent } from './component/order-transaction-packages/order-transaction-packages.component';
import { ThreeSceneComponent } from './component/three-scene/three-scene.component';
import { PricecompareDialogComponent } from './component/pricecompare-dialog/pricecompare-dialog.component';
import { PaymentDialogComponent } from './dialogs/payment/payment-dialog.component';
import { ChangePasswordDialogComponent } from './dialogs/change-password/change-password.component';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);


@NgModule({
    declarations: [
        DeleteDialogComponent,
        AddCostDialogComponent,
        AddNewAttributesDialogComponent,
        AddRawMaterialDialogComponent,
        ConfirmDialogComponent,
        SuccessDialogComponent,
        SearchFilterComponent,
        NumberFormatterPipe,
        EditCalculatorComponent,
        SpinnerOverlayComponent,
        DadyinInputComponent,
        DadyinCheckBoxComponent,
        DadyinButtonComponent,
        DadyinDatePickerComponent,
        TimePickerComponent,
        DadyinSelectComponent,
        ComponentDialogComponent,
        AlertDialogComponent,
        ProductTypesComponent,
        InviteDialogComponent,
        DadyinRadioButtonComponent,
        DadyinSelectedValueComponent,
        BuddyDialogComponent,
        DadyinTabComponent,
        PrintTemplatesComponent,
        UnloadingSheetComponent,
        DateScrollComponent,
        SortFormArrayPipe,
        SortProductPipe,
        SortNamePipe,
        MapDialogComponent,
        DadyinMapAutoCompleteComponent,
        RateDialogComponent,
        DadyinSearchSelectNewComponent,
        DataTableComponent,
        DataTableEditableComponent,
        DadyinSearchableSelectComponent,
        DadyinSliderComponent,
        DadyinCardSliderComponent,
        GridViewProductCardComponent,
        TermsDialogComponent,
        CustomizeGuidelineDialogComponent,
        QcmobileDialogComponent,
        SortNumberPropertyPipe,
        OrderTransactionPackagesComponent,
        ThreeSceneComponent,
        PricecompareDialogComponent,
        PaymentDialogComponent,
        ChangePasswordDialogComponent,
        OrderByPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        NgSelectModule,
        HttpClientJsonpModule,
        GoogleMapsModule,
        NgbTooltipModule,
        SwiperModule,
        DragDropModule, 
        CKEditorModule
    ],
    exports: [
        DeleteDialogComponent,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        AddCostDialogComponent,
        AddNewAttributesDialogComponent,
        AddRawMaterialDialogComponent,
        ConfirmDialogComponent,
        QcmobileDialogComponent,
        CKEditorModule,
        SuccessDialogComponent,
        SearchFilterComponent,
        EditCalculatorComponent,
        SpinnerOverlayComponent,
        DadyinInputComponent,
        DadyinTabComponent,
        DadyinCheckBoxComponent,
        DadyinButtonComponent,
        DadyinDatePickerComponent,
        DadyinSelectedValueComponent,
        TimePickerComponent,
        DadyinSelectComponent,
        DadyinRadioButtonComponent,
        ComponentDialogComponent,
        NgSelectModule,
        MatSnackBarModule,
        ProductTypesComponent,
        InviteDialogComponent,
        BuddyDialogComponent,
        PrintTemplatesComponent,
        UnloadingSheetComponent,
        DateScrollComponent,
        SortFormArrayPipe,
        SortProductPipe,
        SortNamePipe,
        NumberFormatterPipe,
        SortNumberPropertyPipe,
        MapDialogComponent,
        DadyinMapAutoCompleteComponent,
        RateDialogComponent,
        DadyinSearchSelectNewComponent,
        DataTableComponent,
        DadyinSearchableSelectComponent,
        NgbTooltipModule,
        DadyinSliderComponent,
        DadyinCardSliderComponent,
        SwiperModule,
        GridViewProductCardComponent,
        TermsDialogComponent,
        CustomizeGuidelineDialogComponent,
        DragDropModule,
        DataTableEditableComponent,
        OrderTransactionPackagesComponent,
        ThreeSceneComponent,
        PaymentDialogComponent,
        ChangePasswordDialogComponent,
        OrderByPipe
    ],
    providers: [HttpService, ApiService, SortFormArrayPipe, SortNamePipe,SortNumberPropertyPipe, ShortNamePipe, NumberFormatterPipe,SortProductPipe, OrderByPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SharedModule { }
