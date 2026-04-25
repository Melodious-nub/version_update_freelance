import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';
import {
  CALCULATED_COST_ID,
  CONVERSION_COST_ID,
  COST_ID,
  COST_PER_METRICTON_ID,
  DENSITY_ID,
  MATERIAL_COST_ID,
} from 'src/app/model/common/attribute-identifiers';
import { Attribute } from 'src/app/model/common/attribute.model';
import {
  Attribute as ProcessAttribute,
  ProcessCalculator,
  ProcessCalculatorConversionAttributeValues,
  ProcessCalculatorProduct,
  ProcessConversionTypes,
  ProcessProductAttributeValues,
} from 'src/app/model/common/processes.model';
import { ConfirmDialogComponent } from '../../dialogs/confirm/confirm-dialog.component';
import { GridModule } from '@ngbracket/ngx-layout/grid';
import { MatButton } from '@angular/material/button';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';


@Component({
    selector: 'app-edit-calculator',
    templateUrl: './edit-calculator.component.html',
    styleUrls: ['./edit-calculator.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatSelect,
        MatOption,
        DadyinButtonComponent,
        MatButton,
        GridModule
    ]
})
export class EditCalculatorComponent implements OnInit {
  private _processCalculatorForm: UntypedFormGroup;
  @Input() public set processCalculatorForm(processCalculatorForm: UntypedFormGroup) {
    this._processCalculatorForm = processCalculatorForm;
  }
  public get processCalculatorForm() {
    return this._processCalculatorForm;
  }

  private _calculatorMeta: AbstractControl;
  @Input() public set calculatorMeta(calculatorMeta: AbstractControl) {
    this._calculatorMeta = calculatorMeta;
    this.updatedCalculatorMeta();
    if (
      this.calculatorMetaSubscription &&
      !this.calculatorMetaSubscription.closed
    ) {
      this.calculatorMetaSubscription.unsubscribe();
    }
    this.calculatorMetaSubscription = this._calculatorMeta.valueChanges
      .pipe(takeUntil(this.unSubscribeAll.asObservable()))
      .subscribe(() => {
        this.updatedCalculatorMeta();
      });
  }
  public get calculatorMeta() {
    return this._calculatorMeta;
  }

  private _products: UntypedFormArray;
  @Input() public set products(products: UntypedFormArray) {
    this._products = products;
    this.updatedProducts();
    if (this.productsSubscription && !this.productsSubscription.closed) {
      this.productsSubscription.unsubscribe();
    }
    this.productsSubscription = this._products.valueChanges
      .pipe(takeUntil(this.unSubscribeAll.asObservable()))
      .subscribe(() => {
        this.updatedProducts();
      });
  }
  public get products() {
    return this._products;
  }

  private _conversionType: UntypedFormArray;
  @Input() public set conversionType(conversionType: UntypedFormArray) {
    this._conversionType = conversionType;
    this.updatedconversionType();
    if (
      this.conversionTypesSubscription &&
      !this.conversionTypesSubscription.closed
    ) {
      this.conversionTypesSubscription.unsubscribe();
    }
    this.conversionTypesSubscription = this._conversionType.valueChanges
      .pipe(takeUntil(this.unSubscribeAll.asObservable()))
      .subscribe(() => {
        this.updatedconversionType();
      });
  }
  public get conversionType() {
    return this._conversionType;
  }

  private _isShowingCalculator: boolean;
  @Input() public set isShowingCalculator(isShowingCalculator: boolean) {
    this._isShowingCalculator = isShowingCalculator;
    if (this.isShowingCalculator) {
      this.lastSavedState = this.processCalculatorForm?.value;
    }
  }
  public get isShowingCalculator() {
    return this._isShowingCalculator;
  }

  @Input() productList: any[];
  @Input() conversionTypesList: any[];
  @Input() attributeList: ProcessAttribute[];
  @Output() isEdittingCalculatorEvent = new EventEmitter<boolean>();
  @Output() userInputChange = new EventEmitter<void>();

  public get id(): number {
    if (this.processCalculatorForm && this.processCalculatorForm.get('id')) {
      return +this.processCalculatorForm.get('id').value;
    }
    return 0;
  }

  get processCalculatorAttributeValues(): UntypedFormArray {
    return this.processCalculatorForm.get(
      'processCalculatorAttributeValues'
    ) as UntypedFormArray;
  }

  get processCalculatorProduct(): UntypedFormArray {
    return this.processCalculatorForm.get(
      'processCalculatorProduct'
    ) as UntypedFormArray;
  }

  get processCalculatorConversionType(): UntypedFormArray {
    return this.processCalculatorForm.get(
      'processCalculatorConversionType'
    ) as UntypedFormArray;
  }

