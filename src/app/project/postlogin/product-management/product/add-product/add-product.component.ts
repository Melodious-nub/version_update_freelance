import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../container-management/service/container-management.service';
import { SortFormArrayPipe } from 'src/app/shared/pipes/sort-formarray-sortorder.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AttributeValueModalComponent } from '../../product-template/product-template-list-form/product-templates-steps/components/attribute-value-modal/attribute-value-modal.component';
import { ProductService } from '../service/product.service';
import { CalculateErrorModalComponent } from '../../common-modals/calculate-error-modal/calculate-error-modal.component';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { CreateDropdownFieldModalComponent } from '../../product-template/product-template-list-form/product-templates-steps/components/create-dropdown-field-modal/create-dropdown-field-modal.component';
import { DadyinSliderComponent } from 'src/app/shared/widgets/dadyin-slider/dadyin-slider.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { take } from 'rxjs';
import { InventoryLedgerModalComponent } from '../../common-modals/inventory-ledger-modal/inventory-ledger-modal.component';
import { NumberFormatterPipe } from '../../../../../shared/pipes/number-formatter.pipe';
import { SortFormArrayPipe as SortFormArrayPipe_1 } from '../../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinSearchableSelectComponent } from '../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { DadyinInputComponent } from '../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';

@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrls: ['./add-product.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        DadyinButtonComponent,
        NgClass,
        ExtendedModule,
        DadyinInputComponent,
        DadyinSearchableSelectComponent,
        MatTooltip,
        CdkDropList,
        MatIcon,
        CdkDrag,
        NgStyle,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        SortFormArrayPipe_1,
        NumberFormatterPipe
    ]
})
export class AddProductComponent implements OnInit, OnDestroy {
  allProductsPackagingMaterial: any = [];
  imgUrl = environment.imgUrl;
  imageDragging = false;

  @Input() productForm: UntypedFormGroup;

  @Input() componentUoms: UntypedFormArray;

  @Input() loadingProductTemplateDetail: any;

  @Input() currentBusinessAccount: any;

  @Input() disableForThirdPartyProduct: any;

  @Input() isThirdPartyProductMeta: any;

  @Output() saveProduct: EventEmitter<any> = new EventEmitter();


  createdBy: any;
  pAttribute = new UntypedFormControl(null);
  colSpace = new UntypedFormControl(25);

  productInfoLabel = new UntypedFormControl('');

  labelTypeAttributeIds: any = [];

  //product summary related form controls

  weightUom = new UntypedFormControl();
  volumeUom = new UntypedFormControl();
  surfaceAreaUom = new UntypedFormControl();
  costUom = new UntypedFormControl();
  skuUom = new UntypedFormControl();
  additionalCostType = new UntypedFormControl('');

  totalCostType = new UntypedFormControl('UNIT');

  expiryMonths: number[] = Array.from({ length: 99 }, (_, i) => i + 1);
  expiryMonthsString: { id: string; description: string }[] = this.expiryMonths.map(month => ({
    id: month + 'M',
    description: month + ' Month' + (month > 1 ? 's' : '')
  }));


  private expirySubscriptions: any[] = [];

  @Output() calculate = new EventEmitter();
  @Output() loadedDetail = new EventEmitter();

  userDetail: any = [];


  constructor(
    public fb: UntypedFormBuilder,
    public apiService: ApiService,
    public formsService: FormsService,
    public uomService: UomService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public sortFormArray: SortFormArrayPipe,
    public dialog: MatDialog,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public productService: ProductService
  ) { }

