import {
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ProductTemplateService } from 'src/app/project/postlogin/product-management/product-template/service/product-template.service';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { CreateDropdownFieldModalComponent } from '../../../components/create-dropdown-field-modal/create-dropdown-field-modal.component';
import { CreateToggleFieldModalComponent } from '../../../components/create-toggle-field-modal/create-toggle-field-modal.component';
import { UsageFormulasModalComponent } from '../../../components/usage-formulas-modal/usage-formulas-modal.component';
import { AttributeValueModalComponent } from '../../../components/attribute-value-modal/attribute-value-modal.component';
import { CalculateErrorModalComponent } from 'src/app/project/postlogin/product-management/common-modals/calculate-error-modal/calculate-error-modal.component';
import { SortFormArrayPipe } from '../../../../../../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinButtonComponent } from '../../../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgStyle, NgClass } from '@angular/common';

@Component({
    selector: 'app-package',
    templateUrl: './package.component.html',
    styleUrls: ['./package.component.scss'],
    standalone: true,
    imports: [
    NgStyle,
    ExtendedModule,
    FormsModule,
    NgClass,
    DadyinButtonComponent,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatIcon,
    MatTooltip,
    CdkDropList,
    CdkDrag,
    SortFormArrayPipe
],
})
export class PackageComponent implements OnInit {
  excelView = [false, false, false, false, false, false, false, false];
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.formulaAutoComplete = false;
  }

  currentFocusedIndex = null;
  // ************* Variable Declarations *************
  allCalculatorMetas = [];
  allAttributes = [];
  allAttributeTypes = [];
  packages: string[] = ['BOX', 'BALE', 'PALLET', 'BUNDLE'];
  attributeValueExpression: any = '';
  index1 = 0;
  showInputMetas: any[] = [];
  currentControl: any = null;
  formulaValue = '';

  @Input() productTemplateCalculator: UntypedFormGroup;
  @Input() templateForm: UntypedFormGroup;
  // colSpace: FormControl = this.fb.control(25);
  // attributeName: FormControl = this.fb.control('');
  // attributeType: FormControl = this.fb.control(null);
  labelTypeAttributeIds: any = [];
  formulaAutoComplete = false;
  searchAutoComplete = new UntypedFormControl('');
  constructor(
    public productTemplateService: ProductTemplateService,
    public apiService: ApiService,
    private formsService: FormsService,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.settingLabelAttributesIds();
  }

  settingLabelAttributesIds() {
    this.labelTypeAttributeIds = [];
    this.packageCalculatorTemplates.value.forEach((pkg, index) => {
      this.showInputMetas.push(false);
      this.labelTypeAttributeIds[index] = [];
      pkg.packageCalculatorTemplateAttributeValues.forEach((element) => {
        if (
          this.getAttributeTypeObjectById(
            this.getAttributeObjectById(element.attributeId).attributeTypeId
          )?.description == 'Label'
        ) {
          if (element.attributeValueExpression) {
            let prop = JSON.parse(
              element.attributeValueExpression?.replace(/'/g, '"')
            );
            prop.forEach((element) => {
              this.labelTypeAttributeIds[index].push(
                Number(element.attributeId)
              );
            });
          }
        }
      });
    });
  }

  getColSpace(i) {
    return this.packageCalculatorTemplates.controls[i].get('colSpace');
  }

  getAttributeName(i) {
    return this.packageCalculatorTemplates.controls[i].get('attributeName');
  }

  getAttributeType(i) {
    return this.packageCalculatorTemplates.controls[i].get('attributeType');
  }

  setAttributeType(i) {
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.description == this.getAttributeName(i).value;
    });
    if (attribute) {
      this.getAttributeType(i).setValue(attribute.attributeTypeId);
      this.getAttributeType(i).disable();
    } else {
      this.getAttributeType(i).setValue(null);
      this.getAttributeType(i).enable();
    }
  }

  get packageCalculatorTemplates() {
    return this.productTemplateCalculator.get(
      'packageCalculatorTemplates'
    ) as UntypedFormArray;
  }

  async addAttribute(i: any) {
    if (!this.packageCalculatorTemplates.controls[i].get('packageType').value) {
      this.toastr.error('Please select Package Type');
      return;
    }
    if (
      !this.packageCalculatorTemplates.controls[i].get('metaCalculatorId').value
    ) {
      this.toastr.error('Please select Calculator');
      return;
    }
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.description === this.getAttributeName(i).value;
    });

    let attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == Number(this.getAttributeType(i).value);
    });

    if (!attribute) {
      if (attributeType?.description === 'Dropdown') {
        this.dialog
          .open(CreateDropdownFieldModalComponent, {
            data: {
              attributeName: this.getAttributeName(i),
              attributeType: attributeType,
            },
          })
          .afterClosed()
          .subscribe(async (res) => {
            if (res) {
              this.attributeValueExpression = res.attributeValueExpression;
              this.getAttributeName(i).patchValue(res.attributeName);
              let attributeTempData = {
                attributeValueExpression: this.attributeValueExpression,
                attributeTypeId: attributeType.id,
                description: this.getAttributeName(i).value,
                productFlag: false,
                systemOnly: false,
              };
              let response = await this.productTemplateService
                .addAttribute(attributeTempData)
                .toPromise();
              if (!response) {
                this.toastr.error('Unable to add attribute');
                return;
              }

              this.apiService.allAttributes.push(response);
              this.addNewAttributeType(response, attributeType, i);
              return;
            }
          });
      } else if (attributeType?.description === 'Toggle') {
        this.dialog
          .open(CreateToggleFieldModalComponent, {
            data: {
              attributeName: this.getAttributeName(i),
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
                description: this.getAttributeName(i).value,
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
              this.getAttributeName(i).patchValue(res.attributeName);
              this.addNewAttributeType(response, attributeType, i);
              return;
            }
          });
      } else {
        let attributeTempData = {
          attributeTypeId: attributeType.id,
          description: this.getAttributeName(i).value,
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
        this.addNewAttributeType(response, attributeType, i);
      }
    } else {
      let data = {
        attributeId: attribute.id,
        attributeName: attribute.description,
        attributeTypeDetails: attributeType,
        attributeValue: null,
        attributeValueExpression: attribute.attributeValueExpression,
        calculationOrder: 1,
        colSpace: +this.getColSpace(i).value,
        id: null, // ????
        isHidden: true,
        isReadOnly: true,
        sortOrder: 0,
        userConversionUom: attributeType?.defaultUom?.description,
      };
      let form =
        this.formsService.createProductCalculatorTemplateAttributeForm();
      form.patchValue(data);
      form
        .get('sortOrder')
        .setValue(this.getPackageAttributeValues(i)?.controls.length + 1);
      this.getPackageAttributeValues(i).push(form);
      this.getAttributeType(i).setValue(null);
      this.getAttributeName(i).reset();
      this.getColSpace(i).setValue(25);
    }
  }

  addNewAttributeType(response: any, attributeType: any, i: any) {
    let data = {
      attributeId: response.id,
      attributeName: response.description,
      attributeValue: null,
      attributeValueExpression: this.attributeValueExpression ?? null,
      calculationOrder: 1,
      colSpace: +this.getColSpace(i).value,
      id: null,
      isHidden: true,
      isReadOnly: true,
      sortOrder: 0,
      userConversionUom: attributeType?.defaultUom?.description,
    };

    let form = this.formsService.createProductCalculatorTemplateAttributeForm();
    form.patchValue(data);
    form
      .get('sortOrder')
      .setValue(this.getPackageAttributeValues(i)?.controls.length + 1);
    this.getPackageAttributeValues(i).push(form);
    this.getAttributeType(i).setValue(null);
    this.getAttributeName(i).reset();
    this.getColSpace(i).setValue(25);
  }

  removePackageCalculatorAttribute(i1, i) {
    this.getPackageAttributeValues(i1).removeAt(i);
  }

  removePackage(index1) {
    this.packageCalculatorTemplates.removeAt(index1);
  }

  onSelectPackageType(i1, $event) {
    this.getPackageAttributeValues(i1).clear();
  }

  async onSelectCalculatorMeta(i) {
    if (
      this.packageCalculatorTemplates.controls[i].get('metaCalculatorId')
        .value == 'NEW'
    ) {
      this.showInputMetas[i] = true;
      this.packageCalculatorTemplates.controls[i]
        .get('description')
        .setValue('');
      this.getPackageAttributeValues(i).clear();
      this.labelTypeAttributeIds[i] = [];
      this.apiService.finalSave = false;
      return;
    }
    if (
      this.packageCalculatorTemplates.controls[i].get('metaCalculatorId')
        .value == 'SAVEAS'
    ) {
      this.showInputMetas[i] = true;
      this.packageCalculatorTemplates.controls[i]
        .get('description')
        .setValue('');
      this.apiService.finalSave = false;
      return;
    }
    // this.showInputMeta=true
    let id = Number(
      this.packageCalculatorTemplates.controls[i].get('metaCalculatorId').value
    );
    this.getPackageAttributeValues(i).clear();
    let calculatorMetaDetails: any = this.apiService.allCalculatorMetas.find(
      (el) => {
        return Number(id) === Number(el.id);
      }
    );

    this.packageCalculatorTemplates.controls[i]
      .get('metaCalculatorId')
      .setValue(calculatorMetaDetails?.id);
    this.packageCalculatorTemplates.controls[i]
      .get('description')
      .setValue(calculatorMetaDetails?.description);

    calculatorMetaDetails?.calculatorAttributeValues.forEach((element) => {
      if (
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(element.attributeId).attributeTypeId
        )?.description == 'Label'
      ) {
        if (element.attributeValueExpression) {
          let prop = JSON.parse(
            element.attributeValueExpression?.replace(/'/g, '"')
          );
          prop.forEach((element) => {
            this.labelTypeAttributeIds[i].push(Number(element.attributeId));
          });
        }
      }

      const form = this.formsService.createPackageAttributeForm();
      this.getPackageAttributeValues(i).push(form);
    });
    this.getPackageAttributeValues(i).patchValue(
      calculatorMetaDetails.calculatorAttributeValues
    );
    this.settingLabelAttributesIds();
    this.productTemplateCalculator.get('id').setValue(null);
    this.packageCalculatorTemplates.controls[i].get('id').setValue(null);
    const packageCalculatorTemplateAttributeValues =
      this.packageCalculatorTemplates.controls[i].get(
        'packageCalculatorTemplateAttributeValues'
      ) as UntypedFormArray;
    packageCalculatorTemplateAttributeValues.controls.forEach(
      (pcKattribute) => {
        pcKattribute.get('id').setValue(null);
      }
    );
  }

  toggleSaveInput(i1) {
    this.packageCalculatorTemplates.controls[i1]
      .get('metaCalculatorId')
      .setValue(null);
    this.showInputMetas[i1] = false;
    this.apiService.finalSave = true;
  }

  getFilteredMeta(metas: any, i: any) {
    let filteredList = [];
    filteredList = metas.filter((item) => {
      return (
        item.packageType ==
        this.packageCalculatorTemplates.controls[i].get('packageType').value
      );
    });
    return filteredList;
  }

  async postCalculatorMeta(i) {
    try {
      let existingMeta = this.getFilteredMeta(
        this.apiService.allCalculatorMetas,
        i
      ).find(
        (item) =>
          item.description?.toUpperCase() ==
          this.getDescription(i).value?.toUpperCase()
      );
      if (existingMeta) {
        this.toastr.error('Same name meta already exist');
        // Reset finalSave if validation fails
        this.apiService.finalSave = true;
        return;
      }
      if (this.getPackageAttributeValues(i).controls?.length == 0) {
        this.toastr.error('Please add atleast one attribute');
        // Reset finalSave if validation fails
        this.apiService.finalSave = true;
        return;
      }
      let calculatorAttributeValues: any =
        this.getPackageAttributeValues(i).value;
      calculatorAttributeValues = this.apiService.cleanDataId(
        calculatorAttributeValues
      );
      let newData: any = {
        calculatorAttributeValues: calculatorAttributeValues,
        id: null,
        description: this.getDescription(i).value,
        packageType:
          this.packageCalculatorTemplates.controls[i].get('packageType').value,
      };
      const res: any = await this.apiService
        .addCalculatorMeta(newData)
        .toPromise();
      this.apiService.Get_All_Calculator_Metas_Non_Cache();
      this.showInputMetas[i] = false;
      this.packageCalculatorTemplates.controls[i]
        .get('metaCalculatorId')
        .setValue(res.id);
      this.packageCalculatorTemplates.controls[i]
        .get('description')
        .setValue(res?.description);
      this.apiService.finalSave = true;
    } catch (err) {
      // Reset finalSave on error so UI is not stuck
      this.apiService.finalSave = true;
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async updateCalculatorMeta(i) {
    let calculatorAttributeValues: any =
      this.getPackageAttributeValues(i).value;
    let newData: any = {
      calculatorAttributeValues: calculatorAttributeValues,
      id: this.packageCalculatorTemplates.controls[i].get('metaCalculatorId')
        .value,
      description:
        this.packageCalculatorTemplates.controls[i].get('description').value,
      packageType:
        this.packageCalculatorTemplates.controls[i].get('packageType').value,
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

  getFilteredAttributes(i1) {
    if (this.getAttributeName(i1).value != null) {
      let allIds: any = [];
      this.getPackageAttributeValues(i1).value.forEach((element) => {
        allIds.push(element.attributeId);
      });

      let filteredList: any = this.apiService.allAttributes.filter((el) => {
        if (el?.description) {
          return (
            el?.description
              ?.toUpperCase()
              .includes(this.getAttributeName(i1).value.toUpperCase()) &&
            !allIds?.includes(el.id)
          );
        } else {
          return false;
        }
      });

      return filteredList;
    } else {
      let allIds: any = [];
      this.getPackageAttributeValues(i1).value.forEach((element) => {
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

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
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

  getArray(str: String) {
    if (!str) {
      return [];
    }
    let prop = JSON.parse(str.replace(/'/g, '"'));
    return prop;
  }

  getArrayIds(str: String) {
    if (str) {
      let prop = JSON.parse(str.replace(/'/g, '"'));
      let propids: any = [];
      prop.forEach((element) => {
        propids.push(Number(element.attributeId));
      });
      return propids;
    } else {
      return [];
    }
  }

  getPackageAttributeValues(i) {
    return this.packageCalculatorTemplates.controls[i].get(
      'packageCalculatorTemplateAttributeValues'
    ) as UntypedFormArray;
  }

  getDescription(i) {
    return this.packageCalculatorTemplates.controls[i].get('description');
  }

  async onDragClickAttribute(i1: any, i: any) {
    let control = this.getPackageAttributeValues(i1).controls[i];
    let index = this.getPackageAttributeValues(i1).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    if (index != -1) {
      let labelExpressionControl = this.getPackageAttributeValues(i1).controls[
        index
      ].get('attributeValueExpression');
      let attributeValueExpression: any = labelExpressionControl.value;
      let data: any = '';
      if (attributeValueExpression) {
        let resp: any = JSON.parse(attributeValueExpression);
        resp.push({ attributeId: control.value.attributeId });
        data = JSON.stringify(resp);
      } else {
        data = JSON.stringify([{ attributeId: control.value.attributeId }]);
      }

      this.labelTypeAttributeIds[i1].push(control.value.attributeId);
      labelExpressionControl.setValue(data);
    } else {
      this.toastr.error('No Label Type Attribute Present');
    }
  }
  async onDragRemoveAttribute(i1: any, i: any, attr: UntypedFormGroup) {
    let labelExpressionControl = this.getPackageAttributeValues(i1).controls[
      i
    ].get('attributeValueExpression');
    let attributeValueExpression: any = labelExpressionControl.value;
    let resp: any = JSON.parse(attributeValueExpression);
    let index = this.labelTypeAttributeIds[i1].findIndex(
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
      this.labelTypeAttributeIds[i1].splice(index, 1);
    }
    labelExpressionControl.setValue(data);
  }

  filterAttributeForLabel(attributes: UntypedFormArray, i1: any) {
    return attributes.controls
      .filter((control) => {
        return this.labelTypeAttributeIds[i1].includes(
          control.get('attributeId').value
        );
      })
      .sort(
        (a, b) =>
          this.labelTypeAttributeIds[i1].indexOf(a.get('attributeId').value) -
          this.labelTypeAttributeIds[i1].indexOf(b.get('attributeId').value)
      );
  }



  resetFormula() {
    this.formulaValue = '';
  }

  openDialog() {
    this.dialog.open(UsageFormulasModalComponent, {
      data: {
        animal: 'panda',
      },
    });
  }

  openAttributeDialog(i) {
    let dialogRef = this.dialog.open(AttributeValueModalComponent, {
      data: {
        elementdata: this.getPackageAttributeValues(i).controls,
        allAttributes: this.apiService.allAttributes,
        labelTypeAttributeIds: this.labelTypeAttributeIds[i],
      },
    });
    this.setLabelInsideArrangement(i);
    dialogRef.afterClosed().subscribe((result) => {
      let k = 1;
      this.getPackageAttributeValues(i).controls.forEach((element, j) => {
        if (
          !this.labelTypeAttributeIds[i].includes(
            element.get('attributeId').value
          )
        ) {
          element.get('sortOrder').setValue(k);
          k++;
        }
      });
      this.setLabelInsideArrangement(i);
    });
  }

  setLabelInsideArrangement(i) {
    let index = this.getPackageAttributeValues(i).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.getPackageAttributeValues(i).controls.forEach((element, j) => {
      if (
        this.labelTypeAttributeIds[i].includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.getPackageAttributeValues(i).controls[index].get('sortOrder')
              .value +
            (j + 1) / 10
          );
      }
    });
  }

  addPackage() {
    this.packageCalculatorTemplates.push(
      this.formsService.createPackageCalculatorTemplates()
    );
  }
  markSku(event, index: any) {
    if (event.target.checked) {
      this.packageCalculatorTemplates.controls.forEach((element, ind) => {
        if (index != ind) {
          element.get('isSku').setValue(false);
        }
      });
    }
  }

  checkForAttributePresence(data: any, event: any, i: any) {
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
      this.getAttributeName(i).reset();
      this.toastr.error('Attribute Already Added');
      return;
    }
  }

  testCalculatorModal(i1: any) {
    // Pass the entire template form so the modal has access to all necessary data
    const templateFormData = this.templateForm.getRawValue();
    let dialogRef = this.dialog.open(CalculateErrorModalComponent, {
      data: {
        productTemplateCalculator: templateFormData,
        labelTypeAttributeIds: this.labelTypeAttributeIds || [],
        type: 'PackageCalculator',
        index: i1,
      },
    });
    dialogRef.afterClosed().subscribe((result) => { });
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
      result = result?.replace(new RegExp(`\\${character}`, 'g'), '');
    });

    return result;
  }

  getFilteredAutoCompleteAttributes() {
    let filteredList: any = this.getPackageAttributeValues(
      this.index1
    ).value.filter((el) => {
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

  formula(item: UntypedFormControl, i1, j) {
    this.currentControl = item;
    this.formulaValue = item.value;
    this.index1 = i1;
    this.currentFocusedIndex = j;
  }

  changeView(i) {
    this.excelView[i] = !this.excelView[i];
  }

  preventFocusChange(event: MouseEvent) {
    event.preventDefault(); // Prevents focus change
  }
}
