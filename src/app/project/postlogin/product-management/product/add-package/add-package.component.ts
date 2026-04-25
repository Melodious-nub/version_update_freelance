import { FormsService } from 'src/app/service/forms.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { SortFormArrayPipe } from 'src/app/shared/pipes/sort-formarray-sortorder.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AttributeValueModalComponent } from '../../product-template/product-template-list-form/product-templates-steps/components/attribute-value-modal/attribute-value-modal.component';
import { takeUntil, Subject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinSliderComponent } from 'src/app/shared/widgets/dadyin-slider/dadyin-slider.component';
import { environment } from 'src/environments/environment';
import { NumberFormatterPipe } from '../../../../../shared/pipes/number-formatter.pipe';
import { SortFormArrayPipe as SortFormArrayPipe_1 } from '../../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { DadyinSearchableSelectComponent } from '../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatTooltip } from '@angular/material/tooltip';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'app-add-package',
    templateUrl: './add-package.component.html',
    styleUrls: ['./add-package.component.scss'],
    standalone: true,
    imports: [
    DadyinButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
    NgbTooltip,
    MatTooltip,
    NgClass,
    ExtendedModule,
    RouterLink,
    DadyinSearchableSelectComponent,
    MatIcon,
    CdkDropList,
    CdkDrag,
    NgStyle,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    SortFormArrayPipe_1,
    NumberFormatterPipe
],
})
export class AddPackageComponent implements OnInit {
  @Input() productForm: UntypedFormGroup;
  @Input() componentUoms: UntypedFormArray;

  @Input() disableForThirdPartyProduct: any;
  @Input() isThirdPartyProductMeta: any
  imgUrl = environment.imgUrl;

  private ngUnsubscribe: Subject<void> = new Subject();
  pAttribute = new UntypedFormControl(null);
  colSpace = new UntypedFormControl('25');

  @Output() calculate = new EventEmitter();
  tempPackages: any;
  labelTypeAttributeIds: any = [];
  allProductsPackagingMaterial: any[] = []
  imageDragging = false;
  constructor(
    public toastr: ToastrService,
    public formsService: FormsService,
    public fb: UntypedFormBuilder,
    public apiService: ApiService,
    public route: ActivatedRoute,
    public uomService: UomService,
    public sortFormArray: SortFormArrayPipe,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.uomService.getAllUoms()
    this.uomService.getAvailableMetricUoms()
    this.tempPackages = this.packages.value;
    this.setLabelTypeAttributeIds();
    this.calculate.emit(null);
  }