  async ngOnInit() {
    this.createdBy = this.route.snapshot.params.createdBy;
    // this.Get_All_Product_List_IsPackage(null);
    this.apiService.syncTemplate.valueChanges.subscribe((res) => {
      if (res) {
        this.syncProductTemplate();
      }
    });


    if (
      this.productForm.get('productTypeId').value &&
      this.productForm.get('productTypeId').value != 'null' &&
      !this.loadingProductTemplateDetail
    ) {
      this.productService.productSubTypes = [];
      let selectedProductType: any =
        await this.apiService.Get_Product_Type_ById(
          this.productForm.get('productTypeId').value
        );
      this.productService.productSubTypes =
        selectedProductType?.productSubTypes;
      this.productService.additionalCostValues =
        selectedProductType?.additionalCosts;
      this.apiService.productTypeForCalculation.setValue(selectedProductType);
      this.loadedDetail.emit();
      if (
        this.productForm.get('productSubTypeId').value &&
        this.productForm.get('productSubTypeId').value != 'null'
      ) {
        let selectedProductSubType: any =
          await this.apiService.Get_Product_Sub_Type_ById(
            this.productForm.get('productSubTypeId').value
          );
        this.productForm.get('productSubTypeId').updateValueAndValidity();

        this.productService.additionalCostValues =
          selectedProductSubType?.additionalCosts;
        this.hsnUsaCode.setValue(selectedProductSubType?.hsnUsaCode);
        this.hsnIndiaCode.setValue(selectedProductSubType?.hsnIndiaCode);
        this.exportDescription.setValue(
          selectedProductSubType?.exportDescription
        );
        let productTemplateId = selectedProductSubType?.productTemplateId;
        if (productTemplateId) {
          this.productForm.get('productTemplateId').setValue(productTemplateId);
          let uomQuery = ``;
          this.componentUoms.controls.forEach((element) => {
            uomQuery =
              uomQuery +
              `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
              }`;
          });
          uomQuery = encodeURI(uomQuery);
          const res: any = await this.apiService
            .Get_Single_Product_Template(productTemplateId, uomQuery)
            ?.toPromise();

          this.apiService.productTemplateForCalculation.setValue(res);
          this.productForm.get('templateCost').patchValue(res?.templateCost);
          this.productForm
            .get('templateDensity')
            .patchValue(res?.templateDensity);
        }
      } else {
        let productTemplateId = selectedProductType?.productTemplateId;
        if (productTemplateId) {
          this.productForm.get('productTemplateId').setValue(productTemplateId);
          let uomQuery = ``;
          this.componentUoms.controls.forEach((element) => {
            uomQuery =
              uomQuery +
              `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
              }`;
          });
          uomQuery = encodeURI(uomQuery);
          const res: any = await this.apiService
            .Get_Single_Product_Template(productTemplateId, uomQuery)
            ?.toPromise();
          this.apiService.productTemplateForCalculation.setValue(res);
          this.productForm.get('templateCost').patchValue(res?.templateCost);
          this.productForm
            .get('templateDensity')
            .patchValue(res?.templateDensity);
        }
        this.productService.additionalCostValues =
          selectedProductType?.additionalCosts;
        this.hsnUsaCode.setValue(selectedProductType?.hsnUsaCode);
        this.hsnIndiaCode.setValue(selectedProductType?.hsnIndiaCode);
        this.exportDescription.setValue(selectedProductType?.exportDescription);
      }
    }

    this.manageLabelAttributeIds(this.productAttributeValues.value);

    this.businessAccountService.Get_All_CustomersList();
    this.businessAccountService.Get_All_Vendors();

    if (this.productForm.get('isSku').value) {
      this.apiService.skuTypes.push({
        id: this.productForm.get('unitName').value.toUpperCase(),
        description: this.productForm.get('unitName').value.toUpperCase(),
      });
    }

    this.businessAccountService.$currentBusinessAccount.subscribe((res: any) => {
      this.userDetail = res;
    });



  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  async onProductTypeChange() {
    let id: any = this.productForm.get('productTypeId').value;
    if (!id || id == 'null') {
      this.toastr.error('Product type Id not Found');
      return;
    }
    let selectedProductType: any = await this.apiService.Get_Product_Type_ById(
      id
    );
    this.productService.productSubTypes = [];
    this.productService.productSubTypes = selectedProductType.productSubTypes;
    this.exportDescription.setValue(selectedProductType?.exportDescription);
    this.hsnUsaCode.setValue(selectedProductType?.hsnUsaCode);
    this.hsnIndiaCode.setValue(selectedProductType?.hsnIndiaCode);
    this.additionalCosts.clear();
    this.productService.additionalCostValues =
      selectedProductType?.additionalCosts;
    if (this.productService.additionalCostValues?.length > 0) {
      this.productService.additionalCostValues.forEach((element) => {
        if (element?.additionalCostValues?.length > 0) {
          let form: UntypedFormGroup = this.formsService.createAdditionalCostForm();
          form.patchValue(element.additionalCostValues[0]);
          form.get('costName').setValue(element.description);
          form.get('id').setValue(null);
          this.additionalCosts.push(form);
        }
      });
    }
    let productTemplateId = selectedProductType?.productTemplateId;
    if (productTemplateId) {
      this.productForm.get('productTemplateId').setValue(productTemplateId);
      this.getProductTemplateById(productTemplateId);
      return;
    } else {
      this.toastr.error('No product Template associated');
      return;
    }
  }

  async onProductSubTypeChange() {
    let id: any = this.productForm.get('productSubTypeId').value;
    if (!id || id == 'null') {
      this.productForm.get('productSubTypeId').setValue(null);
      this.onProductTypeChange();
      return;
    }

    let selectedProductSubType: any =
      await this.apiService.Get_Product_Sub_Type_ById(id);
    this.exportDescription.setValue(selectedProductSubType?.exportDescription);
    this.hsnUsaCode.setValue(selectedProductSubType?.hsnUsaCode);
    this.hsnIndiaCode.setValue(selectedProductSubType?.hsnIndiaCode);
    this.additionalCosts.clear();
    this.productService.additionalCostValues =
      selectedProductSubType?.additionalCosts;
    if (this.productService.additionalCostValues?.length > 0) {
      this.productService.additionalCostValues.forEach((element) => {
        if (element?.additionalCostValues?.length > 0) {
          let form: UntypedFormGroup = this.formsService.createAdditionalCostForm();
          form.patchValue(element.additionalCostValues[0]);
          form.get('costName').setValue(element.description);
          form.get('id').setValue(null);
          this.additionalCosts.push(form);
        }
      });
    }
    let productTemplateId = selectedProductSubType?.productTemplateId;
    if (productTemplateId) {
      this.productForm.get('productTemplateId').setValue(productTemplateId);
      this.getProductTemplateById(productTemplateId);
      return;
    } else {
      this.toastr.error('No product Template associated');
      return;
    }
  }

  syncProductTemplate() {
    if (this.disableForThirdPartyProduct) {
      return;
    }
    let productTemplateId: any =
      this.productForm.get('productTemplateId').value;
    this.getProductTemplateById(productTemplateId);
  }


  async adjustInventory() {
    if (this.productForm.getRawValue().status == 'DRAFT') {
      this.productForm.get('adjustedBy').setValue(this.userDetail.name);
      this.saveProduct.emit(true);
    }
    else {
      this.saveProduct.emit(false);
    }

  }

  viewLedger(manualAdjustmentOnly) {
    let data: any = this.productForm.getRawValue();
    this.dialog.open(InventoryLedgerModalComponent, {
      data: { productData: data, manualAdjustmentOnly: manualAdjustmentOnly }
    });

  }

  async getProductTemplateById(templateId: any) {
    try {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        uomQuery =
          uomQuery +
          `&uomMap[${element.get('attributeName').value}]=${element.get('userConversionUom').value
          }`;
      });
      uomQuery = encodeURI(uomQuery);
      const res: any = await this.apiService
        .Get_Single_Product_Template(templateId, uomQuery)
        ?.toPromise();
      this.apiService.productTemplateForCalculation.setValue(res);
      this.setProductTemplateData(res);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  setProductTemplateData(res: any) {
    this.setDefaultUoms();
    this.apiService.productTemplateForCalculation.setValue(res);

    this.productForm.get('templateCost').patchValue(res?.templateCost);
    this.productForm.get('templateDensity').patchValue(res?.templateDensity);

    const productTemplateAttributes: any =
      res?.productTemplateCalculator?.productCalculatorTemplateAttributeValues;
    const packageCalculatorTemplates: any =
      res?.productTemplateCalculator?.packageCalculatorTemplates;

    this.setProductTemplateProductAttributes(productTemplateAttributes);
    this.setProductTemplatePackageAttributes(packageCalculatorTemplates);

    if (res?.audit?.businessAccountId == this.currentBusinessAccount?.id) {
      if (productTemplateAttributes?.length > 0) {
        this.isProductAttributes.setValue(true);
      }
      if (packageCalculatorTemplates?.length > 0) {
        this.isPackageAttributes.setValue(true);
      }
    }
    setTimeout(() => {
      this.getCalculatedValues();
    }, 1000);
  }

  manageLabelAttributeIds(productTemplateAttributes: any) {
    this.labelTypeAttributeIds = [];
    productTemplateAttributes.forEach((element) => {
      if (
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(element.attributeId)?.attributeTypeId
        )?.description == 'Label'
      ) {
        if (element?.attributeValueExpression) {
          let prop = JSON.parse(
            element?.attributeValueExpression?.replace(/'/g, '"')
          );
          prop.forEach((element) => {
            this.labelTypeAttributeIds.push(Number(element?.attributeId));
          });
        }
      }
    });
  }

  setProductTemplateProductAttributes(productTemplateAttributes: any) {
    this.productAttributeValues.controls =
      this.productAttributeValues.controls.filter(
        (item) =>
          item.get('attributeValue').value ||
          Number(item.get('attributeValue').value) != 0
      );
    productTemplateAttributes.forEach((element) => {
      const existingAttributeControlIndex: any =
        this.productAttributeValues.controls.findIndex(
          (it) => it.get('attributeId').value == element.attributeId
        );
      if (existingAttributeControlIndex != -1) {
        this.productAttributeValues.controls[existingAttributeControlIndex]
          .get('attributeValueExpression')
          .setValue(element?.attributeValueExpression);
      } else {
        const form = this.formsService.createAttributeForm();
        form.patchValue(element);
        if (
          this.getAttributeObjectById(element.attributeId)?.description ==
          'Density'
        ) {
          const density = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
          );
          form
            .get('userConversionUom')
            .setValue(density.get('userConversionUom').value);
        }
        if (
          this.getAttributeObjectById(element.attributeId)?.description ==
          'Net Cost'
        ) {
          const cost = this.componentUoms.controls.find(
            (item) => item.value.attributeName?.toUpperCase() == 'COST'
          );
          form
            .get('userConversionUom')
            .setValue(cost.get('userConversionUom').value);
        }
        this.productAttributeValues.push(form);
      }
    });
    const keys3 = this.productAttributeValues.value.map(
      (item) => item.attributeId
    );
    this.manageLabelAttributeIds(this.productAttributeValues.value);
  }

