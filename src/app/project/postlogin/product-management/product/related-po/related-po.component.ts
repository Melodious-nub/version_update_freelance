import { UntypedFormArray, FormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { NumberFormatterPipe } from '../../../../../shared/pipes/number-formatter.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-related-po',
    templateUrl: './related-po.component.html',
    styleUrls: ['./related-po.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelContent,
        DadyinButtonComponent,
        MatTooltip,
        NumberFormatterPipe
    ]
})
export class RelatedPoComponent implements OnInit {
  toastr = inject(ToastrService);
  apiService = inject(ApiService);
  formsService = inject(FormsService);
  uomService = inject(UomService);

  relatedPoDetails: any;
  @Input() productForm: UntypedFormGroup;

  @Input() componentUoms: UntypedFormArray;
  @Output() calculate = new EventEmitter();
  skuQuantities: any[] = [
    { name: '1-5 (SKUS)', key: 'SKU1TO5' },
    { name: '6-20 (SKUS)', key: 'SKU6TO20' },
    { name: '21+ (SKUS)', key: 'SKU21' },
    { name: 'PALLET', key: 'Pallet' },
  ];

  ngOnInit(): void {
    this.getRelatedPoDetails();
    this.getCalculatedValues();
  }

  async getCalculatedValues() {
    this.calculate.emit(null);
    this.apiService.syncTemplate.setValue(false);
  }

