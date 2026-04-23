import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';

import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderManagementService } from '../../../service/order-management.service';
import { OrderManagementFormsService } from '../../../service/order-management-forms.service';
import { NgFor, NgIf } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-create-attribute',
    templateUrl: './create-attribute.component.html',
    styleUrls: ['./create-attribute.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        NgSelectModule,
        NgFor,
        NgIf,
    ],
})
export class CreateAttributeComponent implements OnInit {
  listViewAttribute = null
  @Input() attributeConfigForm: UntypedFormGroup
  selectedAttributes: any[] = []
  attributes: any[] = []
  allTransactionCategories: any = []
  constructor(
    public toastr: ToastrService,
    public ordermanagementFormService: OrderManagementFormsService,
    public ordermanagementService: OrderManagementService,
    public fb: UntypedFormBuilder,
    public apiService: ApiService,
    public route: ActivatedRoute,
    public router: Router
  ) {
    this.apiService.Get_Product_Types()
    this.apiService.Get_All_Attributes()
    this.getAllTransactionCategories()

  }

  ngOnInit(): void {
    const id = this.route.snapshot.params.id
    if (id) {
      this.getDetailById(id)
    }
  }


  onChangeProductType(event: any) {
    const producttype = this.apiService.productTypes.find((ptype) => ptype.id == event.id)
    this.getProductTemplateDetails(producttype?.productTemplateId)
  }

  onCheckboxAttributeClick(attribute: any) {

    const index = this.selectedAttributes.findIndex((item) => (item?.attributeId) == (attribute?.attributeId))
    if (index == -1) {
      this.selectedAttributes.push({ attributeId: (attribute?.attributeId), sortOrder: attribute?.sortOrder })
    }
    else {
      this.selectedAttributes.splice(index, 1)
    }
  }

  isChecked(attribute) {
    const index = this.selectedAttributes.findIndex((item) => (item?.attributeId) == (attribute?.attributeId))
    if (index == -1) {
      return false
    }
    else {
      return true
    }
  }
  isCheckedProductSection(option: any) {

    const productOptions = this.attributeConfigForm.getRawValue()?.productOptions
    return productOptions?.includes(option)
  }
  isCheckedInfoSection(option:any) {
    const infoOptions= this.attributeConfigForm.getRawValue()?.infoOptions
    return infoOptions[option] ? true : false
   }

  isCheckedPriceSection(option: any) {
    const priceOptions = this.attributeConfigForm.getRawValue()?.priceOptions
    return priceOptions?.includes(option)
  }

  async getProductTemplateDetails(id: any) {
    const res: any = await this.apiService.Get_Single_Product_Template(id)?.toPromise();

    res?.productTemplateCalculator.productCalculatorTemplateAttributeValues.forEach((attr) => {
      if (this.checkIfAlreadyExist(attr) != -1) {
        this.attributes.splice(this.checkIfAlreadyExist(attr), 1)
        this.attributes.push(attr)
      }
      else {
        this.attributes.push(attr)
      }
    })
  }

  checkIfAlreadyExist(attr) {
    const index = this.attributes.findIndex((item) => item.attributeId == attr.attributeId)
    return index
  }


  expressionArray(item: any) {
    let it = item.attributeValueExpression;
    let prop = null
    if (it) {
      prop = JSON.parse(it?.replace(/'/g, '"'));
    }

    return prop
  }

  getAttributeObjectDescriptionById(item: any) {

    if (item?.attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == item?.attributeId
      );
      return selectedAttribute?.description ?? item?.attributeId?.description;
    } else {
      return;
    }
  }

  getAttributeTypeObjectById(attributeTypeId: any, item?: UntypedFormControl) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }


  getAllTransactionCategories() {
    this.apiService.Get_ALl_Transaction_Categories().subscribe((res: any) => {
      this.allTransactionCategories = res
      this.allTransactionCategories = this.allTransactionCategories.map((item) => ({ "description": item, "id": item }))
    })
  }