  setProductTemplatePackageAttributes(packageCalculatorTemplates: any) {
    packageCalculatorTemplates?.forEach((packageTemplate, index) => {
      const existingPackageControl = this.packages.controls.find(
        (it) => it.get('packageType').value == packageTemplate.packageType
      );

      if (existingPackageControl) {
        let packageAttributeValues = existingPackageControl.get(
          'packageAttributeValues'
        ) as UntypedFormArray;
        packageTemplate?.packageCalculatorTemplateAttributeValues?.forEach(
          (el, n) => {
            const existingAttributeControl: any =
              packageAttributeValues.controls.find(
                (it) => it.get('attributeId').value == el.attributeId
              );
            if (existingAttributeControl) {
              existingAttributeControl
                .get('attributeValueExpression')
                .setValue(el?.attributeValueExpression);
            } else {
              const packageAttributeForm =
                this.formsService.createAttributeForm();
              packageAttributeForm.patchValue(el);
              if (
                this.getAttributeObjectById(el.attributeId)?.description ==
                'Density'
              ) {
                const density = this.componentUoms.controls.find(
                  (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
                );
                packageAttributeForm
                  .get('userConversionUom')
                  .setValue(density.get('userConversionUom').value);
              }
              if (
                this.getAttributeObjectById(el.attributeId)?.description ==
                'Net Cost'
              ) {
                const cost = this.componentUoms.controls.find(
                  (item) => item.value.attributeName?.toUpperCase() == 'COST'
                );
                packageAttributeForm
                  .get('userConversionUom')
                  .setValue(cost.get('userConversionUom').value);
              }
              packageAttributeValues.push(packageAttributeForm);
            }
          }
        );
      } else {
        let form = this.formsService.createPackageForm();
        let packageAttributeValues = form.get(
          'packageAttributeValues'
        ) as UntypedFormArray;
        packageTemplate?.packageCalculatorTemplateAttributeValues?.forEach(
          (el, n) => {
            const packageAttributeForm =
              this.formsService.createAttributeForm();
            packageAttributeForm.patchValue(el);
            if (
              this.getAttributeObjectById(el.attributeId)?.description ==
              'Density'
            ) {
              const density = this.componentUoms.controls.find(
                (item) => item.value.attributeName?.toUpperCase() == 'DENSITY'
              );
              packageAttributeForm
                .get('userConversionUom')
                .setValue(density.get('userConversionUom').value);
            }
            if (
              this.getAttributeObjectById(el.attributeId)?.description ==
              'Net Cost'
            ) {
              const cost = this.componentUoms.controls.find(
                (item) => item.value.attributeName?.toUpperCase() == 'COST'
              );
              packageAttributeForm
                .get('userConversionUom')
                .setValue(cost.get('userConversionUom').value);
            }
            packageAttributeValues.push(packageAttributeForm);
          }
        );
        form.get('packageType').patchValue(packageTemplate?.packageType);
        form.get('isSku').patchValue(packageTemplate?.isSku);
        if (
          packageTemplate.packageType == this.productForm.get('skuName').value
        ) {
          form.get('isSku').patchValue(true);
        }
        if (form.get('isSku') == null) {
          form.get('isSku').setValue(false);
        }
        this.packages.push(form);
      }
    });
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

  getAttributeTypeObjectById(attributeTypeId: any) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }

  removeProductCalculatorAttribute(i) {
    if (this.disableForThirdPartyProduct) {
      return;
    }
    this.productAttributeValues.removeAt(i);
    this.changeValue();
  }

  get isVendorProduct() {
    return this.productForm.get('isVendorProduct');
  }


  get parentProductMetaId() {
    return this.productForm.get('productMeta').get('parentProductMetaId');
  }

  get packages() {
    return this.productForm.get('packages') as UntypedFormArray;
  }

  get preferredCustomerId() {
    return this.productForm.get('preferredCustomerId');
  }

  removeProductInformationValues(i) {
    this.productInformationValues.removeAt(i);
  }

  addProductCompetitor() {
    const form = this.formsService.createProductCompetitorForm();
    form.get('sortOrder').setValue(this.productCompetitors.length + 1);
    this.productCompetitors.push(form);
  }

  removeProductCompetitor(i) {
    this.productCompetitors.removeAt(i);
  }

  addProductInformationValue() {
    if(!this.productInfoLabel.value) {
      this.toastr.error('Please enter a product information label to add');
      return;
    }
    const form = this.formsService.createProductInformationForm();
    this.productInformationValues.push(form
    );
    this.productInformationValues.controls[
      this.productInformationValues.controls.length - 1
    ]
      .get('description')
      .patchValue(this.productInfoLabel.value);
    this.productInfoLabel.reset();
  }

  removeAdditionalCost(i) {
    this.additionalCosts.removeAt(i);
    this.changeValue();
  }

  addAdditionalCost() {
    let item = this.productService.additionalCostValues.find((item) => {
      return item.id == this.additionalCostType.value;
    });
    let currentArray = this.additionalCosts.value;
    let item2 = currentArray.find((item2) => {
      return item2.costName == item?.description;
    });
    if (item2) {
      this.toastr.error('Already Exist');
      return;
    }
    let form: UntypedFormGroup = this.formsService.createAdditionalCostForm();
    form.get('costName').setValue(item?.description);
    this.additionalCosts.push(form);
  }

  removeProductExpense(i) {
    this.productExpenseValues.removeAt(i);
    this.changeValue();
  }

  addProductExpense() {
    let form = this.formsService.createProductExpenseForm();

    form
      .get('weight')
      .get('userConversionUom')
      .setValue(this.uomService.availableWeightDefaultUom.value);

    const metricCost = this.componentUoms.controls.find(
      (item) => item.value.attributeName?.toUpperCase() == 'COST'
    );

    if (metricCost) {
      form
        .get('cost')
        .get('userConversionUom')
        .setValue(metricCost.get('userConversionUom').value);
    }

    this.productExpenseValues.push(form);
  }

  removeProductExpenseConversionType(i) {
    this.productExpenseConversionTypes.removeAt(i);
    this.changeValue();
  }

  addProductExpenseConversionType() {
    this.productExpenseConversionTypes.push(
      this.formsService.createProductExpenseConversionTypeForm()
    );
  }

  getArray(str: any) {
    if (!str) {
      return [];
    }
    let prop = JSON.parse(str.replace(/'/g, '"'));
    if (!prop) {
      return [];
    }
    return prop;
  }

  getArrayIds(str: String) {
    let prop = JSON.parse(str.replace(/'/g, '"'));
    let propids: any = [];
    prop.forEach((element) => {
      propids.push(Number(element.attributeId));
    });
    return propids;
  }

  imageselected(event: any) {
    this.uploadFile(event.target.files);
  }

  async uploadFile(imgfile) {
    try {
      const res: any = await this.apiService.uploadFiles(imgfile);
      res.data.forEach((element) => {
        let obj: any = {};
        obj = {
          id: '',
          sortOrder: this.images.controls?.length + 1,
          fileName: element.media_url,
          isHide: false,
        };
        this.images.push(this.formsService.createImageForm());
        this.images.controls[this.images?.controls?.length - 1].patchValue(obj);
      });
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  removeImage(j) {
    if (this.disableForThirdPartyProduct || this.isThirdPartyProductMeta) {
      this.toastr.warning('Not Editable for Third Party Product');
      return;
    }
    this.images.removeAt(j);
  }

  onChangeFeatureImage(img, event) {
    if (event.target.checked) {
      let i = 2;
      this.images.controls.forEach((control) => {
        control.get('sortOrder').setValue(i);
        i++;
      });
      img.get('sortOrder').setValue(1);
      this.getCalculatedValues();
    }
  }

  hideImage(isHide, index) {
    if (this.disableForThirdPartyProduct || this.isThirdPartyProductMeta) {
      this.toastr.warning('Not Editable for Third Party Product');
      return;
    }
    this.images.controls[index].get('isHide').setValue(isHide);
  }

  getAdditionalCostLabel(i) {
    return this.productService.additionalCostValues[i].description;
  }

  getSummaryUnit(type1, type2, type3) {
    const totalCostFg = this.productForm.get('productSummary').get(type1);
    return totalCostFg.get(type2).get(type3).get('attributeValue').value;
  }

  getFilteredProductsList(expense) {
    if (this.allProductsPackagingMaterial?.length > 0) {
      if (Number(expense.get('productTypeId').value)) {
        let productList: any = this.allProductsPackagingMaterial.filter(
          (item) => {
            return (
              item.productTypeId == Number(expense.get('productTypeId').value)
            );
          }
        );
        return productList;
      } else {
        return this.allProductsPackagingMaterial;
      }
    } else {
      return [];
    }
  }
  onProductCodeExpenseChange(product, expense: UntypedFormGroup) {
    expense.get('expenseProductId').setValue(product?.id);
    expense.get('productTypeId').setValue(product.productTypeId);
    expense.get('expenseDescription').setValue(product.description);
    expense.get('expenseProductCode').setValue(product.productCode);
    expense
      .get('weight')
      .get('attributeValue')
      .setValue(product.weight.attributeValue);
    expense
      .get('weight')
      .get('userConversionUom')
      .setValue(product.weight.userConversionUom);
    //
    expense
      .get('cost')
      .get('attributeValue')
      .setValue(product.cost.attributeValue);
    expense
      .get('cost')
      .get('userConversionUom')
      .setValue(product.cost.userConversionUom);
    expense
      .get('adjustedCost')
      .get('attributeValue')
      .setValue(product.cost.attributeValue);
    expense
      .get('adjustedCost')
      .get('userConversionUom')
      .setValue(product.cost.userConversionUom);
    this.getCalculatedValues();
  }

  onProductTypeExpenseChange(expense: UntypedFormGroup) {
    let products = this.getFilteredProductsList(expense);

    if (products?.length > 0) {
      expense.get('productTypeId').setValue(products[0].productTypeId);
      expense.get('expenseDescription').setValue(products[0].description);
      expense.get('expenseProductId').setValue(products[0].id);
      expense
        .get('weight')
        .get('attributeValue')
        .setValue(products[0].weight.attributeValue);
      expense
        .get('weight')
        .get('userConversionUom')
        .setValue(products[0].weight.userConversionUom);
      expense
        .get('cost')
        .get('attributeValue')
        .setValue(products[0].cost.attributeValue);
      expense
        .get('cost')
        .get('userConversionUom')
        .setValue(products[0].cost.userConversionUom);
      expense
        .get('adjustedCost')
        .get('attributeValue')
        .setValue(products[0].cost.attributeValue);
      expense
        .get('adjustedCost')
        .get('userConversionUom')
        .setValue(products[0].cost.userConversionUom);
      this.getCalculatedValues();
    } else {
      expense.get('expenseDescription').reset();
      expense.get('cost').reset();
      expense.get('adjustedCost').reset();
      expense.get('weight').reset();
      expense.get('expenseProductId').setValue(null);
      this.getCalculatedValues();
    }
  }

  private getAllProductListIsPackageTimeout: any;

  Get_All_Product_List_IsPackage(event: any) {
    // Clear any previous scheduled call
    if (this.getAllProductListIsPackageTimeout) {
      clearTimeout(this.getAllProductListIsPackageTimeout);
    }

    this.getAllProductListIsPackageTimeout = setTimeout(() => {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      let searchQuery = event?.target?.value ?? '';
      this.apiService
        .Get_All_Product_List_IsPackage(uomQuery, searchQuery)
        .subscribe((res) => {
          this.allProductsPackagingMaterial = res;
        });
    }, 1000); // Debounce by 1 second
  }

  toggleProductMaterialCost(event, control: UntypedFormControl) {
    if (event.target.checked) {
      control.clearValidators();
      control.updateValueAndValidity();
    } else {
      control.setValidators(Validators.required);
      control.updateValueAndValidity();
    }
  }

  clearExtraExpense(value) {
    if (value) {
      let form: UntypedFormGroup = this.formsService.createProductExpenseForm();
      form
        .get('weight')
        .get('userConversionUom')
        .setValue(this.uomService.availableWeightDefaultUom.value);

      const metricCost = this.componentUoms.controls.find(
        (item) => item.value.attributeName?.toUpperCase() == 'COST'
      );

      if (metricCost) {
        form
          .get('cost')
          .get('userConversionUom')
          .setValue(metricCost.get('userConversionUom').value);
      }

      this.productExpenseValues.push(form);
      this.productForm.get('isExtraExpense').setValue(true);
    } else {
      this.productExpenseValues.clear();
      this.productExpenseConversionTypes.clear();
      this.productForm.get('isExtraExpense').setValue(false);
    }
  }



  changeValue(item?: UntypedFormGroup) {
    if (item) {
      item.get('isUserInput').setValue(true);
    }
    this.getCalculatedValues();
  }

  async getCalculatedValues() {
    this.calculate.emit(null);
    this.apiService.syncTemplate.setValue(false);
  }

  toggleVisibility(item: any, param: any) {
    if (this.disableForThirdPartyProduct) {
      return;
    }
    item.get('isHidden').setValue(param);
  }

  toggleLock(item: any, param: any) {
    if (this.disableForThirdPartyProduct) {
      return;
    }
    item.get('isUserInput').setValue(param);
    this.getCalculatedValues();
  }

  getAdditionalCostTypes(desc: any) {
    let item = this.productService.additionalCostValues.find((item) => {
      return item.description == desc;
    });
    return item?.additionalCostValues;
  }

  changeAdditionalCostTypeValue(event: any, additionalCost: UntypedFormGroup) {
    let maincost = this.productService.additionalCostValues.find((item) => {
      return item.description == additionalCost.get('costName').value;
    });
    let subcost = maincost?.additionalCostValues.find((ele) => {
      return ele.description == event.target.value;
    });
    additionalCost.get('attributeValue').setValue(subcost?.attributeValue);
    additionalCost
      .get('userConversionUom')
      .setValue(subcost?.userConversionUom);
    additionalCost
      .get('additionalCostValueType')
      .setValue(subcost?.additionalCostValueType);
    this.changeValue();
  }

  addExistingAttribute() {
    const data = this.pAttribute.value;
    if (!this.pAttribute.value) {
      return;
    }
    let allIds: any[] = [];
    for (
      let index = 0;
      index < this.productAttributeValues.value.length;
      index++
    ) {
      const id1 = this.productAttributeValues.value[index].attributeId;
      allIds.push(id1);
    }
    if (allIds.includes(data.id)) {
      this.toastr.error('Already Exist');
      return;
    }
    let form: UntypedFormGroup = this.formsService.createAttributeForm();
    form.get('sortOrder').setValue(this.productAttributeValues.length + 1);
    if (this.colSpace.value) {
      form.get('colSpace').setValue(Number(this.colSpace.value));
    }
    form.get('attributeId').setValue(data.id);
    form
      .get('attributeValueExpression')
      .setValue(data.attributeValueExpression);
    form
      .get('userConversionUom')
      .setValue(
        this.getAttributeTypeObjectById(data?.attributeTypeId)?.defaultUom
          ?.description
      );

    let productTemplateAttributes: any = null;
    if (this.apiService.productTemplateForCalculation.value) {
      productTemplateAttributes =
        this.apiService.productTemplateForCalculation.value
          ?.productTemplateCalculator?.productCalculatorTemplateAttributeValues;
    }
    if (productTemplateAttributes) {
      const ele: any = this.apiService.allAttributes.find(
        (item) => item.id == data.id
      );
      if (ele) {
        form.get('attributeValue').setValue(ele?.attributeValue);
        form
          .get('attributeValueExpression')
          .setValue(ele?.attributeValueExpression);
      }
    }
    this.productAttributeValues.push(form);
  }

  openAttributeDialog(i) {
    let dialogRef = this.dialog.open(AttributeValueModalComponent, {
      data: {
        elementdata: this.productAttributeValues.controls,
        allAttributes: this.apiService.allAttributes,
        labelTypeAttributeIds: this.labelTypeAttributeIds,
      },
    });
    this.setLabelInsideArrangement(i);
    dialogRef.afterClosed().subscribe((result) => {
      let k = 1;
      this.productAttributeValues.controls.forEach((element, i) => {
        if (
          !this.labelTypeAttributeIds.includes(element.get('attributeId').value)
        ) {
          element.get('sortOrder').setValue(k);
          k++;
        }
      });
      this.setLabelInsideArrangement(i);
    });
  }

  setLabelInsideArrangement(i) {
    let index = this.productAttributeValues.value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.productAttributeValues.controls.forEach((element, i) => {
      if (
        this.labelTypeAttributeIds.includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.productAttributeValues.controls[index].get('sortOrder').value +
            (i + 1) / 10
          );
      }
    });
  }

  changeBuyingCapacityType(event: any) {
    let data = this.productForm
      .get('productSummary')
      .get('sellingPrice')
      .get(event.target.value)
      .get('skuCost')
      .get('attributeValue').value;
    this.productForm.get('buyingCapacityCost').setValue(data);
  }

  async toggleAttribute(item: UntypedFormGroup, index) {
    let it = item?.get('attributeValueExpression');
    let expressionArray = await this.getArray(
      item.get('attributeValueExpression').value
    );
    expressionArray[index].selected = true;
    if (index == 1) {
      expressionArray[0].selected = false;
    }
    if (index == 0) {
      expressionArray[1].selected = false;
    }
    let expression = JSON.stringify(expressionArray);

    it.setValue(expression);
    this.changeValue();
  }

  markSku(event) {
    if (event.target.checked) {
      this.apiService.skuTypes.push({
        id: this.productForm.get('unitName').value.toUpperCase(),
        description: this.productForm.get('unitName').value.toUpperCase(),
      });
      this.productForm
        .get('skuName')
        .setValue(this.productForm.get('unitName').value.toUpperCase());
    }
  }

  filterAttributeForLabel(attributes: UntypedFormArray) {
    return attributes.controls
      .filter((control) => {
        return this.labelTypeAttributeIds.includes(
          control.get('attributeId').value
        );
      })
      .sort(
        (a, b) =>
          this.labelTypeAttributeIds.indexOf(a.get('attributeId').value) -
          this.labelTypeAttributeIds.indexOf(b.get('attributeId').value)
      );
  }

  toggleFlag(control: any) {
    control.setValue(!control.value);
  }

  isSKUTypeDisable() {
    let tempPackages: any[] = this.packages.value;
    const skuPackage = tempPackages?.find((item) => item?.isSku);
    if (skuPackage) {
      this.productForm.get('skuName').setValue(skuPackage?.packageType);
    }
    return skuPackage ? true : false;
  }

  onUnitCountChange(event: any) {
    let tempPackages: any = this.packages.value;
    tempPackages?.forEach((ele, index) => {
      if (ele.isSku) {
        this.packages.controls[index]
          .get('numberOfItems')
          .setValue(Number(event.target.value));
      }
    });
  }

  get skuOdometerControl() {
    const skuControl = this.packages.controls.find(
      (item) => item.get('isSku').value
    );

    if (skuControl) {
      return skuControl.get('odometer');
    } else {
      const fg = this.fb.group({
        value: [null],
        odometerType: [null],
      });
      return fg;
    }
  }

  // form controls

  get exportDescription() {
    return this.productForm.get('exportDetail').get('exportDescription');
  }

  get hsnUsaCode() {
    return this.productForm.get('exportDetail').get('hsnUsaCode');
  }

  get hsnIndiaCode() {
    return this.productForm.get('exportDetail').get('hsnIndiaCode');
  }

  get productAttributeValues() {
    return this.productForm.get('productAttributeValues') as UntypedFormArray;
  }

  //product information values
  get productInformationValues() {
    return this.productForm.get('productInformationValues') as UntypedFormArray;
  }

  get productCompetitors() {
    return this.productForm.get('productCompetitors') as UntypedFormArray;
  }

  // costs

  get additionalCosts() {
    return this.productForm.get('additionalCosts') as UntypedFormArray;
  }

  get productExpenseValues() {
    return this.productForm
      .get('productExpense')
      .get('expenseValues') as UntypedFormArray;
  }

  get productExpenseConversionTypes() {
    return this.productForm
      .get('productExpense')
      .get('expenseConversionTypes') as UntypedFormArray;
  }

  // product summary related

  get productSummary() {
    return this.productForm.get('productSummary');
  }

  get images() {
    return this.productForm.get('productMeta').get('images') as UntypedFormArray;
  }

  get isCustomizable() {
    return this.productForm.get('isCustomizable');
  }

  get isInventoryListed() {
    return this.productForm.get('isInventoryListed');
  }

  get isImportExportable() {
    return this.productForm.get('isImportExportable');
  }

  get isAdvanceProduct() {
    return this.productForm.get('isAdvanceProduct');
  }

  get isProductAttributes() {
    return this.productForm.get('isProductAttributes');
  }

  get isPackageAttributes() {
    return this.productForm.get('isPackageAttributes');
  }

  trackByFn(index, item) {
    return index;
  }

  setDefaultUoms() {
    const componentUoms: any = this.componentUoms.getRawValue();
    componentUoms.forEach((element) => {
      if (element.attributeName?.toUpperCase() == 'METRICCOST') {
        this.productForm
          .get('metricCost')
          .get('userConversionUom')
          .setValue(element?.userConversionUom);
      }
      if (element.attributeName?.toUpperCase() == 'DENSITY') {
        this.productForm
          .get('density')
          .get('userConversionUom')
          .setValue(element?.userConversionUom);
      }
      if (element.attributeName?.toUpperCase() == 'COST') {
        this.productForm
          .get('cost')
          .get('userConversionUom')
          .setValue(element?.userConversionUom);
      }
      if (element.attributeName?.toUpperCase() == 'VOLUME') {
        this.productForm
          .get('volume')
          .get('userConversionUom')
          .setValue(element?.userConversionUom);
      }
    });
  }

  showErrorDialog() {
    let dialogRef = this.dialog.open(CalculateErrorModalComponent, {
      data: {
        errors:
          this.productForm.getRawValue()?.debugInformation
            ?.CALCULATOR_EXPRESSION?.nativeCache,
        type: 'PRODUCT',
      },
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  get errorKeys() {
    if (
      this.productForm.getRawValue()?.debugInformation?.CALCULATOR_EXPRESSION
        ?.nativeCache
    ) {
      return Object.keys(
        this.productForm.getRawValue()?.debugInformation?.CALCULATOR_EXPRESSION
          ?.nativeCache
      );
    } else {
      return [];
    }
  }

  getDescription(item: any) {
    return this.getAttributeObjectById(item?.get('attributeId').value)
      ?.description;
  }

  isNotFixAttribute(id: any) {
    const fixattributes = ['Net Cost'];
    return fixattributes.includes(this.getAttributeObjectById(id)?.description)
      ? false
      : true;
  }

  toggleGlobalAttributes(controls: UntypedFormControl[], flag: UntypedFormControl) {
    if (this.disableForThirdPartyProduct) {
      return;
    }
    if (flag.value) {
      controls.forEach((element) => {
        element.get('isHidden').setValue(true);
      });
      flag.setValue(false);
    } else {
      controls.forEach((element) => {
        element.get('isHidden').setValue(false);
      });
      flag.setValue(true);
    }
  }

  editDropdownAttribute(item) {
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.id === item.value.attributeId;
    });
    let attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    const attributeControl = new UntypedFormControl(attribute.description);

    this.dialog
      .open(CreateDropdownFieldModalComponent, {
        data: {
          attributeName: attributeControl,
          attributeType: attributeType,
          attributeValueExpression: attribute.attributeValueExpression,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          item
            .get('attributeValueExpression')
            .setValue(res.attributeValueExpression);
          return;
        }
      });
  }

  onImageDragStart() {
    this.imageDragging = true;
  }

  onImageDragEnd() {
    this.imageDragging = false;
  }

  onImageClick(event: Event, images: any, i: number) {
    if (this.imageDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.openImageSlider(images, i);
  }

  openImageSlider(images: any, i) {
    let imgFiles = images.map((it) => (it = it.get('fileName').value));
    this.dialog.open(DadyinSliderComponent, {
      data: { images: imgFiles, index: i },
    });
  }

  drop(event) {
    moveItemInArray(
      this.images?.controls,
      event.previousIndex,
      event.currentIndex
    );
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.images?.controls,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    // Update the sort order of the images
    this.images.controls.forEach((img, index) => {
      img.patchValue({ sortOrder: index + 1 });
    });
  }

  removeFormValue(controlName: string) {
    this.productForm.get(controlName).setValue(null);
  }
  get isExtraExpense() {
    return this.productForm.get('isExtraExpense').value;
  }


  onAIClick() {
    if (!this.productForm.get('productMeta.description')?.value) {
      this.toastr.error('Product description is required');
      return;
    }
    // Implementing AI SEO generation API call
    const productDescription =
      this.productForm.get('productMeta.description')?.value || '';
    const productName =
      this.productForm.get('productMeta.productCode')?.value || '';
    const payload = {
      product_description: productDescription?.includes('"')
        ? productDescription.replace(/"/g, 'inch')
        : productDescription,
      product_name: productName,
    };
    this.apiService
      .aiGenerateSeo(payload)
      .pipe(take(1))
      .subscribe(
        (response) => {
          // New API returns SEO fields inside response.data
          // Set all SEO fields except conversationId, message, success
          const metaFields = [
            'metaTitle',
            'metaDescription',
            'metaKeywords',
            'ogTitle',
            'ogDescription',
            'twitterTitle',
            'twitterDescription',
          ];
          this.productForm
            .get('productMeta')
            .get('metaDescription')
            .setValue(response?.data?.metaDescription);
          metaFields.forEach((field) => {
            if (response.data?.[field] !== undefined) {
              const controlName =
                field === 'metaKeywords' ? 'metaKeyword' : field;
              this.productForm
                .get('productMeta')
                .get(controlName)
                .setValue(response.data[field]);
            }
          });
        },
        (error) => {
          this.toastr.error(error?.message || 'AI SEO generation failed');
        }
      );
  }

  aiImageGeneration() {
    if (!this.productForm.get('id')?.value) {
      this.toastr.error('Product ID is required to generate images.');
      return;
    }
    const payload = {
      product_id: this.productForm.get('id')?.value,
      image_types: ['hero', 'lifestyle', 'detail'],
      number_of_images: 3,
      image_quality: 'high',
      image_size: '1024x1024',
      attach_to_product: true,
    };

    this.apiService
      .aiGenerateImage(payload)
      .pipe(take(1))
      .subscribe(
        (response) => {
          const generatedImages = response?.data?.generated_images || [];
          generatedImages.forEach((element, idx) => {
            let obj: any = {
              id: '',
              sortOrder: this.images.controls?.length + idx + 1,
              fileName: element.image_url,
              isHide: false,
            };
            this.images.push(this.formsService.createImageForm());
            this.images.controls[this.images?.controls?.length - 1].patchValue(
              obj
            );
          });
        },
        (error) => {
          this.toastr.error(error?.message || 'Image AI generation failed');
        }
      );
  }

  setupExpiryValidators() {
    const min = this.productForm.get('minimumExpiry');
    const max = this.productForm.get('maximumExpiry');
    const hasExpiry = this.productForm.get('hasExpiry');
    if (!min || !max || !hasExpiry) return;

    this.expirySubscriptions.push(
      min.valueChanges.subscribe(() => max.updateValueAndValidity()),
      max.valueChanges.subscribe(() => min.updateValueAndValidity())
    );
    this.updateExpiryFieldsState(hasExpiry.value);
  }

  onHasExpiryChange() {
    this.updateExpiryFieldsState(this.productForm.get('hasExpiry').value);
  }

  updateExpiryFieldsState(hasExpiry: boolean) {
    const min = this.productForm.get('minimumExpiry');
    const max = this.productForm.get('maximumExpiry');
    const validators = hasExpiry ? [Validators.required, this.expiryValidator()] : [];

    min.setValue(null, { emitEvent: false });
    max.setValue(null, { emitEvent: false });
    min.setValidators(validators);
    max.setValidators(validators);
    min.updateValueAndValidity();
    max.updateValueAndValidity();
  }

  expiryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !this.productForm?.get('hasExpiry')?.value) return null;

      const getNum = (v: string) => {
        const match = v?.match(/^(\d+)M$/);
        return match ? +match[1] : null;
      };
      const minVal = getNum(this.productForm.get('minimumExpiry')?.value);
      const maxVal = getNum(this.productForm.get('maximumExpiry')?.value);

      return minVal !== null && maxVal !== null && minVal >= maxVal
        ? { expiryValidation: 'Min expiry must be less than max expiry' }
        : null;
    };
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.expirySubscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.expirySubscriptions = [];
  }
}

