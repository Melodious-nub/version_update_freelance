import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { APPCOMMONHELPERS } from 'src/app/helpers/appcommonhelpers';
import { ProductTypeFormService } from '../../service/product-type-form.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-buying-capacity-common',
    templateUrl: './buying-capacity-common.component.html',
    styleUrls: ['./buying-capacity-common.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule]
})
export class BuyingCapacityCommonComponent implements OnInit, OnChanges {

    @Input() buyingCapacities: UntypedFormArray;

    buyingCapacitiesList = [
        {
            index: 0,
            label: 'SKU'
        },
        {
            index: 1,
            label: 'UNIT'
        },
        {

            index: 2,
            label: 'CONTAINER'
        },
        {
            index: 3,
            label: 'PALLET'
        }
    ];
  
    buyingCapacityTypeArray: any = ['UNIT', 'SKU', 'PALLET', 'CONTAINER'];

    constructor(public formService: ProductTypeFormService, private route:ActivatedRoute) {
     
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.removeEmptyBuyingCapacities()
    }


    removeEmptyBuyingCapacities() {
        const index = this.buyingCapacities.controls.findIndex((it) => { it.get('buyingCapacityType').value == null })
        this.removeBc(index)
    }

    ngOnInit(): void {
        if (this.route.snapshot.params.id) {
            return;
        }
    
        const form1 = this.formService.createBuyingCapacityForm()
        form1.get("buyingCapacityType").setValue("UNIT");
        form1.get("marginPercent").setValue(60);
        form1.get("markupPercent").setValue(150);
        form1.get("decimalValue").setValue(0.5);
        this.buyingCapacities.push(form1);

        const form2 = this.formService.createBuyingCapacityForm()
        form2.get("buyingCapacityType").setValue("SKU");
        form2.get("marginPercent").setValue(45);
        form2.get("markupPercent").setValue(81.82);
        form2.get("decimalValue").setValue(0.25);
        this.buyingCapacities.push(form2);

        const form3 = this.formService.createBuyingCapacityForm()
        form3.get("buyingCapacityType").setValue("PALLET");
        form3.get("marginPercent").setValue(25);
        form3.get("markupPercent").setValue(33.33);
        form3.get("decimalValue").setValue(0.25);
        this.buyingCapacities.push(form3);

        const form4 = this.formService.createBuyingCapacityForm()
        form4.get("buyingCapacityType").setValue("CONTAINER");
        form4.get("marginPercent").setValue(10);
        form4.get("markupPercent").setValue(11.11);
        form4.get("decimalValue").setValue(0.10);
        this.buyingCapacities.push(form4);
    }

    calculateMarginAndMarkup(i, type) {
        const marginPercent = this.buyingCapacities.controls[i].get('marginPercent')
        const markupPercent = this.buyingCapacities.controls[i].get('markupPercent')
        if (type == 'margin') {
            let val = Number.parseInt(marginPercent.value);
            let a = ((val / (100 - val)) * 100).toFixed(2);
            markupPercent.setValue(a);
            return;
        }
        if (type == 'markup') {
            let val = Number.parseInt(markupPercent.value);
            let b = (100 / (100 / val + 1)).toFixed(2);
            marginPercent.setValue(b);
            return;
        }
    }

    addBc() {
        const form = this.formService.createBuyingCapacityForm()
        this.buyingCapacities.push(form)
    }

    removeBc(i) {
        this.buyingCapacities.removeAt(i)
    }

    isBuyingCapacityTypeExist(item) {
        const selectedBuyingCapacities = this.buyingCapacities.value.map((itm) => itm.buyingCapacityType)
        return selectedBuyingCapacities.includes(item.label) ? true : false
    }

}