  saveProductAttributes() {
    let  productOptions = this.productOptions.value ?? []
    if (this.listViewAttribute) {
      const removeArray = ['PRODUCT_DESCRIPTION','PURCHASE_DESCRIPTION','EXPORT_DESCRIPTION']
      productOptions =  productOptions.filter(ele => !removeArray.includes(ele))      
      productOptions.push(this.listViewAttribute)
      this.productOptions.setValue(productOptions)
    }

    let formData = this.attributeConfigForm.getRawValue()
    formData.attributes = this.selectedAttributes
    this.ordermanagementService.saveProductAttributes(formData).subscribe((res) => {
      this.toastr.success('Successfully Saved !');
    }, (err) => {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    })
  }

  getDetailById(id: any) {
    this.ordermanagementService.getAllproductAttributeSetDetailById(id).subscribe((res) => {
      this.attributeConfigForm.patchValue(res)
      this.attributes = res?.attributes.map((item) => ({
        'attributeId': item.attributeId.id,
        'sortOrder': item.sortOrder
      }))
      this.selectedAttributes = res?.attributes.map((item) => ({
        'attributeId': item.attributeId.id,
        'sortOrder': item.sortOrder
      }))
      const productOptions: any[] = []

      res?.productOptions.forEach(productoption => {
        const index = productOptions.findIndex((item) => item == productoption)
        if (index == -1) {
          productOptions.push(productoption)
        }
        else {
          productOptions.splice(index, 1)
        }
        this.productOptions.setValue(productOptions)
      });

      const priceOptions: any[] = []
      res?.priceOptions.forEach(priceoption => {
        const index = priceOptions.findIndex((item) => item == priceoption)
        if (index == -1) {
          priceOptions.push(priceoption)
        }
        else {
          priceOptions.splice(index, 1)
        }
        this.priceOptions.setValue(priceOptions)
      });

     
      // this.attributeConfigForm?.getRawValue()?.infoOptions.forEach(ele => {
      //   this.onInfoSectionCheckboxClick(true,ele)
      // });
    }, (err) => {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    })
  }


  get transactionCategory() {
    return this.attributeConfigForm.get('transactionCategory')
  }

  get priceOptions() {
    return this.attributeConfigForm.get('priceOptions')
  }

  get productOptions() {
    return this.attributeConfigForm.get('productOptions')
  }
  get infoOptions() {
    return this.attributeConfigForm.get('infoOptions')
  }

  onPriceSectionCheckboxClick(type: any) {
    const priceOptions: any[] = this.priceOptions.value ?? []
    const index = priceOptions.findIndex((item) => item == type)
    if (index == -1) {
      priceOptions.push(type)
    }
    else {
      priceOptions.splice(index, 1)
    }

    this.priceOptions.setValue(priceOptions)
  }

  onInfoSectionCheckboxClick(type: any, event: any) {
    if (event.target.checked && type == 'WEIGHT') {
      this.infoOptions.get('WEIGHT').setValue('kg')
    }

    if (event.target.checked && type == 'CBM') {
      this.infoOptions.get('VOLUME').setValue('cbm')
    }

    if (event.target.checked && type == 'USD/MT') {
      this.infoOptions.get('METRICCOST').setValue('USD/mt')
    }

    if (!event.target.checked && type == 'WEIGHT') {
      this.infoOptions.get('WEIGHT').setValue(null)
    }

    if (!event.target.checked && type == 'CBM') {
      this.infoOptions.get('VOLUME').setValue(null)
    }

    if (!event.target.checked && type == 'USD/MT') {
      this.infoOptions.get('METRICCOST').setValue(null)
    }

  }
  onProductSectionCheckboxClick(type: any) {
    const productOptions: any[] = this.productOptions.value ?? []
    const index = productOptions.findIndex((item) => item == type)
    if (index == -1) {
      productOptions.push(type)
    }
    else {
      productOptions.splice(index, 1)
    }

    this.productOptions.setValue(productOptions)
  }

  navigate(link: any) {
    this.router.navigateByUrl(link)
  }

  public onSelectAll() {
    const selected = this.allTransactionCategories.map(item => item.id);
    this.transactionCategory.patchValue(selected);
  }

  public onClearAll() {
    this.transactionCategory.patchValue(null);
  }

  onOption(event: any) {
    if (event.target.checked) {
      this.onSelectAll()
    }
    else {
      this.onClearAll()
    }
  }


  patchEditData() {

  }


}
