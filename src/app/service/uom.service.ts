import { Injectable, inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { BusinessAccountService } from '../project/postlogin/business-account/business-account.service';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class UomService {
  businessAccountService = inject(BusinessAccountService);
  private apiService = inject(ApiService);

  availableCostUoms: any = [];
  availableMatricCostUoms: any = [];
  availableSurfaceAreaUoms: any = [];
  availableVolumeUoms: any = [];
  availableWeightUoms: any = [];
  availableNormalWeightUoms: any = [];
  availableNetWeightUoms: any = [];
  availableDensityUoms: any = [];
  availableNormalVolumeUoms: any = [];
  availableWeightDefaultUom = new UntypedFormControl(null);

  availableAllMetricUOM: any[] = [];

  constructor() {
    this.fetchData();
  }
  async fetchData() {
    try {
      // Wait for the first set of API calls to complete
      await this.apiService.Get_All_AttributeTypes();
      await this.apiService.Get_All_Attributes();
      // Now, wait for the subsequent methods to complete
      await this.getAllUoms();
      await this.getAvailableMetricUoms();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  getAllUoms() {
    this.availableWeightDefaultUom.setValue(
      this.getAttributeTypeObjectById(
        this.getAttribute('Weight').attributeTypeId
      )?.defaultUom?.description
    );
    this.availableCostUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Cost').attributeTypeId
    )?.availableUOMs;
    this.availableMatricCostUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Metric Cost').attributeTypeId
    )?.availableUOMs;
    this.availableWeightUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Weight').attributeTypeId
    )?.availableMetricUOMs;
    this.availableNormalWeightUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Weight').attributeTypeId
    )?.availableUOMs;
    this.availableNetWeightUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Net Weight').attributeTypeId
    )?.availableUOMs;
    this.availableVolumeUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Volume').attributeTypeId
    )?.availableMetricUOMs;
    this.availableNormalVolumeUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Volume').attributeTypeId
    )?.availableUOMs;
    this.availableSurfaceAreaUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Surface Area').attributeTypeId
    )?.availableMetricUOMs;
    this.availableDensityUoms = this.getAttributeTypeObjectById(
      this.getAttribute('Density').attributeTypeId
    )?.availableUOMs;
  }

  getAvailableMetricUoms() {
    let availableMetricUOM: any[] = [];
    this.apiService.allAttributesTypes.forEach((element) => {
      element.availableMetricUOMs.forEach((amuItm) => {
        availableMetricUOM.push(amuItm);
      });
    });
    this.availableAllMetricUOM = JSON.parse(JSON.stringify(availableMetricUOM));
  }

  getAvailableMetricUomsByName(name: any) {
    return this.getAttributeTypeObjectByName(name)?.availableMetricUOMs;
  }

  getAvailableSimpleUomsByName(name: any) {
    return this.getAttributeTypeObjectByName(name)?.availableUOMs;
  }

  getAttributeObjectById(attributeId: any) {
    if (attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == attributeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }

  getAttributeTypeObjectById(attributeTypeId: any, item?: UntypedFormControl) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      if (item) {
        item.setValue(selectedAttribute?.defaultUom?.description);
      }
      return selectedAttribute;
    } else {
      return;
    }
  }

  getAttribute(description: string) {
    const data = this.getDataByAttr(
      this.apiService.allAttributes,
      'description',
      description
    );
    return data ? data : [];
  }

  getAttributeTypeObjectByName(name: any) {
    const data = this.getDataByAttr(
      this.apiService.allAttributesTypes,
      'description',
      name
    );

    return data ? data : [];
  }

  getDataByAttr(arr, attr, value) {
    var index = arr.findIndex(
      (x) => x[attr]?.toUpperCase() === value?.toUpperCase()
    );
    return arr[index];
  }

  getUoms(attributeTypeId: string) {
    const attributeType = this.apiService.allAttributesTypes.find(
      (item) => item.id == attributeTypeId
    );
    return attributeType?.availableUOMs ?? [];
  }
}
