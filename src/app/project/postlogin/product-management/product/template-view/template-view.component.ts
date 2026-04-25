import { UntypedFormGroup, FormsModule } from '@angular/forms';
import { Component, OnInit, inject, input } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';


@Component({
    selector: 'app-template-view',
    templateUrl: './template-view.component.html',
    styleUrls: ['./template-view.component.scss'],
    imports: [MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent, FormsModule]
})
export class TemplateViewComponent implements OnInit{
  apiService = inject(ApiService);

  readonly productForm = input<UntypedFormGroup>(undefined);
  readonly currentStepIndex = input<any>(undefined);
  readonly componentUoms = input<any>(undefined);


  data: any = {};

  ngOnInit(): void {
    let productTemplateId: any = this.productForm().get('productTemplateId').value
    this.getProductTemplateById(productTemplateId)
  }

  async getProductTemplateById(templateId: any) {
    try {
      let uomQuery = ``;
      this.componentUoms().controls.forEach((element) => {
        uomQuery =
          uomQuery +
          `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
          }`;
      });
      uomQuery = encodeURI(uomQuery);
      const res: any = await this.apiService
        .Get_Single_Product_Template(templateId, uomQuery)
        ?.toPromise();
      this.data = res
    } catch (err: any) {
      ;
    }
  }



  getDescriptionFromProductTypeId(id: any) {
    let selectedProductType = this.apiService.productTypes.find(
      (x) => x['id'] == id
    );
    return selectedProductType ? selectedProductType?.description : ''
  }


  getProductTypeDescriptionFromProductId(id: any) {
    const selectedProduct: any = this.apiService.allproductsListForProcess.find(
      (item) => id == item?.id
    );
    let selectedProductType = this.apiService.productTypes.find(
      (x) => x['id'] == selectedProduct?.productTypeId
    );
    return selectedProductType ? selectedProductType?.description : '';
  }


}
