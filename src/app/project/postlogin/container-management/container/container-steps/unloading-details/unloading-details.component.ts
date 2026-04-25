import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject, takeUntil } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';
import { AuthService } from 'src/app/service/auth.service';
import { PrintService } from 'src/app/service/print.service';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinSelectComponent } from '../../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { NgFor, NgIf, NgStyle, NgClass, SlicePipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-unloading-details',
    templateUrl: './unloading-details.component.html',
    styleUrls: ['./unloading-details.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        MatExpansionModule,
        ReactiveFormsModule,
        NgFor,
        DadyinInputComponent,
        DadyinSelectComponent,
        NgIf,
        NgStyle,
        ExtendedModule,
        NgClass,
        DadyinButtonComponent,
        MatAutocompleteModule,
        MatOptionModule,
        MatIconModule,
        SlicePipe,
    ],
})
export class UnloadingDetailsComponent implements OnInit {
  poView: any = 'orderWise';
  expanded: any[] = [];
  @Input() containerForm: UntypedFormGroup;
  @Input() isExport: any;
  @Input() currentBusinessAccount: any;
  @Output() selectedStateChange = new EventEmitter();
  @Output() calculate = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  public purchaseOrdersList: any[] = [];
  @Input() componentUoms: any;


  constructor(
    public fb: UntypedFormBuilder,
    public containerService: ContainerManagementService,
    public containerFormService: ContainerFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public printService: PrintService
  ) {}

