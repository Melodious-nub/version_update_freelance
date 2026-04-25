import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProductTemplateService } from 'src/app/project/postlogin/product-management/product-template/service/product-template.service';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { AttributeValueModalComponent } from '../../../components/attribute-value-modal/attribute-value-modal.component';
import { CreateDropdownFieldModalComponent } from '../../../components/create-dropdown-field-modal/create-dropdown-field-modal.component';
import { CreateToggleFieldModalComponent } from '../../../components/create-toggle-field-modal/create-toggle-field-modal.component';
import { UsageFormulasModalComponent } from '../../../components/usage-formulas-modal/usage-formulas-modal.component';
import { SortFormArrayPipe } from 'src/app/shared/pipes/sort-formarray-sortorder.pipe';
import { CalculateErrorModalComponent } from 'src/app/project/postlogin/product-management/common-modals/calculate-error-modal/calculate-error-modal.component';
import { SortNamePipe } from '../../../../../../../../../shared/pipes/sort-array-ascending-name.pipe';
import { SortFormArrayPipe as SortFormArrayPipe_1 } from '../../../../../../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgStyle, NgClass } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-product-calculator',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    imports: [
        FormsModule,
        DadyinButtonComponent,
        NgStyle,
        ExtendedModule,
        NgClass,
        ReactiveFormsModule,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatIcon,
        MatTooltip,
        CdkDropList,
        CdkDrag,
        SortFormArrayPipe_1,
        SortNamePipe
    ]
})
export class ProductComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.formulaAutoComplete = false;
  }

  excelView: any[] = [false, false, false, false, false, false];
  // ************* Variable Declarations *************
  allCalculatorMetas = [];
  allAttributes = [];
  allAttributeTypes = [];
  attributeValueExpression: any = '';
  showInputMeta = false;

  @Input() productTemplateCalculator: UntypedFormGroup;
  @Input() templateForm: UntypedFormGroup;
  currentFocusedIndex = null;
  // calculatorTemplateAttributeValues = [];

  colSpace: UntypedFormControl = this.fb.control(25);
  attributeName: UntypedFormControl = new UntypedFormControl();
  attributeType: UntypedFormControl = new UntypedFormControl();
  attributeNameArray: UntypedFormControl[] = [];
  attributeTypeArray: UntypedFormControl[] = [];
  labelTypeAttributeIds: any = [];
  layerWiselabelTypeAttributeIds: any = {};
  currentControl: any = null;
  formulaValue = '';
  description = new UntypedFormControl('', Validators.required);
  attribute;
  formulaAutoComplete = false;
  searchAutoComplete = new UntypedFormControl('');

  constructor(
    public productTemplateService: ProductTemplateService,
    public apiService: ApiService,
    private formsService: FormsService,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    public toastr: ToastrService,
    public sortFormArray: SortFormArrayPipe
  ) { }

  async ngOnInit() {
    if (this.templateProcesses?.controls?.length > 0) {
      if (!this.lastProcessLayerWiseCalculation?.value) {
        this.lastProcessProcessProducts.controls.forEach((element) => {
          this.attributeTypeArray.push(new UntypedFormControl());
          this.attributeNameArray.push(new UntypedFormControl());
        });
      }
    }

    this.templateProcesses.enable();
    // this.calculatorTemplateAttributeValues =    this.productCalculatorTemplateAttributeValues.controls;
    await this.setAttributeType();
    this.settingLabelAttributesIds();
    this.settinglayerWiseLabelAttributesIds();
  }

  ngOnDestroy(): void {
    this.templateProcesses.disable();
  }

  changeView(i) {
    this.excelView[i] = !this.excelView[i];
  }

  drop(event: CdkDragDrop<UntypedFormGroup[]>, arr) {
    moveItemInArray(arr, event.previousIndex, event.currentIndex);

    // Update sortOrder based on the new order
    arr.forEach((control: UntypedFormGroup, index: number) => {
      control.get('sortOrder').setValue(index + 1);
    });
  }

  settingLabelAttributesIds() {
    this.labelTypeAttributeIds = [];
    this.productCalculatorTemplateAttributeValues.value.forEach((element) => {
      if (
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(element.attributeId).attributeTypeId
        )?.description == 'Label'
      ) {
        if (element.attributeValueExpression) {
          let prop = JSON.parse(
            element.attributeValueExpression.replace(/'/g, '"')
          );
          prop.forEach((element) => {
            this.labelTypeAttributeIds.push(Number(element.attributeId));
          });
        }
      }
    });
  }

  settinglayerWiseLabelAttributesIds() {
    this.layerWiselabelTypeAttributeIds = {};
    if (this.lastProcessLayerWiseCalculation?.value == false) {
      this.lastProcessProcessProducts?.controls?.forEach(
        (processProductControl, index) => {
          this.layerWiselabelTypeAttributeIds[
            processProductControl?.value.subProductId + '' + index
          ] = [];

          this.getProcessProductAttributeValues(index).controls.forEach(
            (processProductAttributeControl) => {
              if (
                this.getAttributeTypeObjectById(
                  this.getAttributeObjectById(
                    processProductAttributeControl.value.attributeId
                  ).attributeTypeId
                )?.description == 'Label'
              ) {
                let prop = JSON.parse(
                  processProductAttributeControl.value.attributeValueExpression.replace(
                    /'/g,
                    '"'
                  )
                );
                prop.forEach((element) => {
                  this.layerWiselabelTypeAttributeIds[
                    processProductControl?.value.subProductId + '' + index
                  ].push(Number(element.attributeId));
                });
              }
            }
          );
        }
      );
    }
  }

  setAttributeType() {
    this.attributeName.valueChanges.subscribe((res) => {
      if (res) {
        let attribute = this.apiService.allAttributes.find((el) => {
          return el.description == res;
        });
        if (attribute) {
          this.attributeType.setValue(attribute.attributeTypeId);
          this.attributeType.disable();
        } else {
          this.attributeType.setValue(null);
          this.attributeType.enable();
        }
      } else {
        this.attributeType.setValue(null);
        this.attributeType.enable();
      }
    });
  }

  setAttributeTypeInArray(i) {
    if (this.attributeNameArray[i].value) {
      let attribute = this.apiService.allAttributes.find((el) => {
        return el.description == this.attributeNameArray[i].value;
      });
      if (attribute) {
        this.attributeTypeArray[i].setValue(attribute.attributeTypeId);
        this.attributeTypeArray[i].disable();
      } else {
        this.attributeTypeArray[i].setValue(null);
        this.attributeTypeArray[i].enable();
      }
    } else {
      this.attributeTypeArray[i].setValue(null);
      this.attributeTypeArray[i].enable();
    }
  }

  getFilteredAttributes() {
    if (this.attributeName.value != null) {
      let allIds: any = [];
      this.productCalculatorTemplateAttributeValues.value.forEach((element) => {
        allIds.push(element.attributeId);
      });

      let filteredList: any = this.apiService.allAttributes.filter((el) => {
        if (el?.description) {
          return (
            el?.description
              ?.toUpperCase()
              .includes(this.attributeName.value.toUpperCase()) &&
            !allIds?.includes(el.id)
          );
        } else {
          return false;
        }
      });

      return filteredList;
    } else {
      let allIds: any = [];
      this.productCalculatorTemplateAttributeValues.value.forEach((element) => {
        allIds.push(element.attributeId);
      });

      let filteredList: any = this.apiService.allAttributes.filter((el) => {
        if (el?.id) {
          return !allIds?.includes(el.id);
        } else {
          return false;
        }
      });

      return filteredList;
    }
  }

  checkForAttributePresence(data: any, event: any, i?: any) {
    if (i || i == 0) {
      this.setAttributeTypeInArray(i);
    }
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.description?.toUpperCase() == event.target.value?.toUpperCase();
    });
    if (!attribute) {
      return;
    }
    let allIds: any = [];
    data.forEach((element) => {
      allIds.push(element.attributeId);
    });
    if (allIds.includes(attribute.id)) {
      if (i || i == 0) {
        this.attributeNameArray[i].reset();
      } else {
        this.attributeName.reset();
      }
      this.toastr.error('Attribute Already Added');
      return;
    }
  }

  getFilteredAttributesforLayer(index: any) {
    if (this.attributeNameArray[index].value != null) {
      let allIds: any = [];
      this.getProcessProductAttributeValues(index).value.forEach((element) => {
        allIds.push(element.attributeId);
      });

      let filteredList: any = this.apiService.allAttributes.filter((el) => {
        if (el?.description) {
          return (
            el?.description
              ?.toUpperCase()
              .includes(this.attributeNameArray[index].value.toUpperCase()) &&
            !allIds?.includes(el.id)
          );
        } else {
          return false;
        }
      });

      return filteredList;
    } else {
      let allIds: any = [];
      this.getProcessProductAttributeValues(index).value.forEach((element) => {
        allIds.push(element.attributeId);
      });

      let filteredList: any = this.apiService.allAttributes.filter((el) => {
        if (el?.id) {
          return !allIds?.includes(el.id);
        } else {
          return false;
        }
      });

      return filteredList;
    }
  }

  get productCalculatorTemplateAttributeValues() {
    return this.productTemplateCalculator.get(
      'productCalculatorTemplateAttributeValues'
    ) as UntypedFormArray;
  }
  get packageCalculatorTemplates() {
    return this.productTemplateCalculator.get(
      'packageCalculatorTemplates'
    ) as UntypedFormArray;
  }

  toggleSaveInput() {
    this.showInputMeta = !this.showInputMeta;
    this.productTemplateCalculator.get('metaCalculatorId').setValue(null);
    this.apiService.finalSave = true;
  }

  async onSelectCalculatorMeta() {
    if (this.productTemplateCalculator.get('metaCalculatorId').value == 'NEW') {
      this.showInputMeta = true;
      this.productTemplateCalculator.get('description').setValue('');
      this.labelTypeAttributeIds = [];
      this.productCalculatorTemplateAttributeValues.clear();
      this.apiService.finalSave = false;
      return;
    }
    if (
      this.productTemplateCalculator.get('metaCalculatorId').value == 'SAVEAS'
    ) {
      this.showInputMeta = true;
      this.productTemplateCalculator.get('description').setValue('');
      this.apiService.finalSave = false;
      return;
    }
    // this.showInputMeta=true
    let id = Number(
      this.productTemplateCalculator.get('metaCalculatorId').value
    );
    this.productCalculatorTemplateAttributeValues.clear();
    this.labelTypeAttributeIds = [];
    let calculatorMetaDetails: any = this.apiService.allCalculatorMetas?.find(
      (el) => {
        return Number(id) === Number(el.id);
      }
    );
    this.productTemplateCalculator
      .get('metaCalculatorId')
      .setValue(calculatorMetaDetails?.id);
    this.productTemplateCalculator
      .get('description')
      .setValue(calculatorMetaDetails?.description);
    calculatorMetaDetails?.calculatorAttributeValues?.forEach((element) => {
      if (
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(element.attributeId).attributeTypeId
        )?.description == 'Label'
      ) {
        if (element.attributeValueExpression) {
          let prop = JSON.parse(
            element.attributeValueExpression.replace(/'/g, '"')
          );
          prop.forEach((element) => {
            this.labelTypeAttributeIds.push(Number(element.attributeId));
          });
        }
      }
      this.productCalculatorTemplateAttributeValues.push(
        this.formsService.createProductCalculatorTemplateAttributeForm()
      );
    });
    this.productCalculatorTemplateAttributeValues?.patchValue(
      calculatorMetaDetails?.calculatorAttributeValues
    );
    this.productTemplateCalculator.get('id').setValue(null);
    this.packageCalculatorTemplates.controls.forEach((pck) => {
      pck.get('id').setValue(null);
      const packageCalculatorTemplateAttributeValues = pck.get(
        'packageCalculatorTemplateAttributeValues'
      ) as UntypedFormArray;
      packageCalculatorTemplateAttributeValues.controls.forEach(
        (pcKattribute) => {
          pcKattribute.get('id').setValue(null);
        }
      );
    });

    this.settingLabelAttributesIds();
  }

  async postCalculatorMeta() {
    let existingMeta = this.apiService.allCalculatorMetas.find(
      (item) =>
        item.description?.toUpperCase() == this.description.value?.toUpperCase()
    );
    if (existingMeta) {
      this.toastr.error('Same name meta already exist');
      // Reset finalSave if validation fails
      this.apiService.finalSave = true;
      return;
    }
    if (this.productCalculatorTemplateAttributeValues.controls?.length == 0) {
      this.toastr.error('Please add atleast one attribute');
      // Reset finalSave if validation fails
      this.apiService.finalSave = true;
      return;
    }
    this.productTemplateCalculator.get('id').setValue(null);
    let data = this.productTemplateCalculator.value;
    data = this.apiService.cleanDataId(data);
    try {
      let newData: any = {
        calculatorAttributeValues:
          data.productCalculatorTemplateAttributeValues,
        id: null,
        description: this.description.value,
        packageType: 'UNIT',
      };
      const res: any = await this.apiService
        .addCalculatorMeta(newData)
        .toPromise();
      this.apiService.Get_All_Calculator_Metas_Non_Cache();
      this.showInputMeta = false;
      this.productTemplateCalculator.get('metaCalculatorId').setValue(res.id);
      this.productTemplateCalculator
        .get('description')
        .setValue(res?.description);
      this.apiService.finalSave = true;
    } catch (err) {
      // Reset finalSave on error so UI is not stuck
      this.apiService.finalSave = true;
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }
  async updateCalculatorMeta() {
    let data = this.productTemplateCalculator.getRawValue();
    let newData: any = {
      calculatorAttributeValues: data.productCalculatorTemplateAttributeValues,
      id: data.metaCalculatorId,
      description: data?.description,
      packageType: 'UNIT',
    };
    try {
      const res: any = await this.apiService
        .addCalculatorMeta(newData)
        .toPromise();
      this.toastr.success('Updated Calculator Meta');
    } catch (err) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }
  getPackageAttributeValues(i) {
    return this.packageCalculatorTemplates.controls[i].get(
      'packageCalculatorTemplateAttributeValues'
    ) as UntypedFormArray;
  }

  async addAttribute(type: any, index?: any) {
    if (index || index == 0) {
      let attribute = this.apiService.allAttributes.find((el) => {
        return el.description === this.attributeNameArray[index].value;
      });

      let attributeType = this.apiService.allAttributesTypes.find((el) => {
        return Number(el.id) == Number(this.attributeTypeArray[index].value);
      });

      if (!attribute) {
        if (attributeType?.description === 'Dropdown') {
          this.dialog
            .open(CreateDropdownFieldModalComponent, {
              data: {
                attributeName: this.attributeNameArray[index],
                attributeType: attributeType,
              },
            })
            .afterClosed()
            .subscribe(async (res) => {
              if (res) {
                this.attributeValueExpression = res.attributeValueExpression;
                this.attributeNameArray[index].patchValue(res.attributeName);
                let attributeTempData = {
                  attributeValueExpression: this.attributeValueExpression,
                  attributeTypeId: attributeType.id,
                  description: this.attributeNameArray[index].value,
                  productFlag: false,
                  systemOnly: false,
                };
                let response = await this.productTemplateService
                  .addAttribute(attributeTempData)
                  .toPromise();
                if (!response) {
                  this.toastr.error('Some Error Occurred');
                  return;
                }

                this.apiService.allAttributes.push(response);
                this.addNewAttributeType(response, attributeType, type, index);
                return;
              }
            });
        } else if (attributeType?.description === 'Toggle') {
          this.dialog
            .open(CreateToggleFieldModalComponent, {
              data: {
                attributeName: this.attributeNameArray[index],
                attributeType: attributeType,
              },
            })
            .afterClosed()
            .subscribe(async (res) => {
              if (res) {
                this.attributeValueExpression = res.attributeValueExpression;
                let attributeTempData = {
                  attributeValueExpression: this.attributeValueExpression,
                  attributeTypeId: attributeType.id,
                  description: this.attributeNameArray[index].value,
                  productFlag: false,
                  systemOnly: false,
                };
                let response: any = await this.productTemplateService
                  .addAttribute(attributeTempData)
                  .toPromise();
                if (!response) {
                  this.toastr.error('Unable to add attribute');
                  return;
                }

                this.apiService.allAttributes.push(response);
                this.attributeNameArray[index].patchValue(res.attributeName);
                this.addNewAttributeType(response, attributeType, type, index);
                return;
              }
            });
        } else {
          let attributeTempData = {
            attributeTypeId: attributeType.id,
            description: this.attributeNameArray[index].value,
            productFlag: false,
            systemOnly: false,
          };
          let response: any = await this.productTemplateService
            .addAttribute(attributeTempData)
            .toPromise();
          if (!response) {
            this.toastr.error('Unable to add attribute');
            return;
          }

          this.apiService.allAttributes.push(response);
          this.addNewAttributeType(response, attributeType, type, index);
        }
      } else {
        let data = {
          attributeId: attribute.id,
          attributeName: attribute.description,
          attributeTypeDetails: attributeType,
          attributeValue: null,
          attributeValueExpression: attribute.attributeValueExpression,
          calculationOrder: 1,
          colSpace: +this.colSpace.value,
          id: null, // ????
          isHidden: true,
          isReadOnly: true,
          sortOrder: 0,
          userConversionUom: attributeType?.defaultUom?.description,
        };
        let form =
          this.formsService.createProductCalculatorTemplateAttributeForm();

        if (type == 'process') {
          form.patchValue(data);
          form
            .get('sortOrder')
            .setValue(
              this.getProcessProductAttributeValues(index)?.controls.length + 1
            );
          this.getProcessProductAttributeValues(index).push(form);
        } else {
          form.patchValue(data);
          form
            .get('sortOrder')
            .setValue(
              this.productCalculatorTemplateAttributeValues?.controls.length + 1
            );
          this.productCalculatorTemplateAttributeValues.push(form);
        }

        this.attributeTypeArray[index].setValue(null);
        this.attributeNameArray[index].reset();
        this.colSpace.setValue(25);
      }
    } else {
      let attribute = this.apiService.allAttributes.find((el) => {
        return el.description === this.attributeName.value;
      });

      let attributeType = this.apiService.allAttributesTypes.find((el) => {
        return Number(el.id) == Number(this.attributeType.value);
      });

      if (!attribute) {
        if (attributeType?.description === 'Dropdown') {
          this.dialog
            .open(CreateDropdownFieldModalComponent, {
              data: {
                attributeName: this.attributeName,
                attributeType: attributeType,
              },
            })
            .afterClosed()
            .subscribe(async (res) => {
              if (res) {
                this.attributeValueExpression = res.attributeValueExpression;
                this.attributeName.patchValue(res.attributeName);
                let attributeTempData = {
                  attributeValueExpression: this.attributeValueExpression,
                  attributeTypeId: attributeType.id,
                  description: this.attributeName.value,
                  productFlag: false,
                  systemOnly: false,
                };
                let response = await this.productTemplateService
                  .addAttribute(attributeTempData)
                  .toPromise();
                if (!response) {
                  this.toastr.error('Some Error Occurred');
                  return;
                }

                this.apiService.allAttributes.push(response);
                this.addNewAttributeType(response, attributeType, type, index);
                return;
              }
            });
        } else if (attributeType?.description === 'Toggle') {
          this.dialog
            .open(CreateToggleFieldModalComponent, {
              data: {
                attributeName: this.attributeName,
                attributeType: attributeType,
              },
            })
            .afterClosed()
            .subscribe(async (res) => {
              if (res) {
                this.attributeValueExpression = res.attributeValueExpression;
                let attributeTempData = {
                  attributeValueExpression: this.attributeValueExpression,
                  attributeTypeId: attributeType.id,
                  description: this.attributeName.value,
                  productFlag: false,
                  systemOnly: false,
                };
                let response: any = await this.productTemplateService
                  .addAttribute(attributeTempData)
                  .toPromise();
                if (!response) {
                  this.toastr.error('Unable to add attribute');
                  return;
                }

                this.apiService.allAttributes.push(response);
                this.attributeName.patchValue(res.attributeName);
                this.addNewAttributeType(response, attributeType, type, index);
                return;
              }
            });
        } else {
          let attributeTempData = {
            attributeTypeId: attributeType.id,
            description: this.attributeName.value,
            productFlag: false,
            systemOnly: false,
          };
          let response: any = await this.productTemplateService
            .addAttribute(attributeTempData)
            .toPromise();
          if (!response) {
            this.toastr.error('Unable to add attribute');
            return;
          }

          this.apiService.allAttributes.push(response);
          this.addNewAttributeType(response, attributeType, type, index);
        }
      } else {
        let data = {
          attributeId: attribute.id,
          attributeName: attribute.description,
          attributeTypeDetails: attributeType,
          attributeValue: null,
          attributeValueExpression: attribute.attributeValueExpression,
          calculationOrder: 1,
          colSpace: +this.colSpace.value,
          id: null, // ????
          isHidden: true,
          isReadOnly: true,
          sortOrder: 0,
          userConversionUom: attributeType?.defaultUom?.description,
        };
        let form =
          this.formsService.createProductCalculatorTemplateAttributeForm();
        if (type == 'process') {
          form.patchValue(data);
          form
            .get('sortOrder')
            .setValue(
              this.getProcessProductAttributeValues(index)?.controls.length + 1
            );
          this.getProcessProductAttributeValues(index).push(form);
        } else {
          form.patchValue(data);
          form
            .get('sortOrder')
            .setValue(
              this.productCalculatorTemplateAttributeValues?.controls.length + 1
            );
          this.productCalculatorTemplateAttributeValues.push(form);
        }

        this.attributeType.setValue(null);
        this.attributeName.reset();
        this.colSpace.setValue(25);
      }
    }
  }

  addNewAttributeType(
    response: any,
    attributeType: any,
    type: any,
    index: any
  ) {
    if (index || index == 0) {
      let data = {
        attributeId: response.id,
        attributeName: this.attributeNameArray[index].value,
        attributeValue: null,
        attributeValueExpression: this.attributeValueExpression ?? null,
        calculationOrder: 1,
        colSpace: this.colSpace.value,
        id: null,
        isHidden: true,
        isReadOnly: true,
        sortOrder: 0,
        userConversionUom: attributeType?.defaultUom?.description,
      };
      let form =
        this.formsService.createProductCalculatorTemplateAttributeForm();
      if (type == 'process') {
        form.patchValue(data);
        form
          .get('sortOrder')
          .setValue(
            this.getProcessProductAttributeValues(index)?.controls.length + 1
          );
        this.getProcessProductAttributeValues(index).push(form);
      } else {
        form.patchValue(data);
        form
          .get('sortOrder')
          .setValue(
            this.productCalculatorTemplateAttributeValues?.controls.length + 1
          );
        this.productCalculatorTemplateAttributeValues.push(form);
      }

      this.attributeTypeArray[index].setValue(null);
      this.attributeNameArray[index].reset();
      this.colSpace.setValue(25);
    } else {
      let data = {
        attributeId: response.id,
        attributeName: response?.description,
        attributeValue: null,
        attributeValueExpression: this.attributeValueExpression ?? null,
        calculationOrder: 1,
        colSpace: this.colSpace.value,
        id: null,
        isHidden: true,
        isReadOnly: true,
        sortOrder: 0,
        userConversionUom: attributeType?.defaultUom?.description,
      };
      let form =
        this.formsService.createProductCalculatorTemplateAttributeForm();
      if (type == 'process') {
        form.patchValue(data);
        form
          .get('sortOrder')
          .setValue(
            this.getProcessProductAttributeValues(index)?.controls.length + 1
          );
        this.getProcessProductAttributeValues(index).push(form);
      } else {
        form.patchValue(data);
        form
          .get('sortOrder')
          .setValue(
            this.productCalculatorTemplateAttributeValues?.controls.length + 1
          );
        this.productCalculatorTemplateAttributeValues.push(form);
      }

      this.attributeType.setValue(null);
      this.attributeName.reset();
      this.colSpace.setValue(25);
    }
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
      return selectedAttribute;
    } else {
      return;
    }
  }

  removeProductCalculatorAttribute(i) {
    this.productCalculatorTemplateAttributeValues.removeAt(i);
  }

  removeProcessProductAttribute(i, j) {
    this.getProcessProductAttributeValues(i).removeAt(j);
  }

  getArray(str: String) {
    if (!str) {
      return [];
    }
    let prop = JSON.parse(str?.replace(/'/g, '"'));
    return prop;
  }

  getArrayIds(str: String) {
    if (str) {
      let prop = JSON.parse(str.replace(/'/g, '"'));
      let propids: any = [];
      if (Array.isArray(prop)) {
        prop.forEach((element) => {
          propids.push(Number(element.attributeId));
        });
      }

      return propids;
    } else {
      return [];
    }
  }

  async onDragClickAttribute(i: any) {
    let control = this.productCalculatorTemplateAttributeValues.controls[i];
    let index = this.productCalculatorTemplateAttributeValues.value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    if (index != -1) {
      let labelExpressionControl =
        this.productCalculatorTemplateAttributeValues.controls[index].get(
          'attributeValueExpression'
        );
      let attributeValueExpression: any = labelExpressionControl.value;
      let data: any = '';
      let resp: any;
      if (attributeValueExpression) {
        resp = JSON.parse(attributeValueExpression);

        resp.push({ attributeId: control.value.attributeId });
        data = JSON.stringify(resp);
      } else {
        data = JSON.stringify([{ attributeId: control.value.attributeId }]);
      }
      let sortOrder =
        this.productCalculatorTemplateAttributeValues.controls[index].get(
          'sortOrder'
        ).value +
        resp?.length / 10;
      control.get('sortOrder').setValue(sortOrder);
      this.labelTypeAttributeIds.push(control.value.attributeId);
      labelExpressionControl.setValue(data);
    } else {
    }
  }
  async onDragRemoveAttribute(i: any, attr: UntypedFormGroup) {
    let labelExpressionControl =
      this.productCalculatorTemplateAttributeValues.controls[i].get(
        'attributeValueExpression'
      );
    let attributeValueExpression: any = labelExpressionControl.value;
    let resp: any = JSON.parse(attributeValueExpression);
    let index = this.labelTypeAttributeIds.findIndex(
      (id: any) => id == attr.get('attributeId').value
    );
    let index2 = resp.findIndex(
      (item: any) => item.attributeId == attr.get('attributeId').value
    );
    if (index2 || index2 == 0) {
      resp.splice(index2, 1);
    }
    let data: any = null;
    if (resp?.length > 0) {
      data = JSON.stringify(resp);
    } else {
      data = null;
    }
    if (index != -1) {
      this.labelTypeAttributeIds.splice(index, 1);
    }
    labelExpressionControl.setValue(data);
  }

  async onDragClickProcessAttribute(i: any, j: any, subProductId: any) {
    let control = this.getProcessProductAttributeValues(i).controls[j];
    let index = this.getProcessProductAttributeValues(i).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    if (index != -1) {
      let labelExpressionControl = this.getProcessProductAttributeValues(
        i
      ).controls[index].get('attributeValueExpression');
      let attributeValueExpression: any = labelExpressionControl.value;
      let data: any = '';
      let resp: any;
      if (attributeValueExpression) {
        resp = JSON.parse(attributeValueExpression);

        resp.push({ attributeId: control.value.attributeId });
        data = JSON.stringify(resp);
      } else {
        data = JSON.stringify([{ attributeId: control.value.attributeId }]);
      }
      this.layerWiselabelTypeAttributeIds[subProductId + '' + i].push(
        control.value.attributeId
      );
      labelExpressionControl.setValue(data);
      let sortOrder =
        this.getProcessProductAttributeValues(i).controls[index].get(
          'sortOrder'
        ).value +
        resp?.length / 10;
      control.get('sortOrder').setValue(sortOrder);
    } else {
    }
  }

  async onDragRemoveProcessAttribute(
    i: any,
    j: any,
    attr: UntypedFormGroup,
    subProductId: any
  ) {
    let labelExpressionControl = this.getProcessProductAttributeValues(
      i
    ).controls[j].get('attributeValueExpression');
    let attributeValueExpression: any = labelExpressionControl.value;
    let resp: any = JSON.parse(attributeValueExpression);
    let index = this.layerWiselabelTypeAttributeIds[
      subProductId + '' + i
    ].findIndex((id: any) => id == attr.get('attributeId').value);
    let index2 = resp.findIndex(
      (item: any) => item.attributeId == attr.get('attributeId').value
    );
    if (index2 || index2 == 0) {
      resp.splice(index2, 1);
    }
    let data: any = null;
    if (resp?.length > 0) {
      data = JSON.stringify(resp);
    } else {
      data = null;
    }
    if (index != -1) {
      this.layerWiselabelTypeAttributeIds[subProductId + '' + i].splice(
        index,
        1
      );
    }
    labelExpressionControl.setValue(data);
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

  filterAttributeForLayerWiseLabel(
    attributes: UntypedFormArray,
    subProductId: any,
    i: any
  ) {
    return attributes.controls
      .filter((control) => {
        return this.layerWiselabelTypeAttributeIds[
          subProductId + '' + i
        ]?.includes(control.get('attributeId').value);
      })
      .sort(
        (a, b) =>
          this.layerWiselabelTypeAttributeIds[subProductId + '' + i].indexOf(
            a.get('attributeId').value
          ) -
          this.layerWiselabelTypeAttributeIds[subProductId + '' + i].indexOf(
            b.get('attributeId').value
          )
      );
  }

  openAttributeDialog() {
    let dialogRef = this.dialog.open(AttributeValueModalComponent, {
      data: {
        elementdata: this.productCalculatorTemplateAttributeValues.controls,
        labelTypeAttributeIds: this.labelTypeAttributeIds,
      },
    });
    this.setLabelInsideArrangement();
    dialogRef.afterClosed().subscribe((result) => {
      let k = 1;
      this.productCalculatorTemplateAttributeValues.controls.forEach(
        (element, i) => {
          if (
            !this.labelTypeAttributeIds.includes(
              element.get('attributeId').value
            )
          ) {
            element.get('sortOrder').setValue(k);
            k++;
          }
        }
      );
      this.setLabelInsideArrangement();
    });
  }

  setLabelInsideArrangement() {
    let index = this.productCalculatorTemplateAttributeValues.value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.productCalculatorTemplateAttributeValues.controls.forEach(
      (element, i) => {
        if (
          this.labelTypeAttributeIds.includes(element.get('attributeId').value)
        ) {
          element
            .get('sortOrder')
            .setValue(
              this.productCalculatorTemplateAttributeValues.controls[index].get(
                'sortOrder'
              ).value +
              (i + 1) / 10
            );
        }
      }
    );
  }

  setLayerLabelInsideArrangement(i) {
    let index = this.getProcessProductAttributeValues(i).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.getProcessProductAttributeValues(i).controls.forEach((element, j) => {
      if (
        this.layerWiselabelTypeAttributeIds[
          this.lastProcessProcessProducts?.controls[i]?.value.subProductId +
          '' +
          i
        ].includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.getProcessProductAttributeValues(i).controls[index].get(
              'sortOrder'
            ).value +
            (j + 1) / 10
          );
      }
    });
  }

  openLayerAttributeDialog(i) {
    let dialogRef = this.dialog.open(AttributeValueModalComponent, {
      data: {
        elementdata: this.getProcessProductAttributeValues(i).controls,
        allAttributes: this.apiService.allAttributes,
        labelTypeAttributeIds:
          this.layerWiselabelTypeAttributeIds[
          this.lastProcessProcessProducts?.controls[i]?.value.subProductId +
          '' +
          i
          ],
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      let k = 1;
      this.getProcessProductAttributeValues(i).controls.forEach(
        (element, j) => {
          if (
            !this.layerWiselabelTypeAttributeIds[
              this.lastProcessProcessProducts?.controls[i]?.value.subProductId +
              '' +
              i
            ].includes(element.get('attributeId').value)
          ) {
            element.get('sortOrder').setValue(k);
            k++;
          }
        }
      );
      this.setLayerLabelInsideArrangement(i);
    });
  }

  setLayerWiseLabelInsideArrangement(i: any) {
    let index = this.getProcessProductAttributeValues(i).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.getProcessProductAttributeValues(i).controls.forEach((element, i) => {
      if (
        this.layerWiselabelTypeAttributeIds[
          this.lastProcessProcessProducts?.controls[i]?.value.subProductId +
          '' +
          i
        ].includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.getProcessProductAttributeValues(index).get('sortOrder')
              .value +
            (i + 1) / 10
          );
      }
    });
  }

  openDialog() {
    this.dialog.open(UsageFormulasModalComponent, {
      data: {
        animal: 'panda',
      },
    });
  }

  get templateProcessType() {
    return this.templateForm.get('templateProcessType') as UntypedFormControl;
  }

  toggleVisibility(item: any, param: any) {
    item.get('isHidden').setValue(param);
  }

  get templateProcesses() {
    return this.templateForm.get('templateProcesses') as UntypedFormArray;
  }

  get lastProcessLayerWiseCalculation() {
    return this.templateProcesses.controls[
      this.templateProcesses?.controls?.length - 1
    ]
      ?.get('process')
      ?.get('isLayerPercentageCalculated');
  }

  get lastProcessProcessProducts() {
    return this.templateProcesses.controls[
      this.templateProcesses?.controls?.length - 1
    ]
      ?.get('process')
      .get('processProducts') as UntypedFormArray;
  }

  getProcessProductAttributeValues(i) {
    return this.lastProcessProcessProducts.controls[i].get(
      'processProductAttributeValues'
    ) as UntypedFormArray;
  }

  getNameOfProduct(subProductId: any) {
    let product = this.apiService.allproductsListForProcess.find(
      (item) => item.id == subProductId
    );
    return product?.description ?? '';
  }

  testCalculatorModal() {
    // Pass the entire template form so the modal has access to all necessary data
    const templateFormData = this.templateForm.getRawValue();
    let dialogRef = this.dialog.open(CalculateErrorModalComponent, {
      data: {
        productTemplateCalculator: templateFormData,
        labelTypeAttributeIds: this.labelTypeAttributeIds || [],
        type: 'ProductCalculator',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {

    });
  }

  openFormulaAutoComplete(event: any) {
    if (!this.currentControl) {
      this.toastr.error('Select any Calculator Attribute to focus');
      return;
    }
    this.currentControl.setValue(this.formulaValue);
    let inpValue: string = event.target.value;
    if (inpValue.endsWith('.')) {
      this.formulaAutoComplete = true;
    }
    if (this.formulaAutoComplete) {
      this.searchAutoComplete.setValue(inpValue.split('.').pop());
    }
  }

  selectFormulaAttribute(attribute: any) {
    const formulaKey: any = this.removeSpecialCharacters(attribute);
    this.formulaAutoComplete = false;
    const currentValue = this.currentControl.value;
    const lastDotIndex = currentValue.lastIndexOf('.');
    const newValue = currentValue.substring(0, lastDotIndex + 1) + formulaKey;
    this.currentControl.setValue(newValue);
    this.formulaValue = newValue;
  }

  removeSpecialCharacters(input: string): string {
    // Define the characters to be removed
    const charactersToRemove = ['(', ')', '{', '}', ' ', '@', '#', '$'];

    // Remove the special characters
    let result = input;
    charactersToRemove.forEach((character) => {
      result = result.replace(new RegExp(`\\${character}`, 'g'), '');
    });

    return result;
  }

  getFilteredAutoCompleteAttributes() {
    let filteredList: any =
      this.productCalculatorTemplateAttributeValues.value.filter((el) => {
        if (this.getAttributeObjectById(el?.attributeId)?.description) {
          return this.getAttributeObjectById(el?.attributeId)
            ?.description?.toUpperCase()
            .includes(this.searchAutoComplete.value?.toUpperCase());
        } else {
          return false;
        }
      });
    return filteredList;
  }

  getTemplateCost() {
    return (
      (this.templateForm.get('templateCost').get('attributeValue').value ??
        '') +
      ' ' +
      (this.templateForm.get('templateCost').get('userConversionUom').value ??
        '')
    );
  }

  getTemplateDensity() {
    return (
      (this.templateForm.get('templateDensity').get('attributeValue').value ??
        '') +
      ' ' +
      (this.templateForm.get('templateDensity').get('userConversionUom')
        .value ?? '')
    );
  }

  editDropdownAttribute(item, index) {
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.id === item.value.attributeId;
    });
    let attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    const attributeControl = new UntypedFormControl(attribute.description);

    // Get the current value from the form control, fallback to original attribute value
    const currentAttributeValueExpression = item.get('attributeValueExpression').value || attribute.attributeValueExpression;

    this.dialog
      .open(CreateDropdownFieldModalComponent, {
        data: {
          attributeName: attributeControl,
          attributeType: attributeType,
          attributeValueExpression: currentAttributeValueExpression,
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

  trackByFn(index, item) {
    return index;
  }

  onClickLabel(attributeName: any, reference: any, type: any) {
    if (!this.currentControl) {
      this.toastr.error('Select any Calculator Attribute to focus');
      return;
    }
    let access = '';
    if (this.currentFocusedIndex.includes(type)) {
      access = access + (this.removeSpecialCharacters(attributeName) ?? '');
    } else {
      access =
        access +
        reference +
        (this.removeSpecialCharacters(attributeName) ?? '');
    }

    this.currentControl.setValue((this.currentControl.value ?? '') + access);
    this.formulaValue = this.currentControl.value;
  }

  formula(item: UntypedFormControl, i) {
    this.currentControl = item;
    this.formulaValue = item.value;
    this.currentFocusedIndex = i;
  }

  resetFormula() {
    this.formulaValue = '';
  }

  preventFocusChange(event: MouseEvent) {
    event.preventDefault(); // Prevents focus change
  }
}
