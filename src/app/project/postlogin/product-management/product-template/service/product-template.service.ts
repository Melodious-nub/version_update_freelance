import { Injectable } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';
import {
  AVERAGE_DENSITY_UOM,
  COST_ADDON_PER_METRICTON_UOM,
  COST_PER_METRICTON_UOM,
  DENSITY_UOM,
} from 'src/app/model/common/attribute-system-UOMs';
import {
  AttributeGroupResponse,
  AttributeGroup,
} from 'src/app/model/product-template/attribute-group.model';
import {
  CalculatorMeta,
  CalculatorMetaResponse,
} from 'src/app/model/product-template/calculator-meta';
import {
  ConversionType,
  ConversionTypeResponse,
} from 'src/app/model/product-template/conversion-cost.model';
import {
  ProductType,
  ProductTypeResponse,
} from 'src/app/model/product-template/product-type';
import { HttpService } from 'src/app/service/http.service';
import { apiModules } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';

export function requireHundredPercent(): ValidatorFn {
  return function validate(formControl: UntypedFormControl) {
    if (formControl?.value !== 100) {
      return {
        requireHundredPercent: true,
      };
    }
    return null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductTemplateService {
  url = environment.apiUrl;
  metaData:any;

  constructor(private httpService: HttpService, public _fb: UntypedFormBuilder) { }

  saveProcess(formData): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.product_template}`,
      formData
    );
  }

  updateProcess(id, formData): Observable<any> {
    return this.httpService.put<any>(
      `${apiModules.product_template}${id}/`,
      formData
    );
  }

  getProductTemplateById(id): Observable<any> {
    return this.httpService.get<any>(`${apiModules.product_template}${id}/`);
  }

  deleteProductTemplateById(id): Observable<any> {
    return this.httpService
      .delete<any>(`${apiModules.product_template}${id}/`)
      .pipe(
        map(() => {
          return true;
        })
      );
  }

  public buildProcessItem(): UntypedFormGroup {
    return this._fb.group({
      processName: ['', Validators.required],
      productOfProcess: ['', Validators.required],
      totalCost: [0],
      totalUsed: [0, requireHundredPercent()],
      totalAvgDensity: [0],
      totalCostAddOn: [0],
      totalConversionCostAddOn: [0],
      calculatorMeta: [''],
      products: this._fb.array([]),
      conversionCost: this._fb.array([]),
      processConversion: [''],
      processCalculator: this._fb.group({
        processCalculatorAttributeValues: this._fb.array([]),
        processCalculatorProduct: this._fb.array([]),
        processCalculatorConversionType: this._fb.array([]),
        description: ['', Validators.required],
      }),
    });
  }

  public buildProductItem(): UntypedFormGroup {
    return this._fb.group({
      subProduct: ['', Validators.required],
      cost: [0],
      costUom: [COST_PER_METRICTON_UOM],
      used: [0],
      density: [0],
      densityUom: [DENSITY_UOM],
      avgDensity: [0],
      avgDensityUom: [AVERAGE_DENSITY_UOM],
      costAddOn: [0],
      costAddOnUom: [COST_ADDON_PER_METRICTON_UOM],
      waste: [0],
      processProducts: [''],
    });
  }

  public buildCostArray(): UntypedFormGroup {
    return this._fb.group({
      conversionType: [''],
      conversionCost: [0],
      conversionUom: [COST_PER_METRICTON_UOM],
    });
  }

  getCalculatorMetas(): Observable<any> {
    return this.httpService.get<any>(`${apiModules.calculator_meta}`);
  }

  addAttribute(data): Observable<any> {
    return this.httpService.post<any>(
      `${apiModules.addAttribute}`,
      data
    );
  }

}