  async ngOnInit() {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

  getAttributeUserConversionUom(value1: any, value2: string): any {
    return this.containerForm.get(value1).get(value2).get('userConversionUom');
  }
  getAttributeAttributeValue(value1: any, value2: string): any {
    return this.containerForm.get(value1).get(value2).get('attributeValue');
  }

  get containerOrders() {
    return this.containerForm.get('containerOrders') as UntypedFormArray;
  }

  getPurchaseOrderDetail(i) {
    return this.containerOrders.controls[i].get('purchaseOrderDetail');
  }

  getProductPackages(i) {
    return this.getPurchaseOrderDetail(i).get('productPackages') as UntypedFormArray;
  }

  expand(i, type) {
    if (type) {
      this.expanded.push(i);
    } else {
      this.expanded = this.expanded.filter((item) => item != i);
    }
  }

  getWeightWidth() {
    if (
      this.containerForm.get('weight').get('attributeValue').value &&
      this.containerForm
        .get('containerTypeInformation')
        .get('weight')
        .get('attributeValue').value
    ) {
      const percent =
        (this.containerForm.get('weight').get('attributeValue').value /
          this.containerForm
            .get('containerTypeInformation')
            .get('weight')
            .get('attributeValue').value) *
        100;
      const width = percent + '%';
      return width;
    } else {
      return '0%';
    }
  }

  getVolumeWidth() {
    if (
      this.containerForm.get('volume').get('attributeValue').value &&
      this.containerForm
        .get('containerTypeInformation')
        .get('volume')
        .get('attributeValue').value
    ) {
      const percent =
        (this.containerForm.get('volume').get('attributeValue').value /
          this.containerForm
            .get('containerTypeInformation')
            .get('volume')
            .get('attributeValue').value) *
        100;
      const width = percent + '%';
      return width;
    } else {
      return '0%';
    }
  }

  get unloadingMaterialExpenses() {
    return this.containerForm
      .get('containerExpense')
      .get('unloadingMaterialExpenses') as UntypedFormArray;
  }

  addInUnloadingMaterialExpense() {
    const Form =   this.containerFormService.unloadingMaterialExpenseForm()
    Form.get('addedByBusinessAccountId').setValue(this.currentBusinessAccount?.id)
    Form.get('cost').get('userConversionUom').setValue(this.isExport ? this.getUomByName('exportCost') : this.getUomByName('importCost'))
    this.unloadingMaterialExpenses.push(
      Form
    );
  }

  getFilteredUnloadingMaterialExpenses() {
    let filteredControls = this.unloadingMaterialExpenses.controls.filter((item)=> (item.get('addedByBusinessAccountId').value==this.currentBusinessAccount?.id))
    return filteredControls
  }

  removeInUnloadingMaterialExpense(i) {
    this.unloadingMaterialExpenses.removeAt(i);
  }

  get labourExpenses() {
    return this.containerForm
      .get('containerExpense')
      .get('labourExpenses') as UntypedFormArray;
  }

  addInLabourExpense() {
    const Form =   this.containerFormService.labourExpenseForm()
    Form.get('addedByBusinessAccountId').setValue(this.currentBusinessAccount?.id)
    Form.get('cost').get('userConversionUom').setValue(this.isExport ? this.getUomByName('exportCost') : this.getUomByName('importCost'))
    this.labourExpenses.push(Form);
  }

  getFilteredLabourExpenses() {
    let filteredControls = this.labourExpenses.controls.filter((item)=> (item.get('addedByBusinessAccountId').value==this.currentBusinessAccount?.id))
    return filteredControls
  }

  removeInLabourExpense(i) {
    this.labourExpenses.removeAt(i);
  }

  getContainerProducts(i) {
    return this.containerOrders.controls[i].get(
      'containerProducts'
    ) as UntypedFormArray;
  }

  addInOrderPalletInformations(i, j) {
    this.getOrderPalletInformations(i, j).push(
      this.containerFormService.orderPalletForm()
    );
  }

  removeInOrderPalletInformations(i, j, k) {
    this.getOrderPalletInformations(i, j).removeAt(k);
  }

  getOrderPalletInformations(i, j) {
    const containerProducts = this.containerOrders.controls[i].get(
      'containerProducts'
    ) as UntypedFormArray;
    if(this.isExport) {
      const orderPalletLoadedInformations = containerProducts.controls[j].get(
        'orderPalletLoadedInformations'
      ) as UntypedFormArray;
      return orderPalletLoadedInformations;
    }
    else {
      const orderPalletReceivedInformations  = containerProducts.controls[j].get(
        'orderPalletReceivedInformations'
      ) as UntypedFormArray;
      return orderPalletReceivedInformations ;

    }

  }

  rate(rating, item: UntypedFormGroup) {
    if (rating == 1 && item.get('rating').value === 1) {
      item.get('rating').setValue(null);
    } else {
      item.get('rating').setValue(rating);
    }
  }

  calculateValues() {
    this.calculate.emit();
  }

  filterLabourList(labourList: any, id: any) {
    if (id) {
      return labourList.filter((item) => item.containerExpenseTypeId == id);
    } else {
      return labourList;
    }
  }

  filterExpenseTypes(expenseTypesList: any, j: any) {
    for (let i = 0; i < this.labourExpenses.controls.length; i++) {
      expenseTypesList = expenseTypesList.filter(
        (item) =>
          (item?.id?.toString() !== this.labourExpenses.controls[i]?.value.containerExpenseTypeId?.toString() &&  item?.containerExpenseCategory == 'LABOR')   ||
          (item?.id?.toString() == this.labourExpenses.controls[j]?.value.containerExpenseTypeId?.toString()) ||
          (item?.description != 'Unloading Manager' &&  item?.containerExpenseCategory == 'LABOR')
      );
    }
    return expenseTypesList;
  }
    onSelectServiceProvider(event, control) {
    const contact = this.containerService.labourList.find(
      (item) =>
        item.amountPayableTo + item.containerExpenseTypeId?.toString() ==
        event + control.get('containerExpenseTypeId').value?.toString()
    );
    if (contact) {

      control.patchValue(contact);
    }
  }

  printReport() {
    let data: any = {};
    data.type = 'unloadingsheet';
    data.containerForm = this.containerForm.getRawValue();
    this.printService.printData(data);
  }


  getUomByName(type:any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find((item)=> item.attributeName?.toUpperCase()==type?.toUpperCase())?.userConversionUom
  }
}
