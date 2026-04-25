import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, HostListener, OnInit, Input, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { SystemConfigService } from '../service/system-config.service';
import { SystemConfigFormsService } from '../service/system-config-forms.service';
import { SortFormArrayPipe } from 'src/app/shared/pipes/sort-formarray-sortorder.pipe';
import { CalculateErrorModalComponent } from 'src/app/project/postlogin/product-management/common-modals/calculate-error-modal/calculate-error-modal.component';
import { CreateDropdownFieldModalComponent } from '../../product-management/product-template/product-template-list-form/product-templates-steps/components/create-dropdown-field-modal/create-dropdown-field-modal.component';
import { CreateToggleFieldModalComponent } from '../../product-management/product-template/product-template-list-form/product-templates-steps/components/create-toggle-field-modal/create-toggle-field-modal.component';
import { ProductTemplateService } from '../../product-management/product-template/service/product-template.service';
import { AttributeValueModalComponent } from '../../product-management/product-template/product-template-list-form/product-templates-steps/components/attribute-value-modal/attribute-value-modal.component';
import { SortFormArrayPipe as SortFormArrayPipe_1 } from '../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { NgStyle, NgClass } from '@angular/common';

@Component({
    selector: 'app-business-entity-configuration',
    templateUrl: './business-entity-configuration.component.html',
    styleUrls: ['./business-entity-configuration.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinButtonComponent,
        NgStyle,
        ExtendedModule,
        NgClass,
        MatAccordion,
        MatExpansionPanel,
        MatTooltip,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        MatIcon,
        CdkDropList,
        CdkDrag,
        SortFormArrayPipe_1
    ]
})
export class BusinessEntityConfigurationComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  private systemConfigService = inject(SystemConfigService);
  private formsService = inject(SystemConfigFormsService);
  apiService = inject(ApiService);
  toastr = inject(ToastrService);
  sortFormArray = inject(SortFormArrayPipe);
  productTemplateService = inject(ProductTemplateService);
  dialog = inject(MatDialog);
  dialogData? = inject(MAT_DIALOG_DATA, { optional: true });
  dialogRef? = inject<MatDialogRef<BusinessEntityConfigurationComponent>>(MatDialogRef, { optional: true });

  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.formulaAutoComplete = false;
  }
  @Input() isReadOnly: boolean = false;
  @Input() configurationType: string;
  excelView = [false, false, false, false, false, false, false, false];
  configurationForm: UntypedFormGroup;
  configurationTypes: any[] = [];
  colSpace: UntypedFormControl = this.fb.control(25);
  attributeName: UntypedFormControl = new UntypedFormControl();
  attributeType: UntypedFormControl = new UntypedFormControl();

  collapsedSections: { [key: number]: boolean } = {};
  attributeValueExpression: any = '';
  // Formula functionality
  currentControl: any = null;
  formulaValue = '';
  formulaAutoComplete = false;
  searchAutoComplete = new UntypedFormControl('');
  currentFocusedIndex: string | null = null;
  labelTypeAttributeIds: any = [];
  constructor() {
    this.configurationForm = this.formsService.createBusinessEntityConfigurationForm();
  }

  async ngOnInit() {
    await this.loadConfigurationTypes();


    // Load attributes first (these are needed for populating the form)
    await this.apiService.Get_All_Attributes().catch(() => { });
    await this.apiService.Get_All_AttributeTypes().catch(() => { });

    // Determine configuration type from input or dialog data
    const configType = this.configurationType || this.dialogData?.configurationType;

    // Load active configuration if configurationType is provided
    if (configType) {
      await this.loadActiveConfiguration(configType);
    }


    // Initialize label type attribute IDs after loading configuration
    this.settingLabelAttributesIds();
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



  async loadConfigurationTypes() {
    try {
      const res: any = await this.systemConfigService.getConfigurationTypes().toPromise();
      this.configurationTypes = res || [];
    } catch (error) {
      this.toastr.error('Failed to load configuration types');
    }
  }

  async loadActiveConfiguration(configurationType: string) {
    try {
      const config: any = await this.systemConfigService.getActiveConfiguration(configurationType).toPromise();
      if (config) {
        this.populateFormWithConfiguration(config);
      } else {
        // No active configuration exists - set up form for creating new one
        this.initializeNewConfiguration(configurationType);
      }
    } catch (error) {
      // If no active configuration exists, set up form for creating new one
      this.initializeNewConfiguration(configurationType);
    }
  }

  initializeNewConfiguration(configurationType: string) {
    // Set the configuration type for new configuration (blank form ready for user input)
    this.configurationForm.patchValue({
      configurationType: configurationType,
      name: null, // Leave blank for user to enter
      isActive: true,
      isDefault: false,
      id: null
    });

    // Clear any existing sections
    while (this.sections.length !== 0) {
      this.sections.removeAt(0);
    }

  }

  populateFormWithConfiguration(config: any) {

    const sections: UntypedFormArray = this.configurationForm.get('sections') as UntypedFormArray;
    config.sections.forEach((section: any, index: number) => {
      const sectionForm = this.formsService.createSectionForm();
      const attributes: UntypedFormArray = sectionForm.get('attributes') as UntypedFormArray;
      section.attributes.forEach((attribute: any) => {
        const attributeForm = this.formsService.createAttributeConfigForm();
        attributes.push(attributeForm);
      });
      sections.push(sectionForm);
      // Initialize collapsed state for each section (default to expanded/false)
      this.collapsedSections[index] = false;
    });
    // Set basic form values
    this.configurationForm.patchValue(config);



    // Initialize label type attribute IDs after populating
    this.settingLabelAttributesIds();
  }

  get sections(): UntypedFormArray {
    return this.configurationForm.get('sections') as UntypedFormArray;
  }

  getSectionAttributes(sectionIndex: number): UntypedFormArray {
    return this.sections.at(sectionIndex).get('attributes') as UntypedFormArray;
  }

  addSection() {
    const sectionForm = this.formsService.createSectionForm();
    sectionForm.get('sortOrder')?.setValue(this.sections.length + 1);
    this.sections.push(sectionForm);
    // Initialize labelTypeAttributeIds for the new section
    const newSectionIndex = this.sections.length - 1;
    if (!this.labelTypeAttributeIds[newSectionIndex]) {
      this.labelTypeAttributeIds[newSectionIndex] = [];
    }
    // Initialize collapsed state for the new section (default to expanded/false)
    this.collapsedSections[newSectionIndex] = false;
  }

  removeSectionAttribute(sectionIndex, i) {
    this.getSectionAttributes(sectionIndex).removeAt(i);
  }

  removeSection(index1) {
    this.sections.removeAt(index1);
    // Clean up collapsed state for removed section and reindex remaining sections
    delete this.collapsedSections[index1];
    // Reindex collapsed states for sections after the removed one
    const newCollapsedSections: { [key: number]: boolean } = {};
    Object.keys(this.collapsedSections).forEach((key: string) => {
      const oldIndex = parseInt(key);
      if (oldIndex > index1) {
        newCollapsedSections[oldIndex - 1] = this.collapsedSections[oldIndex];
      } else if (oldIndex < index1) {
        newCollapsedSections[oldIndex] = this.collapsedSections[oldIndex];
      }
    });
    this.collapsedSections = newCollapsedSections;
  }

  async addAttribute(i: any) {
    if (!this.sections.controls[i].get('sectionName').value) {
      this.toastr.error('Please select Section');
      return;
    }
    if (
      !this.sections.controls[i].get('attributeName').value
    ) {
      this.toastr.error('Please select Attribute Name');
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
        this.formsService.createAttributeConfigForm();
      form.patchValue(data);
      form
        .get('sortOrder')
        .setValue(this.getSectionAttributes(i)?.controls.length + 1);
      this.getSectionAttributes(i).push(form);
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

    let form = this.formsService.createAttributeConfigForm();
    form.patchValue(data);
    form
      .get('sortOrder')
      .setValue(this.getSectionAttributes(i)?.controls.length + 1);
    this.getSectionAttributes(i).push(form);
    this.getAttributeType(i).setValue(null);
    this.getAttributeName(i).reset();
    this.getColSpace(i).setValue(25);
  }

  getColSpace(i) {
    return this.sections.controls[i].get('colSpace');
  }

  getAttributeName(i) {
    return this.sections.controls[i].get('attributeName');
  }

  getAttributeType(i) {
    return this.sections.controls[i].get('attributeType');
  }

  removeAttribute(i: any) {
    this.getSectionAttributes(i).removeAt(i);


    // Also remove from any label's defaultValue expression

    // Update sort orders
    this.getSectionAttributes(i).controls.forEach((control, j) => {
      control.get('sortOrder')?.setValue(j + 1);
    });

    // Update label type attribute IDs after removing attribute
    this.settingLabelAttributesIds();
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



  getFilteredAttributes(i1) {
    if (this.getAttributeName(i1).value != null) {
      let allIds: any = [];
      this.getSectionAttributes(i1).value.forEach((element) => {
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
      this.getSectionAttributes(i1).value.forEach((element) => {
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
  settingLabelAttributesIds() {
    this.labelTypeAttributeIds = [];
    this.sections.value.forEach((section, index) => {

      this.labelTypeAttributeIds[index] = [];
      section.attributes.forEach((element: any) => {
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

  async onDragClickAttribute(sectionIndex: any, i: any) {
    let control = this.getSectionAttributes(sectionIndex).controls[i];
    let index = this.getSectionAttributes(sectionIndex).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    if (index != -1) {
      let labelExpressionControl = this.getSectionAttributes(sectionIndex).controls[
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

      this.labelTypeAttributeIds[sectionIndex].push(control.value.attributeId);
      labelExpressionControl.setValue(data);
    } else {
      this.toastr.error('No Label Type Attribute Present');
    }
  }
  async onDragRemoveAttribute(sectionIndex: any, i: any, attr: UntypedFormGroup) {
    let labelExpressionControl = this.getSectionAttributes(sectionIndex).controls[
      i
    ].get('attributeValueExpression');
    let attributeValueExpression: any = labelExpressionControl.value;
    let resp: any = JSON.parse(attributeValueExpression);
    let index = this.labelTypeAttributeIds[sectionIndex].findIndex(
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
      this.labelTypeAttributeIds[sectionIndex].splice(index, 1);
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


  openAttributeDialog(i) {
    let dialogRef = this.dialog.open(AttributeValueModalComponent, {
      data: {
        elementdata: this.getSectionAttributes(i).controls,
        allAttributes: this.apiService.allAttributes,
        labelTypeAttributeIds: this.labelTypeAttributeIds[i],
      },
    });
    this.setLabelInsideArrangement(i);
    dialogRef.afterClosed().subscribe((result) => {
      let k = 1;
      this.getSectionAttributes(i).controls.forEach((element, j) => {
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
    let index = this.getSectionAttributes(i).value.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.attributeId).attributeTypeId
        )?.description == 'Label'
    );
    this.getSectionAttributes(i).controls.forEach((element, j) => {
      if (
        this.labelTypeAttributeIds[i].includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.getSectionAttributes(i).controls[index].get('sortOrder')
              .value +
            (j + 1) / 10
          );
      }
    });
  }

  drop(event: CdkDragDrop<UntypedFormGroup[]>, arr) {
    moveItemInArray(arr, event.previousIndex, event.currentIndex);

    // Update sortOrder based on the new order
    arr.forEach((control: UntypedFormGroup, index: number) => {
      control.get('sortOrder').setValue(index + 1);
    });
  }

  toggleSectionCollapse(index: number) {
    this.collapsedSections[index] = !this.collapsedSections[index];
  }

  isSectionCollapsed(index: number): boolean {
    return this.collapsedSections[index] || false;
  }

  onPanelOpened(index: number) {
    this.collapsedSections[index] = false;
  }

  onPanelClosed(index: number) {
    this.collapsedSections[index] = true;
  }

  changeView(sectionIndex: number) {
    this.excelView[sectionIndex] = !this.excelView[sectionIndex];
  }

  async saveConfiguration() {
    if (this.configurationForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    try {
      const formValue = this.configurationForm.getRawValue();

      const res: any = await this.systemConfigService
        .saveBusinessEntityConfiguration(formValue)
        .toPromise();
      this.toastr.success('Configuration saved successfully');
      if (res?.id) {
        this.configurationForm.patchValue({ id: res.id });
      }
      // Close dialog if opened as dialog
      if (this.dialogRef) {
        this.dialogRef.close(true);
      }
    } catch (error: any) {
      this.toastr.error(error?.error?.userMessage || 'Failed to save configuration');
    }
  }

  onConfigurationTypeChange() {
    this.initializeNewConfiguration(this.configurationForm.get('configurationType').value);
    // You can add logic here if needed when configuration type changes
  }

  // Formula functionality methods
  formula(item: UntypedFormControl, index: string) {
    this.currentControl = item;
    this.formulaValue = item.value || '';
    this.currentFocusedIndex = index;
  }

  openFormulaAutoComplete(event: any) {
    if (!this.currentControl) {
      this.toastr.error('Select any Attribute to focus');
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
    const currentValue = this.currentControl.value || '';
    const lastDotIndex = currentValue.lastIndexOf('.');
    const newValue = lastDotIndex >= 0
      ? currentValue.substring(0, lastDotIndex + 1) + formulaKey
      : currentValue + formulaKey;
    this.currentControl.setValue(newValue);
    this.formulaValue = newValue;
  }

  removeSpecialCharacters(input: string): string {
    const charactersToRemove = ['(', ')', '{', '}', ' ', '@', '#', '$'];
    let result = input;
    charactersToRemove.forEach((character) => {
      result = result.replace(new RegExp(`\\${character}`, 'g'), '');
    });
    return result;
  }

  getFilteredAutoCompleteAttributes(sectionIndex?: number) {
    // If sectionIndex is provided, use it; otherwise try to extract from currentFocusedIndex
    let targetSectionIndex = sectionIndex;
    if (targetSectionIndex === undefined && this.currentFocusedIndex) {
      const match = this.currentFocusedIndex.match(/(\d+)Section/);
      if (match) {
        targetSectionIndex = parseInt(match[1]);
      }
    }

    if (targetSectionIndex === undefined) {
      // Collect all attributes from all sections
      const allAttributes: any[] = [];
      this.sections.controls.forEach((section, idx) => {
        const attrs = this.getSectionAttributes(idx).value;
        allAttributes.push(...attrs);
      });

      if (!this.searchAutoComplete.value) {
        return allAttributes;
      }

      return allAttributes.filter((attr: any) => {
        const attribute = this.getAttributeObjectById(attr.attributeId);
        if (attribute?.description) {
          return attribute.description
            .toUpperCase()
            .includes(this.searchAutoComplete.value.toUpperCase());
        }
        return false;
      });
    }

    const attributesArray = this.getSectionAttributes(targetSectionIndex).value;
    if (!this.searchAutoComplete.value) {
      return attributesArray;
    }
    return attributesArray.filter((attr: any) => {
      const attribute = this.getAttributeObjectById(attr.attributeId);
      if (attribute?.description) {
        return attribute.description
          .toUpperCase()
          .includes(this.searchAutoComplete.value.toUpperCase());
      }
      return false;
    });
  }

  resetFormula() {
    this.formulaValue = '';
    this.currentControl = null;
    this.currentFocusedIndex = null;
  }

  testCalculatorModal() {
    // Collect all attributes from all sections for testing
    const allAttributes: any[] = [];
    this.sections.controls.forEach((section, sectionIndex) => {
      const attributes = this.getSectionAttributes(sectionIndex).value;
      attributes.forEach((attr: any) => {
        allAttributes.push({
          ...attr,
          sectionName: section.get('sectionName')?.value
        });
      });
    });

    let dialogRef = this.dialog.open(CalculateErrorModalComponent, {
      data: {
        businessEntityConfiguration: this.configurationForm.getRawValue(),
        attributes: allAttributes,
        labelTypeAttributeIds: this.labelTypeAttributeIds || [],
        type: 'BusinessEntityConfiguration',
      },
      width: '80%',
      maxWidth: '1200px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      // Handle result if needed
    });
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

  preventFocusChange(event: MouseEvent) {
    event.preventDefault();
  }

  editDropdownAttribute(item) {
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.id === item.value.attributeId;
    });
    let attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    const attributeControl = new UntypedFormControl(attribute.description);

    // Get the current value from the form control, fallback to original attribute value
    const currentattributeValueExpression = item.get('defaultValue')?.value || attribute.attributeValueExpression;

    this.dialog
      .open(CreateDropdownFieldModalComponent, {
        data: {
          attributeName: attributeControl,
          attributeType: attributeType,
          attributeValueExpression: currentattributeValueExpression,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          item
            .get('defaultValue')
            .setValue(res.attributeValueExpression);
          return;
        }
      });
  }

  editToggleAttribute(item, sectionIndex, attrIndex) {
    let attribute = this.apiService.allAttributes.find((el) => {
      return el.id === item.value.attributeId;
    });
    let attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    const attributeControl = new UntypedFormControl(attribute.description);
    const currentDefaultValue = item.get('defaultValue')?.value || '';

    this.dialog
      .open(CreateToggleFieldModalComponent, {
        data: {
          attributeName: attributeControl,
          attributeType: attributeType,
          attributeValueExpression: currentDefaultValue,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          item.get('defaultValue')?.setValue(res.attributeValueExpression);
        }
      });
  }

  isDropdownAttribute(attr: UntypedFormGroup): boolean {
    const attributeId = attr.get('attributeId')?.value;
    if (!attributeId) return false;

    const attribute = this.apiService.allAttributes.find((el) => el.id === attributeId);
    if (!attribute) return false;

    const attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    return attributeType?.description === 'Dropdown';
  }

  isToggleAttribute(attr: UntypedFormGroup): boolean {
    const attributeId = attr.get('attributeId')?.value;
    if (!attributeId) return false;

    const attribute = this.apiService.allAttributes.find((el) => el.id === attributeId);
    if (!attribute) return false;

    const attributeType = this.apiService.allAttributesTypes.find((el) => {
      return Number(el.id) == attribute.attributeTypeId;
    });

    return attributeType?.description === 'Toggle';
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

  getToggleOptions(defaultValue: string): any[] {
    if (!defaultValue) return [{ choice: '', selected: false }, { choice: '', selected: false }];
    try {
      const options = JSON.parse(defaultValue.replace(/'/g, '"'));
      if (Array.isArray(options) && options.length >= 2) {
        return options;
      }
      return [{ choice: '', selected: false }, { choice: '', selected: false }];
    } catch (e) {
      return [{ choice: '', selected: false }, { choice: '', selected: false }];
    }
  }

  getDropdownOptions(defaultValue: string): any[] {
    if (!defaultValue) return [];
    try {
      const options = JSON.parse(defaultValue.replace(/'/g, '"'));
      return Array.isArray(options) ? options : [];
    } catch (e) {
      return [];
    }
  }

  onToggleButtonClick(attr: UntypedFormGroup, index: number) {
    const defaultValue = attr.get('defaultValue')?.value;
    if (!defaultValue) return;

    try {
      const options = JSON.parse(defaultValue.replace(/'/g, '"'));
      if (Array.isArray(options) && options.length >= 2) {
        // Set the clicked button as selected and the other as not selected
        options[0].selected = index === 0;
        options[1].selected = index === 1;

        // Update the defaultValue with the new selection
        const updatedValue = JSON.stringify(options).replace(/"/g, "'");
        attr.get('defaultValue')?.setValue(updatedValue);
      }
    } catch (e) {
      console.error('Error updating toggle value:', e);
    }
  }

  toggleVisibility(item: any, param: any) {
    item.get('isHidden').setValue(param);
  }

  trackByFn(index, item) {
    return index;
  }
}