  public processCalculatorProductAttributes: ProcessAttribute[] = [];
  public processCalculatorConversionTypeAttributes: ProcessAttribute[] = [];
  public isBeingAddedNewSubProductAttribute: boolean = false;
  public allAttributesForSubProduct: Attribute[] = [];
  public isBeingAddedNewConversionTypeAttribute: boolean = false;
  public allAttributesForConversionType: Attribute[] = [];
  public isBeingAddedNewAttributeValueAttribute: boolean = false;
  public allAttributesForAttributeValue: Attribute[] = [];
  private calculatorMetaSubscription: Subscription;
  private productsSubscription: Subscription;
  private conversionTypesSubscription: Subscription;
  private lastSavedState: ProcessCalculator;
  private processCalculatorAttributeValuesSet: any[];
  private processCalculatorProductSet: any[];
  private processCalculatorConversionTypeSet: any[];
  private unSubscribeAll: Subject<void> = new Subject();

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _dialog: MatDialog,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setInitialValues();
  }

  ngAfterViewChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  public getProcessCalculatorProductItem(
    processCalculatorProductControl: AbstractControl
  ): UntypedFormArray {
    return processCalculatorProductControl.get(
      'processCalculatorProductAttributeValues'
    ) as UntypedFormArray;
  }

  public getProcessCalculatorConversionTypeItem(
    processCalculatorConversionTypeControl: AbstractControl
  ): UntypedFormArray {
    return processCalculatorConversionTypeControl.get(
      'processCalculatorConversionAttributeValues'
    ) as UntypedFormArray;
  }

  public getProductName(productId: number): string {
    const product = this.productList
      ? this.productList.find((product) => product?.id === productId)
      : false;
    if (product) {
      return product?.description;
    } else {
      return 'Sub-Product (id: ' + productId + ')';
    }
  }

  public getConversionTypeName(conversionTypeId: number): string {
    const conversionType = this.conversionTypesList
      ? this.conversionTypesList.find(
          (conversionType) => conversionType?.id === conversionTypeId
        )
      : false;
    if (conversionType) {
      return conversionType?.description;
    } else {
      return 'Conversion-Type (id: ' + conversionTypeId + ')';
    }
  }

  public getAttribute(attributeId: number): ProcessAttribute {
    const attribute = this.attributeList
      ? this.attributeList.find((attribute) => attribute.id === attributeId)
      : false;
    if (attribute) {
      return attribute;
    } else {
      return null;
    }
  }

  private updatedCalculatorMeta() {
    if (this.calculatorMeta.value) {
      this.setInitialValues();
    }
  }

  private updatedProducts() {
    this.setInitialValues();
  }

  private updatedconversionType() {
    this.setInitialValues();
  }

  private setInitialValues(): void {
    if (
      this.processCalculatorForm &&
      this.calculatorMeta.value &&
      this.products &&
      this.conversionType &&
      this.productList &&
      this.conversionTypesList &&
      this.attributeList
    ) {
      if (this.id) {
        this.constructValues();
      } else {
        this.setValues();
      }
    } else if (
      this.processCalculatorForm &&
      this.products &&
      this.conversionType &&
      this.productList &&
      this.conversionTypesList &&
      this.attributeList
    ) {
      if (this.id) {
        this.constructValues();
      }
    }
  }

  setValues(): void {
    if (!this.id && this.calculatorMeta.value) {
      this.processCalculatorForm.patchValue({
        description: this.calculatorMeta?.value?.description,
      });

      for (const calculatorEntity of this.calculatorMeta?.value
        ?.calculatorEntities) {
        if (calculatorEntity?.entityType === 'Product') {
          this.setProcessCalculatorAttributeValue(
            calculatorEntity?.calculatorAttributeValues
          );
        } else if (calculatorEntity?.entityType === 'Process.Product') {
          this.setProcessCalculatorProduct(
            calculatorEntity?.calculatorAttributeValues
          );
        } else if (calculatorEntity?.entityType === 'Process.ConversionType') {
          this.setProcessCalculatorConversionType(
            calculatorEntity?.calculatorAttributeValues
          );
        }
      }
    }
  }

  constructValues(): void {
    const formArray = this.processCalculatorForm.get(
      'processCalculatorAttributeValuesSet'
    );
    if (formArray) {
      this.setProcessCalculatorAttributeValue(formArray.value);
      this.processCalculatorAttributeValuesSet = formArray.value;
      this.processCalculatorForm.removeControl(
        'processCalculatorAttributeValuesSet'
      );
    } else if (this.processCalculatorAttributeValuesSet) {
      this.setProcessCalculatorAttributeValue(
        this.processCalculatorAttributeValuesSet
      );
    }

    const formArray1 = this.processCalculatorForm.get(
      'processCalculatorProductSet'
    );
    if (formArray1) {
      for (const val of formArray1.value as Array<any>) {
        this.addProcessCalculatorProduct(val);
      }
      this.processCalculatorProductSet = formArray1.value;
      this.processCalculatorForm.removeControl('processCalculatorProductSet');
    } else if (this.processCalculatorProductSet) {
      for (const val of this.processCalculatorProductSet) {
        this.addProcessCalculatorProduct(val);
      }
    }

    // keep child products consistent with parent
    this.updateProcessCalculatorProductOnParentChange();

    // update whenever changed in parent
    if (this.calculatorMeta && this.calculatorMeta?.value) {
      for (const calculatorEntity of this.calculatorMeta?.value
        ?.calculatorEntities) {
        if (calculatorEntity?.entityType === 'Process.Product') {
          this.setProcessCalculatorProduct(
            calculatorEntity?.calculatorAttributeValues
          );
        }
      }
    }

    const formArray2 = this.processCalculatorForm.get(
      'processCalculatorConversionTypeSet'
    );
    if (formArray2) {
      for (const val of formArray2.value as Array<any>) {
        this.addProcessCalculatorConversionTypeItem(val);
      }
      this.processCalculatorConversionTypeSet = formArray2.value;
      this.processCalculatorForm.removeControl(
        'processCalculatorConversionTypeSet'
      );
    } else if (this.processCalculatorConversionTypeSet) {
      for (const val of this.processCalculatorConversionTypeSet) {
        this.addProcessCalculatorConversionTypeItem(val);
      }
    }

    // keep child products consistent with parent
    this.updateProcessCalculatorConversionTypeOnParentChange();

    // update whenever changed in parent
    if (this.calculatorMeta && this.calculatorMeta?.value) {
      for (const calculatorEntity of this.calculatorMeta?.value
        ?.calculatorEntities) {
        if (calculatorEntity?.entityType === 'Process.ConversionType') {
          this.setProcessCalculatorConversionType(
            calculatorEntity?.calculatorAttributeValues
          );
        }
      }
    }
  }

  public hasAttributeAsAnInputForSubProduct(
    processCalculatorProductControls: UntypedFormArray,
    processCalculatorProductAttribute: ProcessAttribute
  ) {
    const selectedAttribute = (
      processCalculatorProductControls.value as Array<ProcessCalculatorConversionAttributeValues>
    ).filter(
      (controlValue) =>
        controlValue?.attribute?.id === processCalculatorProductAttribute?.id
    );
    if (selectedAttribute.length) {
      return true;
    } else {
      return false;
    }
  }

  public hasAttributeAsAnInputForConversionType(
    processCalculatorConversionTypeControls: UntypedFormArray,
    processCalculatorConversionTypeAttribute: ProcessAttribute
  ) {
    const selectedAttribute = (
      processCalculatorConversionTypeControls.value as Array<ProcessCalculatorConversionAttributeValues>
    ).filter(
      (controlValue) =>
        controlValue?.attribute?.id ===
        processCalculatorConversionTypeAttribute?.id
    );
    if (selectedAttribute.length) {
      return true;
    } else {
      return false;
    }
  }

  private setProcessCalculatorAttributeValue(
    calculatorAttributeValues: any[]
  ): void {
    for (const calculatorAttributeValue of calculatorAttributeValues) {
      let processCalculatorAttributeValue: ProcessProductAttributeValues;
      if (
        calculatorAttributeValue.hasOwnProperty('attribute') &&
        calculatorAttributeValue.attribute.hasOwnProperty('id')
      ) {
        processCalculatorAttributeValue = { ...calculatorAttributeValue };
      } else {
        const attribute = this.getAttribute(
          calculatorAttributeValue?.attribute
        );
        processCalculatorAttributeValue = {
          attribute: attribute,
          attributeValue: null,
          attributeValueExpression:
            calculatorAttributeValue?.attributeValueExpression,
          userConversionUom: attribute?.systemUom?.description,
          sortOrder: calculatorAttributeValue?.sortOrder,
        };
      }
      this.addProcessCalculatorAttributeValue(processCalculatorAttributeValue);
    }
  }

  private addProcessCalculatorAttributeValue(
    processCalculatorAttributeValue: ProcessProductAttributeValues
  ): void {
    let isPresentAlready = false;

    // do not add duplicate items
    for (const attributeValue of this.processCalculatorAttributeValues?.value) {
      if (
        attributeValue?.attribute?.id ===
        processCalculatorAttributeValue?.attribute?.id
      ) {
        isPresentAlready = true;
        break;
      }
    }

    if (!isPresentAlready) {
      const systemUOMFormGroup = this._formBuilder.group({
        id: processCalculatorAttributeValue?.attribute?.systemUom?.id,
        description:
          processCalculatorAttributeValue?.attribute?.systemUom?.description,
      });

      const processAttributeFormGroup = this._formBuilder.group({
        id: processCalculatorAttributeValue?.attribute?.id,
        description: processCalculatorAttributeValue?.attribute?.description,
        systemUom: systemUOMFormGroup,
      });

      let processCalculatorAttributeValueFormGroup: UntypedFormGroup;
      if (processCalculatorAttributeValue?.id) {
        processCalculatorAttributeValueFormGroup = this._formBuilder.group({
          id: processCalculatorAttributeValue?.id,
          attribute: processAttributeFormGroup,
          attributeValue: processCalculatorAttributeValue?.attributeValue,
          attributeValueExpression: [
            processCalculatorAttributeValue?.attributeValueExpression,
            Validators.required,
          ],
          userConversionUom: processCalculatorAttributeValue?.userConversionUom,
          sortOrder: processCalculatorAttributeValue?.sortOrder
            ? processCalculatorAttributeValue?.sortOrder
            : this.processCalculatorAttributeValues?.length + 1,
        });
      } else {
        processCalculatorAttributeValueFormGroup = this._formBuilder.group({
          attribute: processAttributeFormGroup,
          attributeValue: processCalculatorAttributeValue?.attributeValue,
          attributeValueExpression: [
            processCalculatorAttributeValue?.attributeValueExpression,
            Validators.required,
          ],
          userConversionUom: processCalculatorAttributeValue?.userConversionUom,
          sortOrder: processCalculatorAttributeValue?.sortOrder
            ? processCalculatorAttributeValue?.sortOrder
            : this.processCalculatorAttributeValues?.length + 1,
        });
      }

      this.processCalculatorAttributeValues.push(
        processCalculatorAttributeValueFormGroup
      );
    }
  }

  public removeProcessCalculatorAttributeValue(index: number): void {
    this.processCalculatorAttributeValues.removeAt(index);
  }

  public isDeletable(attributeId: number): boolean {
    if (
      attributeId === COST_ID ||
      attributeId === DENSITY_ID ||
      attributeId === MATERIAL_COST_ID ||
      attributeId === CONVERSION_COST_ID ||
      attributeId === COST_PER_METRICTON_ID ||
      attributeId === CALCULATED_COST_ID
    ) {
      return false;
    }
    return true;
  }

  private setProcessCalculatorProduct(calculatorAttributeValues: any[]): void {
    for (const value of this.products?.value) {
      if (value?.subProduct) {
        const processCalculatorProductAttributeValues: ProcessCalculatorConversionAttributeValues[] =
          [];
        for (const calculatorAttributeValue of calculatorAttributeValues) {
          const product = this.productList.find(
            (product) => product?.id === value?.subProduct
          );
          for (const subProductAttributeValue of product?.productAttributeValues) {
            if (
              calculatorAttributeValue?.attribute ===
              subProductAttributeValue?.attribute?.id
            ) {
              const processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues =
                {
                  attribute: subProductAttributeValue?.attribute,
                  attributeValue: null,
                  attributeValueExpression:
                    calculatorAttributeValue?.attributeValueExpression,
                  userConversionUom:
                    subProductAttributeValue?.userConversionUom,
                  sortOrder: calculatorAttributeValue?.sortOrder,
                };
              processCalculatorProductAttributeValues.push(
                processCalculatorConversionAttributeValues
              );
              break;
            }
          }
          for (const processCalculatorProductAttribute of this
            .processCalculatorProductAttributes) {
            let isPresentAlready = false;
            for (const processCalculatorProductControl of this
              .processCalculatorProduct?.controls) {
              for (const processCalculatorProductItem of this.getProcessCalculatorProductItem(
                processCalculatorProductControl
              )?.controls) {
                if (
                  processCalculatorProductAttribute?.id ===
                  processCalculatorProductItem?.value?.attribute?.id
                ) {
                  isPresentAlready = true;
                  break;
                }
              }
            }
            if (!isPresentAlready) {
              const processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues =
                {
                  attribute: this.attributeList.find(
                    (attribute) =>
                      attribute.id === processCalculatorProductAttribute.id
                  ),
                  attributeValue: null,
                  attributeValueExpression: '',
                  userConversionUom: null,
                  sortOrder: processCalculatorProductAttributeValues.length + 1,
                };
              processCalculatorProductAttributeValues.push(
                processCalculatorConversionAttributeValues
              );
            }
          }
        }
        const processCalculatorProduct: ProcessCalculatorProduct = {
          product: value?.subProduct,
          processCalculatorProductAttributeValues:
            processCalculatorProductAttributeValues,
        };
        this.addProcessCalculatorProduct(processCalculatorProduct);
      }
    }
    this.updateProcessCalculatorProductOnParentChange();
  }

  private updateProcessCalculatorProductOnParentChange(): void {
    (
      this.processCalculatorProduct?.value as Array<ProcessCalculatorProduct>
    ).forEach((processCalculatorProduct, index) => {
      // if products removed or changes in parent
      const preExistingProducts = (this.products?.value).filter(
        (subProduct) =>
          processCalculatorProduct.product === subProduct.subProduct
      );
      if (preExistingProducts.length <= 0) {
        // remove from index: index
        this.removeProcessCalculatorProduct(index);
      }
    });
    // check if all parent products are present in here
    (this.products?.value).forEach((subProduct) => {
      const existingProducts = (
        this.processCalculatorProduct?.value as Array<ProcessCalculatorProduct>
      ).filter(
        (processCalculatorProduct) =>
          processCalculatorProduct.product === subProduct.subProduct
      );
      // if not present, add it
      if (!existingProducts.length) {
        const processCalculatorProduct: ProcessCalculatorProduct = {
          product: subProduct?.subProduct,
          processCalculatorProductAttributeValues: [],
        };
        this.processCalculatorProductAttributes.forEach(
          (processCalculatorProductAttribute) => {
            let attributeValueExpression = '';
            if (this.calculatorMeta?.value) {
              for (const calculatorEntity of this.calculatorMeta?.value
                ?.calculatorEntities) {
                if (calculatorEntity?.entityType === 'Process.Product') {
                  for (const calculatorAttributeValue of calculatorEntity?.calculatorAttributeValues) {
                    if (
                      calculatorAttributeValue?.attribute ===
                      processCalculatorProductAttribute?.id
                    ) {
                      attributeValueExpression =
                        calculatorAttributeValue?.attributeValueExpression;
                    }
                  }
                }
              }
            }
            processCalculatorProduct.processCalculatorProductAttributeValues.push(
              {
                attribute: processCalculatorProductAttribute,
                attributeValue: null,
                attributeValueExpression: attributeValueExpression,
                userConversionUom: null,
                sortOrder:
                  processCalculatorProduct
                    .processCalculatorProductAttributeValues.length + 1,
              }
            );
          }
        );
        this.addProcessCalculatorProduct(processCalculatorProduct);
      }
    });
  }

  private addProcessCalculatorProduct(
    processCalculatorProduct: ProcessCalculatorProduct
  ): void {
    let isPresentAlready = false;

    // do not add duplicate items
    for (const subProduct of this.processCalculatorProduct?.value) {
      if (subProduct.product === processCalculatorProduct?.product) {
        isPresentAlready = true;
        break;
      }
    }

    if (!isPresentAlready) {
      let processCalculatorProductFormGroup: UntypedFormGroup;
      if (processCalculatorProduct?.id) {
        processCalculatorProductFormGroup = this._formBuilder.group({
          id: processCalculatorProduct?.id,
          product: processCalculatorProduct?.product,
          processCalculatorProductAttributeValues: this._formBuilder.array([]),
        });
      } else {
        processCalculatorProductFormGroup = this._formBuilder.group({
          product: processCalculatorProduct?.product,
          processCalculatorProductAttributeValues: this._formBuilder.array([]),
        });
      }

      for (const processCalculatorProductAttributeValue of processCalculatorProduct?.processCalculatorProductAttributeValues) {
        this.addProcessCalculatorProductAttributeValue(
          processCalculatorProductAttributeValue,
          processCalculatorProductFormGroup
        );
      }

      this.processCalculatorProduct.push(processCalculatorProductFormGroup);
    }
  }

  private addProcessCalculatorProductAttributeValue(
    processCalculatorProductAttributeValue: ProcessCalculatorConversionAttributeValues,
    processCalculatorProductFormGroup: UntypedFormGroup
  ): void {
    const systemUOMFormGroup = this._formBuilder.group({
      id: processCalculatorProductAttributeValue?.attribute?.systemUom?.id,
      description:
        processCalculatorProductAttributeValue?.attribute?.systemUom
          ?.description,
    });
    const processAttributeFormGroup = this._formBuilder.group({
      id: processCalculatorProductAttributeValue?.attribute?.id,
      description:
        processCalculatorProductAttributeValue?.attribute?.description,
      systemUom: systemUOMFormGroup,
    });

    // Select the form array to add new group
    const processCalculatorProductAttributeValues =
      processCalculatorProductFormGroup.get(
        'processCalculatorProductAttributeValues'
      ) as UntypedFormArray;
    let processCalculatorAttributeValueFormGroup: UntypedFormGroup;
    if (processCalculatorProductAttributeValue?.id) {
      processCalculatorAttributeValueFormGroup = this._formBuilder.group({
        id: processCalculatorProductAttributeValue?.id,
        attribute: processAttributeFormGroup,
        attributeValue: processCalculatorProductAttributeValue?.attributeValue,
        attributeValueExpression: [
          processCalculatorProductAttributeValue?.attributeValueExpression,
          Validators.required,
        ],
        userConversionUom:
          processCalculatorProductAttributeValue?.userConversionUom,
        sortOrder: processCalculatorProductAttributeValue?.sortOrder
          ? processCalculatorProductAttributeValue?.sortOrder
          : processCalculatorProductAttributeValues?.length + 1,
      });
    } else {
      processCalculatorAttributeValueFormGroup = this._formBuilder.group({
        attribute: processAttributeFormGroup,
        attributeValue: processCalculatorProductAttributeValue?.attributeValue,
        attributeValueExpression: [
          processCalculatorProductAttributeValue?.attributeValueExpression,
          Validators.required,
        ],
        userConversionUom:
          processCalculatorProductAttributeValue?.userConversionUom,
        sortOrder: processCalculatorProductAttributeValue?.sortOrder
          ? processCalculatorProductAttributeValue?.sortOrder
          : processCalculatorProductAttributeValues?.length + 1,
      });
    }

    // add new group to form array
    processCalculatorProductAttributeValues.push(
      processCalculatorAttributeValueFormGroup
    );

    // add to attribute if not already present, for looping in view
    const searchedAttribute = this.processCalculatorProductAttributes.filter(
      (processCalculatorProductAttribute) =>
        processCalculatorProductAttribute?.id ===
        processCalculatorProductAttributeValue?.attribute?.id
    );
    if (!searchedAttribute.length) {
      this.processCalculatorProductAttributes.push(
        Object.assign({}, processCalculatorProductAttributeValue?.attribute)
      );
    }
  }

  public removeProcessCalculatorProductAttributes(index: number): void {
    const removeAttribute = this.processCalculatorProductAttributes[index];
    for (const controlProcessCalculatorProduct of this.processCalculatorProduct
      ?.controls) {
      (
        (controlProcessCalculatorProduct as UntypedFormGroup).get(
          'processCalculatorProductAttributeValues'
        ) as UntypedFormArray
      ).controls.forEach(
        (controlProcessCalculatorProductAttributeValue, index) => {
          if (
            (
              controlProcessCalculatorProductAttributeValue.get(
                'attribute'
              ) as UntypedFormGroup
            ).get('id').value === removeAttribute.id
          ) {
            (
              (controlProcessCalculatorProduct as UntypedFormGroup).get(
                'processCalculatorProductAttributeValues'
              ) as UntypedFormArray
            ).removeAt(index);
          }
        }
      );
    }
    this.processCalculatorProductAttributes.splice(index, 1);
  }

  private removeProcessCalculatorProduct(index: number): void {
    this.processCalculatorProduct.removeAt(index);
  }

  private setProcessCalculatorConversionType(
    calculatorAttributeValues: any[]
  ): void {
    for (const value of this.conversionType?.value) {
      if (value?.conversionType) {
        const processCalculatorProductAttributeValues: ProcessCalculatorConversionAttributeValues[] =
          [];
        for (const calculatorAttributeValue of calculatorAttributeValues) {
          for (const attribute of this.attributeList) {
            if (calculatorAttributeValue.attribute === attribute?.id) {
              const processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues =
                {
                  attribute: attribute,
                  attributeValue: null,
                  attributeValueExpression:
                    calculatorAttributeValue?.attributeValueExpression,
                  userConversionUom: null,
                  sortOrder: processCalculatorProductAttributeValues.length + 1,
                };
              processCalculatorProductAttributeValues.push(
                processCalculatorConversionAttributeValues
              );
              break;
            }
          }

          for (const processCalculatorConversionTypeAttribute of this
            .processCalculatorConversionTypeAttributes) {
            let isPresentAlready = false;
            for (const processCalculatorConversionTypeControl of this
              .processCalculatorConversionType?.controls) {
              for (const processCalculatorConversionTypeItem of this.getProcessCalculatorConversionTypeItem(
                processCalculatorConversionTypeControl
              )?.controls) {
                if (
                  processCalculatorConversionTypeAttribute?.id ===
                  processCalculatorConversionTypeItem?.value?.attribute?.id
                ) {
                  isPresentAlready = true;
                  break;
                }
              }
            }
            if (!isPresentAlready) {
              const processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues =
                {
                  attribute: this.attributeList.find(
                    (attribute) =>
                      attribute.id ===
                      processCalculatorConversionTypeAttribute.id
                  ),
                  attributeValue: null,
                  attributeValueExpression: '',
                  userConversionUom: null,
                  sortOrder: processCalculatorProductAttributeValues.length + 1,
                };
              processCalculatorProductAttributeValues.push(
                processCalculatorConversionAttributeValues
              );
            }
          }
        }
        const processCalculatorConversionType: ProcessConversionTypes = {
          conversionType: value?.conversionType,
          processCalculatorConversionAttributeValues:
            processCalculatorProductAttributeValues,
        };
        this.addProcessCalculatorConversionTypeItem(
          processCalculatorConversionType
        );
      }
    }
    this.updateProcessCalculatorConversionTypeOnParentChange();
  }

  private updateProcessCalculatorConversionTypeOnParentChange(): void {
    (
      this.processCalculatorConversionType
        ?.value as Array<ProcessConversionTypes>
    ).forEach((processConversionType, index) => {
      // if products removed or changes in parent
      const preExistingConversionType = (this.conversionType?.value).filter(
        (conversionType) =>
          processConversionType.conversionType === conversionType.conversionType
      );
      if (preExistingConversionType.length <= 0) {
        // remove from index: index
        this.removeProcessCalculatorConversionTypeItem(index);
      }
    });
    // check if all parent convertionTypes are present in here
    (this.conversionType?.value).forEach((conversionType) => {
      const existingConversionTypes = (
        this.processCalculatorConversionType
          ?.value as Array<ProcessConversionTypes>
      ).filter(
        (processConversionType) =>
          processConversionType.conversionType === conversionType.conversionType
      );
      // if not present, add it
      if (!existingConversionTypes.length) {
        const processCalculatorConversionType: ProcessConversionTypes = {
          conversionType: conversionType?.conversionType,
          processCalculatorConversionAttributeValues: [],
        };
        this.processCalculatorConversionTypeAttributes.forEach(
          (processCalculatorConversionTypeAttribute) => {
            let attributeValueExpression = '';
            if (this.calculatorMeta?.value) {
              for (const calculatorEntity of this.calculatorMeta?.value
                ?.calculatorEntities) {
                if (calculatorEntity?.entityType === 'Process.ConversionType') {
                  for (const calculatorAttributeValue of calculatorEntity?.calculatorAttributeValues) {
                    if (
                      calculatorAttributeValue?.attribute ===
                      processCalculatorConversionTypeAttribute?.id
                    ) {
                      attributeValueExpression =
                        calculatorAttributeValue?.attributeValueExpression;
                    }
                  }
                }
              }
            }
            processCalculatorConversionType.processCalculatorConversionAttributeValues.push(
              {
                attribute: processCalculatorConversionTypeAttribute,
                attributeValue: null,
                attributeValueExpression: attributeValueExpression,
                userConversionUom: null,
                sortOrder:
                  processCalculatorConversionType
                    .processCalculatorConversionAttributeValues.length + 1,
              }
            );
          }
        );
        this.addProcessCalculatorConversionTypeItem(
          processCalculatorConversionType
        );
      }
    });
  }

  private addProcessCalculatorConversionTypeItem(
    processCalculatorConversionType: ProcessConversionTypes
  ): void {
    let isPresentAlready = false;

    // do not add duplicate items
    for (const conversionType of this.processCalculatorConversionType?.value) {
      if (
        conversionType.conversionType ===
        processCalculatorConversionType?.conversionType
      ) {
        isPresentAlready = true;
        break;
      }
    }

    if (!isPresentAlready) {
      let processCalculatorConversionTypeFormGroup: UntypedFormGroup;
      if (processCalculatorConversionType?.id) {
        processCalculatorConversionTypeFormGroup = this._formBuilder.group({
          id: processCalculatorConversionType?.id,
          conversionType: processCalculatorConversionType?.conversionType,
          processCalculatorConversionAttributeValues: this._formBuilder.array(
            []
          ),
        });
      } else {
        processCalculatorConversionTypeFormGroup = this._formBuilder.group({
          conversionType: processCalculatorConversionType?.conversionType,
          processCalculatorConversionAttributeValues: this._formBuilder.array(
            []
          ),
        });
      }

      for (const processCalculatorConversionAttributeValue of processCalculatorConversionType.processCalculatorConversionAttributeValues) {
        this.addProcessCalculatorConversionAttributeValue(
          processCalculatorConversionAttributeValue,
          processCalculatorConversionTypeFormGroup
        );
      }

      this.processCalculatorConversionType.push(
        processCalculatorConversionTypeFormGroup
      );
    }
  }

  private addProcessCalculatorConversionAttributeValue(
    processCalculatorConversionAttributeValue: ProcessCalculatorConversionAttributeValues,
    processCalculatorConversionTypeFormGroup: UntypedFormGroup
  ): void {
    const systemUOMFormGroup = this._formBuilder.group({
      id: processCalculatorConversionAttributeValue?.attribute?.systemUom?.id,
      description:
        processCalculatorConversionAttributeValue?.attribute?.systemUom
          ?.description,
    });
    const processAttributeFormGroup = this._formBuilder.group({
      id: processCalculatorConversionAttributeValue?.attribute?.id,
      description:
        processCalculatorConversionAttributeValue?.attribute?.description,
      systemUom: systemUOMFormGroup,
    });

    // Select the form array to add new group
    const processCalculatorConversionAttributeValues =
      processCalculatorConversionTypeFormGroup.get(
        'processCalculatorConversionAttributeValues'
      ) as UntypedFormArray;
    let processCalculatorAttributeValueFormGroup: UntypedFormGroup;

    if (processCalculatorConversionAttributeValue?.id) {
      processCalculatorAttributeValueFormGroup = this._formBuilder.group({
        id: processCalculatorConversionAttributeValue?.id,
        attribute: processAttributeFormGroup,
        attributeValue:
          processCalculatorConversionAttributeValue?.attributeValue,
        attributeValueExpression: [
          processCalculatorConversionAttributeValue?.attributeValueExpression,
          Validators.required,
        ],
        userConversionUom:
          processCalculatorConversionAttributeValue?.userConversionUom,
        sortOrder: processCalculatorConversionAttributeValue?.sortOrder
          ? processCalculatorConversionAttributeValue?.sortOrder
          : processCalculatorConversionAttributeValues?.length + 1,
      });
    } else {
      processCalculatorAttributeValueFormGroup = this._formBuilder.group({
        attribute: processAttributeFormGroup,
        attributeValue:
          processCalculatorConversionAttributeValue?.attributeValue,
        attributeValueExpression: [
          processCalculatorConversionAttributeValue?.attributeValueExpression,
          Validators.required,
        ],
        userConversionUom:
          processCalculatorConversionAttributeValue?.userConversionUom,
        sortOrder: processCalculatorConversionAttributeValue?.sortOrder
          ? processCalculatorConversionAttributeValue?.sortOrder
          : processCalculatorConversionAttributeValues?.length + 1,
      });
    }

    // add new group to form array
    processCalculatorConversionAttributeValues.push(
      processCalculatorAttributeValueFormGroup
    );

    // add to attribute if not already present, for looping in view
    const searchedAttribute =
      this.processCalculatorConversionTypeAttributes.filter(
        (processCalculatorConversionTypeAttribute) =>
          processCalculatorConversionTypeAttribute?.id ===
          processCalculatorConversionAttributeValue?.attribute?.id
      );
    if (!searchedAttribute.length) {
      this.processCalculatorConversionTypeAttributes.push(
        Object.assign({}, processCalculatorConversionAttributeValue?.attribute)
      );
    }
  }

  public removeProcessCalculatorConversionTypeAttributes(index: number): void {
    const removeAttribute =
      this.processCalculatorConversionTypeAttributes[index];
    for (const controlProcessCalculatorConversionType of this
      .processCalculatorConversionType?.controls) {
      (
        (controlProcessCalculatorConversionType as UntypedFormGroup).get(
          'processCalculatorConversionAttributeValues'
        ) as UntypedFormArray
      ).controls.forEach(
        (controlProcessCalculatorConversionAttributeValue, index) => {
          if (
            (
              controlProcessCalculatorConversionAttributeValue.get(
                'attribute'
              ) as UntypedFormGroup
            ).get('id').value === removeAttribute.id
          ) {
            (
              (controlProcessCalculatorConversionType as UntypedFormGroup).get(
                'processCalculatorConversionAttributeValues'
              ) as UntypedFormArray
            ).removeAt(index);
          }
        }
      );
    }
    this.processCalculatorConversionTypeAttributes.splice(index, 1);
  }

  private removeProcessCalculatorConversionTypeItem(index: number): void {
    this.processCalculatorConversionType.removeAt(index);
  }

  public addSubProductAttribute(): void {
    this.isBeingAddedNewSubProductAttribute = true;
    this.allAttributesForSubProduct = [];
    for (const attribute of this.attributeList) {
      const searchAttribute = this.processCalculatorProductAttributes.find(
        (productAttribute) => productAttribute?.id === attribute?.id
      );
      if (!searchAttribute) {
        const attributeSelected: Attribute = {
          id: attribute?.id,
          description: attribute?.description,
          availableUoms: [],
          systemUom: attribute?.systemUom,
        };
        this.allAttributesForSubProduct.push(attributeSelected);
      }
    }
  }

  public cancelAddSubProductAttribute(): void {
    this.isBeingAddedNewSubProductAttribute = false;
  }

  public onSubProductAttributeSelected(selectedAttribute: Attribute) {
    this.allAttributesForSubProduct = [];
    if (selectedAttribute) {
      this.isBeingAddedNewSubProductAttribute = false;
      for (const controls of this.processCalculatorProduct?.controls) {
        const processCalculatorProductAttributeValue: ProcessCalculatorConversionAttributeValues =
          {
            attribute: {
              id: selectedAttribute?.id,
              description: selectedAttribute?.description,
              systemUom: selectedAttribute?.systemUom,
            },
            attributeValue: null,
            attributeValueExpression: '',
            userConversionUom: null,
            sortOrder: null,
          };
        this.addProcessCalculatorProductAttributeValue(
          processCalculatorProductAttributeValue,
          controls as UntypedFormGroup
        );
      }
    }
  }

  public addConversionTypeAttribute(): void {
    this.isBeingAddedNewConversionTypeAttribute = true;
    this.allAttributesForConversionType = [];
    for (const attribute of this.attributeList) {
      const searchAttribute =
        this.processCalculatorConversionTypeAttributes.find(
          (conversionTypeAttribute) =>
            conversionTypeAttribute?.id === attribute?.id
        );
      if (!searchAttribute) {
        const attributeSelected: Attribute = {
          id: attribute?.id,
          description: attribute?.description,
          availableUoms: [],
          systemUom: attribute?.systemUom,
        };
        this.allAttributesForConversionType.push(attributeSelected);
      }
    }
  }

  public cancelAddConversionTypeAttribute(): void {
    this.isBeingAddedNewConversionTypeAttribute = false;
  }

  public onConversionTypeAttributeSelected(selectedAttribute: Attribute) {
    this.allAttributesForConversionType = [];

    if (selectedAttribute) {
      this.isBeingAddedNewConversionTypeAttribute = false;
      for (const controls of this.processCalculatorConversionType?.controls) {
        const processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues =
          {
            attribute: {
              id: selectedAttribute?.id,
              description: selectedAttribute?.description,
              systemUom: selectedAttribute?.systemUom,
            },
            attributeValue: null,
            attributeValueExpression: '',
            userConversionUom: null,
            sortOrder: null,
          };
        this.addProcessCalculatorConversionAttributeValue(
          processCalculatorConversionAttributeValues,
          controls as UntypedFormGroup
        );
      }
    }
  }

  public addAttributeValueAttribute(): void {
    this.isBeingAddedNewAttributeValueAttribute = true;
    this.allAttributesForAttributeValue = [];
    for (const attribute of this.attributeList) {
      const searchAttribute = (
        this.processCalculatorAttributeValues
          ?.value as ProcessProductAttributeValues[]
      ).find(
        (attributeValueAttribute) =>
          attributeValueAttribute?.attribute.id === attribute?.id
      );
      if (!searchAttribute) {
        const attributeSelected: Attribute = {
          id: attribute?.id,
          description: attribute?.description,
          availableUoms: [],
          systemUom: attribute?.systemUom,
        };
        this.allAttributesForAttributeValue.push(attributeSelected);
      }
    }
  }

  public cancelAddAttributeValueAttribute(): void {
    this.isBeingAddedNewAttributeValueAttribute = false;
  }

  public onAttributeValueAttributeSelected(selectedAttribute: Attribute) {
    this.allAttributesForAttributeValue = [];
    if (selectedAttribute) {
      this.isBeingAddedNewAttributeValueAttribute = false;
      const processCalculatorAttributeValue: ProcessProductAttributeValues = {
        attribute: {
          id: selectedAttribute?.id,
          description: selectedAttribute?.description,
          systemUom: selectedAttribute?.systemUom,
        },
        attributeValue: null,
        attributeValueExpression: '',
        userConversionUom: null,
        sortOrder: null,
      };
      this.addProcessCalculatorAttributeValue(processCalculatorAttributeValue);
    }
  }

  public cancel(): void {
    this.isEdittingCalculatorEvent.emit(false);
  }

  public resetCancel(): void {
    // Reset processCalculatorAttributeValues
    const processCalculatorAttributeValues =
      this.processCalculatorAttributeValues.value;
    processCalculatorAttributeValues.forEach(
      (
        processCalculatorAttributeValue: ProcessProductAttributeValues,
        index: number
      ) => {
        // remove attributes that are not present in lastSavedState
        let isPresentAlready: boolean = false;
        for (const processCalculatorAttributeValue2 of this.lastSavedState
          .processCalculatorAttributeValues) {
          if (
            processCalculatorAttributeValue?.attribute?.id ===
            processCalculatorAttributeValue2?.attribute?.id
          ) {
            isPresentAlready = true;
            break;
          }
        }
        if (!isPresentAlready) {
          this.removeProcessCalculatorAttributeValue(index);
        }

        // update attribute values that were changed
        for (const processCalculatorAttributeValue2 of this.lastSavedState
          .processCalculatorAttributeValues) {
          if (
            processCalculatorAttributeValue?.attribute?.id ===
            processCalculatorAttributeValue2?.attribute?.id
          ) {
            if (
              processCalculatorAttributeValue?.attributeValueExpression !==
              processCalculatorAttributeValue2?.attributeValueExpression
            ) {
              (this.processCalculatorAttributeValues.at(index) as UntypedFormGroup)
                .get('attributeValueExpression')
                .patchValue(
                  processCalculatorAttributeValue2?.attributeValueExpression
                );
            }
          }
        }
      }
    );

    // add attributes that are not present in form but present in lastSavedState
    this.lastSavedState.processCalculatorAttributeValues.forEach(
      (processCalculatorAttributeValue2: ProcessProductAttributeValues) => {
        let isPresentAlready: boolean = false;
        for (const processCalculatorAttributeValue of this
          .processCalculatorAttributeValues.value) {
          if (
            processCalculatorAttributeValue?.attribute?.id ===
            processCalculatorAttributeValue2?.attribute?.id
          ) {
            isPresentAlready = true;
            break;
          }
        }
        if (!isPresentAlready) {
          const processCalculatorAttributeValue: ProcessProductAttributeValues =
            processCalculatorAttributeValue2;
          this.addProcessCalculatorAttributeValue(
            processCalculatorAttributeValue
          );
        }
      }
    );

    // Reset processCalculatorProduct
    this.processCalculatorProductAttributes.forEach(
      (processCalculatorProductAttribute: ProcessAttribute, index: number) => {
        // remove attributes that are not present in lastSavedState
        let isPresentAlready: boolean = false;
        let removeAttributeIndex: number = null;
        this.lastSavedState.processCalculatorProduct.forEach(
          (processCalculatorProduct: ProcessCalculatorProduct) => {
            processCalculatorProduct.processCalculatorProductAttributeValues.forEach(
              (
                processCalculatorProductAttributeValue: ProcessCalculatorConversionAttributeValues
              ) => {
                if (
                  processCalculatorProductAttribute?.id ===
                  processCalculatorProductAttributeValue?.attribute?.id
                ) {
                  isPresentAlready = true;
                }
              }
            );
            if (!isPresentAlready) {
              removeAttributeIndex = index;
            }
          }
        );
        if (removeAttributeIndex != null) {
          this.removeProcessCalculatorProductAttributes(removeAttributeIndex);
        }
      }
    );

    // update attribute values that were changed
    for (const processCalculatorProduct of this.lastSavedState
      .processCalculatorProduct) {
      processCalculatorProduct.processCalculatorProductAttributeValues.forEach(
        (
          processCalculatorProductAttributeValue2: ProcessCalculatorConversionAttributeValues
        ) => {
          this.processCalculatorProduct.controls.forEach(
            (processCalculatorProductControl: UntypedFormGroup) => {
              if (
                processCalculatorProduct?.product ===
                processCalculatorProductControl.get('product').value
              ) {
                (
                  processCalculatorProductControl.get(
                    'processCalculatorProductAttributeValues'
                  ) as UntypedFormArray
                ).controls.forEach(
                  (
                    processCalculatorProductAttributeValueControl: UntypedFormGroup
                  ) => {
                    if (
                      processCalculatorProductAttributeValue2?.attribute?.id ===
                      processCalculatorProductAttributeValueControl
                        .get('attribute')
                        .get('id').value
                    ) {
                      processCalculatorProductAttributeValueControl
                        .get('attributeValueExpression')
                        .patchValue(
                          processCalculatorProductAttributeValue2?.attributeValueExpression
                        );
                    }
                  }
                );
              }
            }
          );
        }
      );
    }

    // add attributes that are not present in form but present in lastSavedState
    this.lastSavedState.processCalculatorProduct.forEach(
      (processCalculatorProduct: ProcessCalculatorProduct) => {
        let isPresentAlready = false;
        for (const processCalculatorProductAttributeValue of processCalculatorProduct.processCalculatorProductAttributeValues) {
          for (const processCalculatorProductControl of this
            .processCalculatorProduct.controls) {
            for (const processCalculatorProductAttributeValueControl of (
              processCalculatorProductControl.get(
                'processCalculatorProductAttributeValues'
              ) as UntypedFormArray
            ).controls) {
              if (
                processCalculatorProductAttributeValue?.attribute?.id ===
                processCalculatorProductAttributeValueControl
                  .get('attribute')
                  .get('id').value
              ) {
                isPresentAlready = true;
              } else {
                isPresentAlready = false;
              }
              if (isPresentAlready) {
                break;
              }
            }
            if (!isPresentAlready) {
              this.addProcessCalculatorProductAttributeValue(
                processCalculatorProductAttributeValue,
                processCalculatorProductControl as UntypedFormGroup
              );
            }
          }
        }
      }
    );

    // Reset processCalculatorConversionType
    this.processCalculatorConversionTypeAttributes.forEach(
      (
        processCalculatorConversionTypeAttribute: ProcessAttribute,
        index: number
      ) => {
        // remove attributes that are not present in lastSavedState
        let isPresentAlready: boolean = false;
        let removeAttributeIndex: number = null;
        this.lastSavedState.processCalculatorProduct.forEach(
          (processCalculatorProduct: ProcessCalculatorProduct) => {
            processCalculatorProduct.processCalculatorProductAttributeValues.forEach(
              (
                processCalculatorProductAttributeValue: ProcessCalculatorConversionAttributeValues
              ) => {
                if (
                  processCalculatorConversionTypeAttribute?.id ===
                  processCalculatorProductAttributeValue?.attribute?.id
                ) {
                  isPresentAlready = true;
                }
              }
            );
            if (!isPresentAlready) {
              removeAttributeIndex = index;
            }
          }
        );
        if (removeAttributeIndex != null) {
          this.removeProcessCalculatorConversionTypeAttributes(
            removeAttributeIndex
          );
        }
      }
    );

    // update attribute values that were changed
    for (const processCalculatorConversionType of this.lastSavedState
      .processCalculatorConversionType) {
      processCalculatorConversionType.processCalculatorConversionAttributeValues.forEach(
        (
          processCalculatorConversionAttributeValue2: ProcessCalculatorConversionAttributeValues
        ) => {
          this.processCalculatorConversionType.controls.forEach(
            (processCalculatorConversionTypeControl: UntypedFormGroup) => {
              if (
                processCalculatorConversionType?.conversionType ===
                processCalculatorConversionTypeControl.get('conversionType')
                  .value
              ) {
                (
                  processCalculatorConversionTypeControl.get(
                    'processCalculatorConversionAttributeValues'
                  ) as UntypedFormArray
                ).controls.forEach(
                  (
                    processCalculatorConversionTypeAttributeValueControl: UntypedFormGroup
                  ) => {
                    if (
                      processCalculatorConversionAttributeValue2?.attribute
                        ?.id ===
                      processCalculatorConversionTypeAttributeValueControl
                        .get('attribute')
                        .get('id').value
                    ) {
                      processCalculatorConversionTypeAttributeValueControl
                        .get('attributeValueExpression')
                        .patchValue(
                          processCalculatorConversionAttributeValue2?.attributeValueExpression
                        );
                    }
                  }
                );
              }
            }
          );
        }
      );
    }

    // add attributes that are not present in form but present in lastSavedState
    this.lastSavedState.processCalculatorConversionType.forEach(
      (processCalculatorConversionType: ProcessConversionTypes) => {
        let isPresentAlready = false;
        for (const processCalculatorConversionAttributeValue of processCalculatorConversionType.processCalculatorConversionAttributeValues) {
          for (const processCalculatorConversionTypeControl of this
            .processCalculatorConversionType.controls) {
            for (const processCalculatorConversionTypeAttributeValueControl of (
              processCalculatorConversionTypeControl.get(
                'processCalculatorConversionAttributeValues'
              ) as UntypedFormArray
            ).controls) {
              if (
                processCalculatorConversionAttributeValue?.attribute?.id ===
                processCalculatorConversionTypeAttributeValueControl
                  .get('attribute')
                  .get('id').value
              ) {
                isPresentAlready = true;
              } else {
                isPresentAlready = false;
              }
              if (isPresentAlready) {
                break;
              }
            }
            if (!isPresentAlready) {
              this.addProcessCalculatorConversionAttributeValue(
                processCalculatorConversionAttributeValue,
                processCalculatorConversionTypeControl as UntypedFormGroup
              );
            }
          }
        }
      }
    );

    this.isEdittingCalculatorEvent.emit(false);
  }

  public save(): void {
    if (this.processCalculatorForm.valid) {
      const _dialogRef = this._dialog.open(ConfirmDialogComponent);
      _dialogRef.afterClosed().subscribe((result) => {
        if (result === 1) {
          this.isEdittingCalculatorEvent.emit(false);
          this.userInputChange.emit();
        }
      });
    } else {
      this.processCalculatorForm.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.unSubscribeAll.next();
    this.unSubscribeAll.unsubscribe();
  }
}
