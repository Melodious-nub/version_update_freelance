import { Injectable } from '@angular/core';
import {
  AVERAGE_DENSITY_ID,
  CALCULATED_COST_ID,
  CONVERSION_COST_ID,
  COST_ADDON_ID,
  COST_ID,
  COST_PER_METRICTON_ID,
  DENSITY_ID,
  MATERIAL_COST_ID,
  PERCENT_USED_ID,
  PERCENT_WASTE_ID,
  WEIGHT_ID,
} from 'src/app/model/common/attribute-identifiers';
import { ProductAttributeValues } from 'src/app/model/product-template/product-attribute-value';

@Injectable({
  providedIn: 'root',
})
export class ProductTemplateFormService {
  payloadOriginal = {};
  payload = JSON.parse(JSON.stringify(this.payloadOriginal));
  constructor() {}

  constructFormPayload(formData, savedProcess, isEditSave = false) {
    const data = this.constructProductTemplate(formData);
    this.payload = data;
    if (savedProcess) {
      let updateProcess;
      if (!isEditSave) {
        updateProcess = [
          ...savedProcess.processes,
          this.payload.processes[this.payload.processes.length - 1],
        ];
      } else {
        if (savedProcess?.id) {
          updateProcess = [...data.processes];
        } else {
          updateProcess = [...savedProcess.processes];
        }
      }
      const updateProcessTemplate = {
        ...savedProcess,
        description: this.payload.description,
        productTemplateAttributes: this.payload.productTemplateAttributes,
        productType: this.payload.productType,
        processes: updateProcess,
      };
      return updateProcessTemplate;
    }
    return this.payload;
  }

  constructProductTemplate(formData) {
    const data = formData?.productTemplate;
    const productFormData = {
      description: data?.description,
      isPackageEntity: data?.isPackageEntity,
      productTemplateAttributes: data?.productTemplateAttributes,
      productType: data?.productType,
      attributeGroup: data?.attribute,
      processes: this.constructProcessData(formData),
    };
    if (data?.id) {
      productFormData['id'] = data?.id;
    }
    return productFormData;
  }

  constructProcessData(formData) {
    const data = formData?.processes;
    const processes = [];
    data?.forEach((process, index) => {
      let processItem = {
        description: process.processName,
        productOfProcess: this.constructProductOfProcess(process),
        processProducts: this.constructProcessProduct(process),
        processNumber: index + 1,
        processConversionTypes: this.constructProcessConversionTypes(process),
      };
      if (process?.id) {
        processItem['id'] = process?.id;
      }
      if (process?.processCalculator) {
        processItem['calculatorMeta'] = null;
        processItem['processCalculator'] = process.processCalculator;
      } else {
        processItem['calculatorMeta'] = process.calculatorMeta?.id;
        processItem['processCalculator'] = null;
      }
      processes.push(processItem);
    });
    return processes;
  }

  constructProductOfProcess(procData) {
    const product = {};
    if (procData?.productOfProcessId) {
      product['id'] = procData?.productOfProcessId;
    }
    product['description'] = procData?.productOfProcess;
    product['isProductOfProcess'] = true;
    product['isRawMaterial'] = true;
    product['productAttributeValues'] =
      this.constructProdAttributeValue(procData);
    return product;
  }

  constructProdAttributeValue(procData) {
    const prodAttributes = [];
    if (procData?.productOfProcessProductAttributeValues) {
      let isDensityAdded = false;
      let isMaterialCostAdded = false;
      let isConversionCostAdded = false;
      let isMetricTonneCostAdded = false;
      let isCalculatedCostAdded = false;
      let isCostAdded = false;
      procData?.productOfProcessProductAttributeValues.forEach((prodAttr) => {
        let value = {};
        if (prodAttr?.id) {
          value['id'] = prodAttr?.id;
        }
        value = {
          ...value,
          attribute: {
            id: prodAttr.attribute.id,
            description: prodAttr.attribute.description,
            systemUom: {
              id: prodAttr.attribute.systemUom.id,
              description: prodAttr.attribute.systemUom.description,
            },
          },
          attribute_value: prodAttr.attributeValue,
          user_conversion_uom: prodAttr.userConversionUom,
        };
        prodAttributes.push(value);
        switch (prodAttr.attribute.id) {
          case DENSITY_ID:
            isDensityAdded = true;
            break;

          case MATERIAL_COST_ID:
            isMaterialCostAdded = true;
            break;

          case CONVERSION_COST_ID:
            isConversionCostAdded = true;
            break;

          case COST_PER_METRICTON_ID:
            isMetricTonneCostAdded = true;
            break;

          case CALCULATED_COST_ID:
            isCalculatedCostAdded = true;
            break;

          case COST_ID:
            isCostAdded = true;
            break;

          default:
            break;
        }
      });
      const addProductAddtribute = (attributeId: number) => {
        const productAttributeValue = ProductAttributeValues?.find(
          (productAttributeValueItem) =>
            productAttributeValueItem?.attribute?.id === attributeId
        );
        if (productAttributeValue) {
          prodAttributes.push({
            attribute: {
              id: productAttributeValue.attribute.id,
              description: productAttributeValue.attribute.description,
              systemUom: {
                id: productAttributeValue.attribute.systemUom.id,
                description:
                  productAttributeValue.attribute.systemUom.description,
              },
            },
            attribute_value: productAttributeValue.attribute_value,
            user_conversion_uom: productAttributeValue.user_conversion_uom,
          });
        }
      };
      if (!isDensityAdded) {
        addProductAddtribute(DENSITY_ID);
      }
      if (!isMaterialCostAdded) {
        addProductAddtribute(MATERIAL_COST_ID);
      }
      if (!isConversionCostAdded) {
        addProductAddtribute(CONVERSION_COST_ID);
      }
      if (!isMetricTonneCostAdded) {
        addProductAddtribute(COST_PER_METRICTON_ID);
      }
      if (!isCalculatedCostAdded) {
        addProductAddtribute(CALCULATED_COST_ID);
      }
      if (!isCostAdded) {
        addProductAddtribute(COST_ID);
      }
    } else {
      ProductAttributeValues.forEach((prodAttr) => {
        prodAttributes.push({
          attribute: {
            id: prodAttr.attribute.id,
            description: prodAttr.attribute.description,
            systemUom: {
              id: prodAttr.attribute.systemUom.id,
              description: prodAttr.attribute.systemUom.description,
            },
          },
          attribute_value: prodAttr.attribute_value,
          user_conversion_uom: prodAttr.user_conversion_uom,
        });
      });
    }
    return prodAttributes;
  }