  async getRelatedPoDetails() {
    try {
      let id: any = this.productForm.get('id').value;
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        uomQuery =
          uomQuery +
          `&uomMap[${element.get('attributeName').value}]=${
            element.get('userConversionUom').value
          }`;
      });
      uomQuery = encodeURI(uomQuery);
      // if (productTypeId) {
      //   let selectedProductType: any = await this.apiService.Get_Product_Type_ById(productTypeId);
      //   this.buyingCapacity = selectedProductType?.buyingCapacities;
      //   this.buyingCapacity.map(it=>{
      //     if(it.buyingCapacityType=='UNIT') {
      //      it.buyingCapacityType= 'Retailer(Small)'
      //     }
      //     if(it.buyingCapacityType=='SKU') {
      //       it.buyingCapacityType= 'Retailer(Big)'
      //     }
      //   })
      // }
      if (id) {
        const res: any = await this.apiService
          .Get_Related_PO_Details(id, uomQuery)
          .toPromise();
        this.relatedPoDetails = res;
      }
    } catch (err: any) {
      this.toastr.error('Error in getting Related PO Data');
    }
  }
  get packages() {
    return this.productForm.get('packages').value;
  }

  get tierPricingCustomization() {
    return this.productForm
      .get('tierPricingDetail')
      .get('tierPricingCustomization') as UntypedFormArray;
  }

  get tierPricingQuickCheckout() {
    return this.productForm
      .get('tierPricingDetail')
      .get('tierPricingQuickCheckout') as UntypedFormArray;
  }

  removeTierPricingCustom(i) {
    this.tierPricingCustomization.removeAt(i);
  }

  addTierPricingCustomForm(index?: any) {
    const Form = this.formsService.createCustomTierPricingForm();
    Form.get('sortOrder').patchValue(
      this.tierPricingCustomization.controls.length
    );
    const deliveryPricingArray = Form.get('deliveryPricing') as UntypedFormArray;
    this.deliveryPricings(0).controls.forEach((ele, j) => {
      const deliverForm = this.formsService.createDeliveryPricingForm();
      deliverForm.get('numberOfDays').patchValue(ele.get('numberOfDays').value);
      deliverForm.get('metricCost').patchValue(ele.get('metricCost').value);
      deliverForm.get('sortOrder').patchValue(j);
      deliveryPricingArray.push(deliverForm);
    });
    if (index || index == 0) {
      this.tierPricingCustomization.controls.splice(index, 0, Form);
      this.tierPricingCustomization.updateValueAndValidity();
    } else {
      this.tierPricingCustomization.push(Form);
    }
    this.tierPricingCustomization.controls.forEach((ele, index) => {
      ele.get('sortOrder').patchValue(index);
    });
  }

  addFirstTierPricingCustomForm() {
    const Form = this.formsService.createCustomTierPricingForm();
    Form.get('sortOrder').setValue(
      this.tierPricingCustomization.controls.length
    );
    const deliveryPricingArray = Form.get('deliveryPricing') as UntypedFormArray;
    const deliverForm = this.formsService.createDeliveryPricingForm();
    deliverForm.get('numberOfDays').setValue(0);
    deliverForm.get('sortOrder').setValue(deliveryPricingArray.controls.length);
    deliveryPricingArray.push(deliverForm);
    this.tierPricingCustomization.push(Form);
  }

  onChangeMinQuantity(i, event) {
    const secondLastItem = this.tierPricingCustomization.controls[i - 1];
    if (secondLastItem) {
      const eventValue = Number(event.target.value - 1);
      const firstItemMinQuantity = Number(
        this.tierPricingCustomization.controls[0].get('minimumQuantity').value
      );
      if (eventValue <= secondLastItem.get('minimumQuantity').value) {
        if (eventValue < firstItemMinQuantity) {
          // Update the first item if the event value is less than its minimum quantity
          this.addTierPricingCustomForm(0);
          this.tierPricingCustomization.controls[0]
            .get('minimumQuantity')
            .setValue(event.target.value);
          this.tierPricingCustomization.controls[0]
            .get('maximumQuantity')
            .setValue(
              this.tierPricingCustomization.controls[1].get('minimumQuantity')
                .value - 1
            );
        } else {
          // Loop to find where the event value fits within the existing ranges
          for (let i = 0; i < this.tierPricingCustomization.length - 1; i++) {
            const currentMinQuantity = Number(
              this.tierPricingCustomization.controls[i].get('minimumQuantity')
                .value
            );
            if (currentMinQuantity > eventValue + 1) {
              this.tierPricingCustomization.controls[i - 1]
                .get('maximumQuantity')
                .setValue(eventValue);
              this.addTierPricingCustomForm(i);
              const nextMinQuantity =
                this.tierPricingCustomization.controls[i + 1].get(
                  'minimumQuantity'
                ).value - 1;
              this.tierPricingCustomization.controls[i]
                .get('minimumQuantity')
                .setValue(eventValue + 1);
              this.tierPricingCustomization.controls[i]
                .get('maximumQuantity')
                .setValue(nextMinQuantity);
              break;
            }
          }
        }

        // Remove the last tier and update the previous item's maximum quantity
        secondLastItem.get('maximumQuantity').setValue(null);
        this.tierPricingCustomization.controls.pop();
        return;
      } else {
        // Update the previous item's maximum quantity
        secondLastItem.get('maximumQuantity').setValue(eventValue);
      }
    }
  }
  deliveryPricings(i: any) {
    const tierPricingCustomization = this.productForm
      .get('tierPricingDetail')
      .get('tierPricingCustomization') as UntypedFormArray;
    return tierPricingCustomization.controls[i].get(
      'deliveryPricing'
    ) as UntypedFormArray;
  }

  removeDeliveryPricing(j) {
    this.tierPricingCustomization.controls.forEach((tierPricing, i) => {
      this.deliveryPricings(i).removeAt(j);
    });
  }

  onChangeDaysorCost(j) {
    this.tierPricingCustomization.controls.forEach((tierPricing, i) => {
      this.deliveryPricings(i).patchValue(this.deliveryPricings(0).value);
    });
    this.getCalculatedValues();
  }

  addDeliveryPricingForm() {
    this.tierPricingCustomization.controls.forEach((tierPricing, i) => {
      const deliverForm = this.formsService.createDeliveryPricingForm();
      deliverForm.get('sortOrder').patchValue(this.deliveryPricings(i)?.length);
      this.deliveryPricings(i).push(deliverForm);
    });
  }

  calculateMarginAndMarkup(i, type) {
    const marginPercent = this.tierPricingCustomization.controls[i].get('marginPercent');
    const markupPercent = this.tierPricingCustomization.controls[i].get('markupPercent');
    if (type == 'margin') {
      this.tierPricingCustomization.controls[i].get('calculationType').setValue('MARGIN');
      let val = Number.parseInt(marginPercent.value);
      let a = ((val / (100 - val)) * 100).toFixed(2);
      markupPercent.setValue(a);
      this.getCalculatedValues();
      return;
    }
    if (type == 'markup') {
      let val = Number.parseInt(markupPercent.value);
      let b = (100 / (100 / val + 1)).toFixed(2);
      marginPercent.setValue(b);
      this.getCalculatedValues();
      return;
    }
  }
  calculateMarginAndMarkupQuickCheckout(i, type) {
    const marginPercent =
      this.tierPricingQuickCheckout.controls[i].get('marginPercent');
    const markupPercent =
      this.tierPricingQuickCheckout.controls[i].get('markupPercent');
    if (type == 'margin') {
      let val = Number.parseInt(marginPercent.value);
      let a = ((val / (100 - val)) * 100).toFixed(2);
      markupPercent.setValue(a);
      this.getCalculatedValues();
      return;
    }
    if (type == 'markup') {
      let val = Number.parseInt(markupPercent.value);
      let b = ((val / (1 + val)) * 100).toFixed(2);
      marginPercent.setValue(b);
      this.getCalculatedValues();
      return;
    }
  }

  onUnitPriceChange(i: number) {
    const unitPrice = this.tierPricingCustomization.controls[i]
      .get('tierCost')
      .get('attributeValue').value;
    this.tierPricingCustomization.controls[i]
      .get('calculationType')
      .setValue(unitPrice != null && unitPrice !== '' ? 'COST' : 'MARGIN');
    this.getCalculatedValues();
  }

  get buyingCapacities() {
    return this.productForm.get('productBuyingCapacities');
  }
}
