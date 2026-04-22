import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/service/forms.service';
import { ContainerManagementService } from '../../../container-management/service/container-management.service';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { UomService } from 'src/app/service/uom.service';
import { DadyinSearchableSelectComponent } from '../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
    selector: 'app-other-details',
    templateUrl: './other-details.component.html',
    styleUrls: ['./other-details.component.scss'],
    standalone: true,
    imports: [
        MatExpansionModule,
        DadyinButtonComponent,
        NgFor,
        MatTooltipModule,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        DadyinSearchableSelectComponent,
        DatePipe,
    ],
})
export class OtherDetailsComponent implements OnInit {

  @Input() productForm: UntypedFormGroup;

  @Input() componentUoms: UntypedFormArray;


  isLoadingCompetitorPrices: boolean = false;

  constructor(
    public toastr: ToastrService,
    public apiService: ApiService,
    public formsService: FormsService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public uomService: UomService
  ) { }

  ngOnInit(): void {
    this.businessAccountService.Get_All_Vendors()
    // this.getAllProductsForPackage()
    this.fetchCompetitorPrices();
  }


  // getAllProductsForPackage() {
  //   let uomQuery = ``;
  //   this.componentUoms.controls.forEach((element) => {
  //     uomQuery =
  //       uomQuery +
  //       `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
  //       }`;
  //   });
  //   uomQuery = encodeURI(uomQuery);
  //   this.apiService.Get_All_Product_List_IsPackage(uomQuery, '').subscribe(res => {
  //     this.apiService.allproductsWithIsPackage = res
  //   })
  // }





  get similarProducts() {
    return this.productForm.get('similarProducts') as UntypedFormArray;
  }

  removeSimilarProduct(i) {
    this.similarProducts.removeAt(i);
  }

  addSimilarProductForm() {
    this.similarProducts.push(this.formsService.createSimilarProductForm());
  }

  get keywords() {
    return this.productForm.get('keyWords');
  }

  addKeyword(inp: any) {
    if (!inp.value) {
      return;
    }
    let data: any = this.keywords.value
    data.push(inp.value)
    inp.value = ''
    this.keywords.setValue(data);
  }

  removeKeyword(i: any) {
    let data: any = this.keywords.value
    data.splice(i, 1)
    this.keywords.setValue(data);
  }

  setProductName(event: any, similarProduct) {
    const product = this.apiService.allproductsWithIsPackage.find(item => item.productCode == event)
    similarProduct.get('productName').setValue(product.description)
    similarProduct.get('productId').setValue(product.id)
  }

  setProductCode(event: any, similarProduct) {
    const product = this.apiService.allproductsWithIsPackage.find(item => item.description == event)
    similarProduct.get('productCode').setValue(product.productCode)
    similarProduct.get('productId').setValue(product.id)
  }


  onHoverImage(similarProduct: any) {
    if (similarProduct.get('productImage').value || similarProduct.get('productImage').value == 'null') {
      return
    }
    else {
      const product = this.apiService.allproductsWithIsPackage.find(item => item.description == similarProduct.get('productName').value)

    }
  }

  get productCompetitors() {
    return this.productForm.get('productCompetitors') as UntypedFormArray;
  }

  async fetchCompetitorPrices() {
    const productId = this.productForm?.get('id')?.value;
    if (!productId) {
      this.toastr.error('Product ID is required to fetch competitor prices');
      return;
    }
    this.isLoadingCompetitorPrices = true;
    try {
      const response: any = await this.apiService.fetchCompetitorPrices(productId);
      if (response && Array.isArray(response)) {
        response.forEach(competitor => {
          this.productCompetitors.push(this.formsService.createProductCompetitorForm());
        });
        this.productCompetitors.patchValue(response);
      }
    } catch (error: any) {
      console.error('Error fetching competitor prices:', error);
      this.toastr.error(error?.error?.userMessage || 'Failed to fetch competitor prices');
    } finally {
      this.isLoadingCompetitorPrices = false;
    }
  }


  addCompetitorForm() {
    const form = this.formsService.createProductCompetitorForm();
    form.get('sortOrder').setValue(this.productCompetitors.length + 1);
    this.productCompetitors.push(form);
  }
 
  removeCompetitorFromProduct(index: number) {
    if (index !== -1) {
      this.productCompetitors.removeAt(index);
    }
  }

}