  constructProcessProduct(procData) {
    const procProduct = [];
    if (procData?.products) {
      procData?.products.forEach((prod) => {
        let procProductItem = {
          attributesGroup: prod.processProducts?.attributesGroup,
          processProductAttributeValues:
            this.constructProcessProductAttributeValues(prod),
          product: prod.processProducts?.product,
        };
        if (prod.processProducts?.id) {
          procProductItem['id'] = prod.processProducts?.id;
        }
        procProduct.push(procProductItem);
      });
    }
    return procProduct;
  }

  constructProcessProductAttributeValues(prod) {
    const productAttributes = [];
    prod?.processProducts?.processProductAttributeValues?.forEach(
      (procProduct) => {
        switch (procProduct?.attribute?.id) {
          case WEIGHT_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: '1',
              attributeValueExpression: null,
              userConversionUom: prod?.costUom
                ? prod?.costUom.split('/')[1]
                : '',
            });
            break;
          case COST_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.cost?.toString(),
              attributeValueExpression: null,
              userConversionUom: prod?.costUom
                ? prod?.costUom.split('/')[0]
                : '',
            });
            break;
          case PERCENT_USED_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.used?.toString(),
              attributeValueExpression: null,
              userConversionUom: 'count',
            });
            break;
          case DENSITY_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.density?.toString(),
              attributeValueExpression: null,
              userConversionUom: prod?.densityUom ? prod?.densityUom : '',
            });
            break;
          case AVERAGE_DENSITY_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.avgDensity?.toString(),
              attributeValueExpression: null,
              userConversionUom: prod?.avgDensityUom ? prod?.avgDensityUom : '',
            });
            break;
          case COST_ADDON_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.costAddOn?.toString(),
              attributeValueExpression: null,
              userConversionUom: 'USD',
            });
            break;
          case PERCENT_WASTE_ID:
            productAttributes.push({
              ...procProduct,
              attributeValue: prod?.waste?.toString(),
              attributeValueExpression: null,
              userConversionUom: 'count',
            });
            break;
        }
      }
    );
    return productAttributes;
  }

  constructProcessConversionTypes(process) {
    const conversionCost = [];
    if (process?.conversionCost) {
      process?.conversionCost.forEach((cost) => {
        let value = {
          attributesGroup: process?.processConversion?.attributesGroup,
          processConversionAttributeValues:
            this.constructProcessConversionAttributeValues(
              cost,
              process?.processConversion
            ),
          conversionType: cost.conversionType,
        };
        if (cost?.id) {
          value['id'] = cost?.id;
        }
        conversionCost.push(value);
      });
    }
    return conversionCost;
  }

  constructProcessConversionAttributeValues(cost, conversion) {
    const conversionArr = [];
    if (cost?.id) {
      cost?.processConversionAttributeValues?.forEach((attr) => {
        switch (attr?.attribute?.id) {
          case WEIGHT_ID:
            conversionArr.push({
              ...attr,
              attributeValue: '1',
              attributeValueExpression: null,
              userConversionUom: cost?.conversionUom
                ? cost?.conversionUom.split('/')[1]
                : '',
            });
            break;
          case COST_ID:
            conversionArr.push({
              ...attr,
              attributeValue: cost?.conversionCost,
              attributeValueExpression: null,
              userConversionUom: cost?.conversionUom
                ? cost?.conversionUom.split('/')[0]
                : '',
            });
            break;
        }
      });
    } else {
      conversion?.processProductAttributeValues?.forEach((attr) => {
        switch (attr?.attribute?.id) {
          case WEIGHT_ID:
            conversionArr.push({
              ...attr,
              attributeValue: '1',
              attributeValueExpression: null,
              userConversionUom: cost?.conversionUom
                ? cost?.conversionUom.split('/')[1]
                : '',
            });
            break;
          case COST_ID:
            conversionArr.push({
              ...attr,
              attributeValue: cost?.conversionCost,
              attributeValueExpression: null,
              userConversionUom: cost?.conversionUom
                ? cost?.conversionUom.split('/')[0]
                : '',
            });
            break;
        }
      });
    }
    return conversionArr;
  }
}
