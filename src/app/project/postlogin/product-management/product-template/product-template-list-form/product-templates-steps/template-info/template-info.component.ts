import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';


@Component({
  selector: 'template-info',
  templateUrl: './template-info.component.html',
  styleUrls: ['./template-info.component.scss'],
})
export class TemplateInfoComponent implements OnInit {
  @Input() templateForm: UntypedFormGroup;

  submitted = false;

  public accordionFlags: { [k: string]: boolean };

  selectedProductsTypes: any = [];
  selectedProductsSubTypes: any = [];
  industryTypes: any = [];
  industrySubTypes: any = [];

  /*##################### Template Information Form #####################*/

  constructor(public apiService: ApiService, public fb: UntypedFormBuilder, public formsService: FormsService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getIndustrySubTypes()
    this.industryType.valueChanges.subscribe(res => {
      this.industrySubType.setValue(null);
      this.getIndustrySubTypes()
    })
  }

  public onClickToggleAccordion(propertyName: string): void {
    if (!this.accordionFlags[propertyName]) {
      this.accordionFlags[propertyName] = true;
    } else {
      this.accordionFlags[propertyName] = false;
    }
  }

  selectedProductTypes(type: string) {
    let data = this.productTypes.value;
    if (data.includes(type)) {
      const index = data.indexOf(type);
      if (index > -1) {
        data.splice(index, 1);
      }
    } else {
      this.productTypes.value.push(type);
    }
    this.productTypes.patchValue(data);
  }

  selectedProductSubTypes(type: string) {
    let data = this.productSubTypes.value;
    if (data.includes(type)) {
      const index = data.indexOf(type);
      if (index > -1) {
        data.splice(index, 1);
      }
    } else {
      this.productTypes.value.push(type);
    }
    this.productSubTypes.patchValue(data);
  }

  get industryType() {
    return this.templateForm.get('industryTypeId');
  }
  get industrySubType() {
    return this.templateForm.get('industrySubTypeId');
  }


  get productTypes() {
    return this.templateForm.get('productTypeIds');
  }

  get productSubTypes() {
    return this.templateForm.get('productSubTypeIds');
  }

  getIndustrySubTypes() {

    if (this.industryType.value) {
      let industryType = this.apiService.getDataByAttr(
        this.apiService.allIndustryTypes,
        'id',
        Number(this.industryType.value)
      );
      let mappedArray: any
      if (industryType) {
        mappedArray = this.mapArray(industryType.industryTypeSubTypes);
        this.industrySubTypes = mappedArray
      }

    }
  }


  mapArray(array) {
    return array?.map(originalObject => {
      if (originalObject && originalObject.industrySubType) {
        const { id, description } = originalObject.industrySubType;
        return {
          id,
          description
        };
      } else {
        return null;
      }
    });
  }

  getProductTypeObjectById(id: any) {
    let productType: any = this.apiService.productTypes.find(
      (el) => {
        return Number(id) === Number(el.id);
      }
    );
    return productType
  }

  getProductSubTypeObjectById(id: any) {
    let productSubType: any = this.apiService.productSubTypes.find(
      (el) => {
        return Number(id) === Number(el.id);
      }
    );
    return productSubType
  }
}