  setLabelTypeAttributeIds() {
    const tempPackages = JSON.parse(JSON.stringify(this.packages.value));
    this.labelTypeAttributeIds = [];
    tempPackages?.forEach((ele, index) => {
      this.labelTypeAttributeIds[index] = [];
      if (this.productForm.get('skuName').value) {
        if (ele.packageType == this.productForm.get('skuName').value) {
          this.packages.controls[index].get('isSku').setValue(true);
        } else {
          this.packages.controls[index].get('isSku').setValue(false);
        }
      }

      ele?.packageAttributeValues?.forEach((element) => {
        if (
          this.getAttributeTypeObjectById(
            this.getAttributeObjectById(element.attributeId).attributeTypeId
          )?.description == 'Label' &&
          element.attributeValueExpression
        ) {
          let prop = JSON.parse(
            element.attributeValueExpression?.replace(/'/g, '"')
          );
          prop.forEach((element) => {
            this.labelTypeAttributeIds[index]?.push(Number(element.attributeId));
          });
        }
      });
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

  addPackage() {
    const packageForm = this.formsService.createPackageForm()
    packageForm.get('sortOrder').patchValue(this.packages.controls.length + 1);
    this.packages.push(packageForm);
  }
  removePackage(i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.packages.removeAt(i);
    this.getCalculatedValues()
    this.setLabelTypeAttributeIds();

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
      this.getPackageAttributeValues(i).controls.forEach((element, i) => {
        if (
          !this.labelTypeAttributeIds[i]?.includes(
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
    this.getPackageAttributeValues(i).controls.forEach((element, i) => {
      if (
        this.labelTypeAttributeIds[i]?.includes(element.get('attributeId').value)
      ) {
        element
          .get('sortOrder')
          .setValue(
            this.getPackageAttributeValues(i).controls[index].get('sortOrder')
              .value +
            (i + 1) / 10
          );
      }
    });
  }

  getPackageExpenseValues(i) {
    return this.packages.controls[i]
      .get('packageExpense')
      .get('expenseValues') as UntypedFormArray;
  }

  getPackageExpenseConversionTypeValues(i) {
    return this.packages.controls[i]
      .get('packageExpense')
      .get('expenseConversionTypes') as UntypedFormArray;
  }

  removePackageExpense(i, k) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPackageExpenseValues(i).removeAt(k);

    this.getCalculatedValues()
  }

  addPackageExpense(i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPackageExpenseValues(i).push(
      this.formsService.createPackageExpenseForm()
    );
  }

  removePackageExpenseConversionType(i, m) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPackageExpenseConversionTypeValues(i).removeAt(m);

    this.getCalculatedValues()
  }

  addPackageExpenseConversionType(i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPackageExpenseConversionTypeValues(i).push(
      this.formsService.createPackageExpenseConversionTypeForm()
    );
  }

  renderPackageAttributes(event: any, i) {
    if (this.packages.controls[i].get('isSku').value) {
      this.productForm
        .get('skuName')
        .setValue(this.packages.controls[i].get('packageType').value);
    }
    let packageAttributeValues = this.packages.controls[i].get(
      'packageAttributeValues'
    ) as UntypedFormArray;
    packageAttributeValues.clear();
    this.labelTypeAttributeIds[i] = [];
    // const packageCalculatorTemplates=value.productTemplateCalculator.packageCalculatorTemplates

    if (this.tempPackages) {
      const item: any = this.tempPackages.find((item) => {
        return item.packageType == event.target.value;
      });
      if (item && item?.packageAttributeValues) {
        item.packageAttributeValues?.forEach((element) => {
          if (
            this.getAttributeTypeObjectById(
              this.getAttributeObjectById(element.attributeId).attributeTypeId
            )?.description == 'Label'
          ) {
            let prop = JSON.parse(
              element.attributeValueExpression.replace(/'/g, '"')
            );
            prop.forEach((element) => {
              this.labelTypeAttributeIds[i].push(Number(element.attributeId));
            });
          }
          packageAttributeValues.push(
            this.formsService.createPackageAttributeForm()
          );
        });
        packageAttributeValues.patchValue(item.packageAttributeValues);
      }
    }
    if (event.target.value == 'PALLET') {
      this.addPalletRow(i);
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

  getPackageAttributeValues(i) {
    // if(this.isNotEditable(i)) {
    //   return
    //  }
    return this.packages.controls[i].get('packageAttributeValues') as UntypedFormArray;
  }

  removePackageAttribute(i, k) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPackageAttributeValues(i).removeAt(k);

    this.getCalculatedValues()
  }

  addPalletRow(i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    const form = this.formsService.createPalletRowForm();
    let rowNumber = this.getPalletRows(i)?.length;
    form.get('rowNumber').setValue(rowNumber + 1);
    this.getPalletRows(i).push(form);
  }

  getPalletRows(i) {

    return this.packages.controls[i]
      .get('palletInformation')
      .get('palletRows') as UntypedFormArray;
  }

  getSkuPerPallet(i) {
    return this.packages.controls[i]
      .get('numberOfItems')
  }

  getTotalForSkuPerPallet(i) {
    let total: any = 0;
    this.getPalletRows(i).controls.forEach((ele: any) => {
      total = total + ele.get('total').value;
    });
    this.getSkuPerPallet(i).setValue(total);
    this.getCalculatedValues()
  }

  removePalletRow(i, k) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.getPalletRows(i).removeAt(k);
  }

  getArray(str: String) {
    if (!str) {
      return []
    }
    let prop = JSON.parse(str.replace(/'/g, '"'));
    return prop;
  }

  getFilteredProductsList(expense) {

    if (this.allProductsPackagingMaterial?.length > 0) {
      if (Number(expense.get('productTypeId').value)) {
        let productList: any = this.allProductsPackagingMaterial.filter((item) => {
          return (
            item.productTypeId == Number(expense.get('productTypeId').value)
          );
        });
        return productList;
      } else {
        return this.allProductsPackagingMaterial;
      }
    }
    else {
      return []
    }

  }


  confirmChange(event: any, i) {
    if (!this.packages.controls[i].get('isSku').value) {
      this.packages.controls[i].get('isSku').patchValue(true)
      return
    }
    if (event.target.checked) {
      this.packages.controls[i].get('isSku').patchValue(false)
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '25%',
          data: { title: 'Do you want to change your considered cost ?' }
        })
        .afterClosed()
        .subscribe(async (res) => {
          if (res) {
            this.packages.controls[i].get('isSku').patchValue(true)
            this.skuChange(event, i);
          }
          else {
            this.packages.controls[i].get('isSku').patchValue(false)
          }
        });
    }

  }


  skuChange(event: any, i) {
    this.productForm
      .get('skuName')
      .setValue(this.packages.controls[i].get('packageType').value);
    if (event.target.value) {
      this.packages.controls.forEach((ele, index) => {
        if (i != index) {
          ele.get('isSku').setValue(false);
          ele.get('packageSKUDetail').reset();
        }
      });
      this.getCalculatedValues();
    }
  }

  getFilteredPackageTypes(packageTypes: any, current: any) {
    let allSelectedPackageTypes: any[] = [];
    this.packages.value.forEach((item) => {
      allSelectedPackageTypes.push(item?.packageType);
    });
    let filteredPackageTypes: any = [];
    filteredPackageTypes = packageTypes.filter(
      (item) => !allSelectedPackageTypes.includes(item)
    );
    filteredPackageTypes = filteredPackageTypes.filter((it) => it != 'UNIT')
    if (current && !filteredPackageTypes.includes(current)) {
      filteredPackageTypes.push(current);
    }
    return filteredPackageTypes;
  }

  changeValue(item?: UntypedFormGroup) {
    if (item) {
      item.get('isUserInput').setValue(true);
    }
    this.getCalculatedValues();
  }

  async getCalculatedValues() {
    this.calculate.emit(null);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onProductCodeExpenseChange(product, expense: UntypedFormGroup) {
    expense.get('expenseProductId').setValue(product?.id)
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
  }

  onProductTypeExpenseChange(expense: UntypedFormGroup) {
    let products = this.getFilteredProductsList(
      expense
    );
    if (products?.length > 0) {
      expense.get('productTypeId').setValue(products[0].productTypeId);
      expense.get('expenseDescription').setValue(products[0].description);
      expense.get('expenseProductId').setValue(products[0].id);
      expense.get('expenseProductCode').setValue(products[0].productCode);
      expense
        .get('weight')
        .get('attributeValue')
        .setValue(products[0].weight.attributeValue);
      expense
        .get('weight')
        .get('userConversionUom')
        .setValue(products[0].weight.userConversionUom);
      //
      expense
        .get('cost')
        .get('attributeValue')
        .setValue(products[0].cost.attributeValue);
      expense
        .get('cost')
        .get('userConversionUom')
        .setValue(products[0].cost.userConversionUom);
    } else {
      expense.get('expenseDescription').reset();
      expense.get('cost').reset();
      expense.get('weight').reset();
      expense.get('expenseProductId').reset();
    }
  }

  get packages() {
    return this.productForm.get('packages') as UntypedFormArray;
  }

  async toggleAttribute(item: UntypedFormGroup, index, i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
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
    item.get('attributeValueExpression').setValue(expression);
    this.changeValue();
  }

  getArrayIds(str: String) {
    let prop = JSON.parse(str.replace(/'/g, '"'));
    let propids: any = [];
    prop.forEach((element) => {
      propids.push(Number(element.attributeId));
    });
    return propids;
  }

  filterAttributeForLabel(i: any) {
    this.setLabelTypeAttributeIds();
    return this.getPackageAttributeValues(i).controls
      .filter((control) => {
        return this.labelTypeAttributeIds[i]?.includes(
          control.get('attributeId')?.value
        );
      })
      .sort(
        (a, b) =>
          this.labelTypeAttributeIds[i].indexOf(a.get('attributeId').value) -
          this.labelTypeAttributeIds[i].indexOf(b.get('attributeId').value)
      );

  }

  toggleFlag(control: UntypedFormControl) {
    control.setValue(!control.value);
  }

  toggleVisibility(item: any, param: any) {
    item.get('isHidden').setValue(param);
  }

  toggleLock(item: any, param: any) {
    item.get('isUserInput').setValue(param);
    this.getCalculatedValues();
  }

  hidePackageExpenseAndAttributes(packageType: any) {
    return packageType == 'UNIT' ? false : true;
  }

  addExistingAttribute(i, type: any) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    const data = this.pAttribute.value;
    if (!this.pAttribute.value) {
      return;
    }
    let allIds: any[] = [];
    for (
      let index = 0;
      index < this.getPackageAttributeValues(i).value.length;
      index++
    ) {
      const id1 = this.getPackageAttributeValues(i).value[index].attributeId;
      allIds.push(id1);
    }
    if (allIds.includes(data.id)) {
      this.toastr.error('Already Exist');
      return;
    }
    let form: UntypedFormGroup = this.formsService.createAttributeForm();
    form.get('sortOrder').setValue(this.getPackageAttributeValues(i).length + 1)
    if (this.colSpace.value) {
      form.get('colSpace').setValue(Number(this.colSpace.value));
    }
    form.get('attributeId').setValue(data.id);
    form
      .get('userConversionUom')
      .setValue(
        this.getAttributeTypeObjectById(data?.attributeTypeId)?.defaultUom
          ?.description
      );

    const packageCalculatorTemplate: any =
      this.apiService.productTemplateForCalculation?.value?.productTemplateCalculator?.packageCalculatorTemplates.find(
        (it) => it.packageType == type
      );
    let ele: any
    if (packageCalculatorTemplate) {
      ele = packageCalculatorTemplate?.packageCalculatorTemplateAttributeValues.find(
        (item) => item.attributeId == data.id
      );
    }

    if (ele) {
      form.get('attributeValue').setValue(ele?.attributeValue);
      form
        .get('attributeValueExpression')
        .setValue(ele?.attributeValueExpression);
    }

    this.getPackageAttributeValues(i).push(form);
    this.setLabelTypeAttributeIds();
  }

  syncProductTemplate(i) {
    if (this.isNotEditable(i)) {
      this.toastr.error("Not editable");
      return
    }
    this.apiService.syncTemplate.setValue(true);
    this.apiService.syncTemplate.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        if (!res) {
          this.getCalculatedValues();
        }
      });
  }

  get isPackageAttributes() {
    return this.productForm.get('isPackageAttributes');
  }
  trackByFn(index, item) {
    return index;
  }

  setTotalValue(pallet, i: any) {
    pallet
      .get('total')
      .setValue(
        Number(pallet.get('rowValue').value) *
        Number(pallet.get('columnValue').value)
      );

    this.getTotalForSkuPerPallet(i);
  }

  setRowValue(pallet, i) {
    pallet
      .get('rowValue')
      .setValue(
        Number(pallet.get('rx').value) * Number(pallet.get('ry').value)
      );
    this.setTotalValue(pallet, i)
  }

  toggleProductMaterialCost(event, control: UntypedFormControl) {
    if (event.target.checked) {
      control.clearValidators()
      control.updateValueAndValidity()
    }
    else {
      control.setValidators(Validators.required)
      control.updateValueAndValidity()
    }
  }

  isNotFixAttribute(id: any) {
    const fixattributes = ['Net Cost']
    return fixattributes.includes(this.getAttributeObjectById(id)?.description) ? false : true
  }
  toggleGlobalAttributes(controls: UntypedFormControl[], flag: UntypedFormControl) {
    if (flag.value) {
      controls.forEach(element => {
        element.get('isHidden').setValue(true)
      });
      flag.setValue(false)
    }
    else {
      controls.forEach(element => {
        element.get('isHidden').setValue(false)
      });
      flag.setValue(true)
    }
  }

  Get_All_Product_List_IsPackage(event: any) {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach(col => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value
          }`;
      });

    });
    uomQuery = encodeURI(uomQuery);
    this.apiService.Get_All_Product_List_IsPackage(uomQuery, event.target.value).subscribe(res => {
      this.allProductsPackagingMaterial = res
    })

  }


  isNotEditable(i) {
    const isSkuIndex = this.packages.controls?.findIndex((pck) => pck.get('isSku').value)
    if ((this.disableForThirdPartyProduct || this.isThirdPartyProductMeta) && i <= isSkuIndex) {
      return true
    }
    else {
      return false
    }
  }

  getImages(index) {
    return this.packages.controls[index].get('packageImages') as UntypedFormArray;
  }

  onDrop(event: CdkDragDrop<any[]>, index: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        this.getImages(index).controls,
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
    this.getImages(index).controls.forEach((img, index) => {
      img.patchValue({ sortOrder: index + 1 });
    });
  }

  imageselected(event: any, index: number) {
    this.uploadFile(event.target.files, index);
  }

  async uploadFile(imgfile, index: number) {
    try {
      const res: any = await this.apiService.uploadFiles(imgfile);
      res.data.forEach((element) => {
        let obj: any = {};
        obj = {
          id: null,
          sortOrder: this.getImages(index).controls?.length + 1,
          fileName: element.media_url,
          isHide: false
        };
        this.getImages(index).push(this.formsService.createImageForm());
        this.getImages(index).controls[this.getImages(index)?.controls?.length - 1].patchValue(obj);
      });
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  removeImage(j, index: number) {
    if (this.disableForThirdPartyProduct || this.isThirdPartyProductMeta) {
      this.toastr.warning('Not Editable for Third Party Product');
      return;
    }
    this.getImages(index).removeAt(j);
  }

  hideImage(isHide, controlIndex, index) {
    this.getImages(index).controls[controlIndex].get('isHide').setValue(isHide);
  }

  openImageSlider(images: any, i) {
    let imgFiles = images.map((it) => (it = it.get('fileName').value));
    this.dialog.open(DadyinSliderComponent, {
      data: { images: imgFiles, index: i },
    });
  }



  onImageClick(event: Event, images: any, i: number) {
    if (this.imageDragging) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.openImageSlider(images, i);
  }

  onImageDragStart() {
    this.imageDragging = true;
  }

  onImageDragEnd() {
    this.imageDragging = false;
  }
}
