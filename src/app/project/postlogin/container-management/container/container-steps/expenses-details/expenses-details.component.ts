import { Component, EventEmitter, Input, OnInit, Output, Pipe, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject, takeUntil } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';
import { MatOption } from '@angular/material/core';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinInputComponent } from '../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { NgClass, NgStyle, SlicePipe } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-expenses-details',
    templateUrl: './expenses-details.component.html',
    styleUrls: ['./expenses-details.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        DadyinInputComponent,
        DadyinButtonComponent,
        MatAutocompleteTrigger,
        NgClass,
        ExtendedModule,
        MatAutocomplete,
        MatOption,
        NgStyle,
        SlicePipe
    ]
})
export class ExpensesDetailsComponent implements OnInit, OnDestroy {
  @Input() isExport: any;
  expanded:any[]=[]
  @Input() componentUoms: any;
  @Input() containerForm: UntypedFormGroup;
  @Input() currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public purchaseOrdersList: any[] = [];
  @Output()     calculate = new EventEmitter();

  expenseView: any = 'Product';


  constructor(
    public fb: UntypedFormBuilder,
    public containerService: ContainerManagementService,
    public containerFormService: ContainerFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService
  ) {}

  async ngOnInit() {

  }

   ngOnDestroy(): void {
   this.ngUnsubscribe.next()
   this.ngUnsubscribe.complete()
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

  getAttributeUserConversionUom(value: any): any {
    return this.containerForm.get(value).get('userConversionUom');
  }
  getAttributeAttributeValue(value: any): any {
    return this.containerForm.get(value).get('attributeValue');
  }

  get miscellaneousExpenses() {
    return this.containerForm.get('containerExpense').get('miscellaneousExpenses') as UntypedFormArray
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

  getContainerProducts(i) {
    return this.containerOrders.controls[i].get('containerProducts') as UntypedFormArray;
  }

  calculateValues() {
    this.calculate.emit();
  }


  addInmiscellaneousExpensesExpense() {
    const Form =   this.containerFormService.miscellaneousExpenseForm()
    Form.get('addedByBusinessAccountId').setValue(this.currentBusinessAccount?.id)
    Form.get('cost').get('userConversionUom').setValue(this.isExport ? this.getUomByName('exportCost') : this.getUomByName('importCost'))
    this.miscellaneousExpenses.push(Form);
  }

  getFilteredMiscellaneousExpenses() {
    let filteredControls = this.miscellaneousExpenses.controls.filter((item)=> (item.get('addedByBusinessAccountId').value==this.currentBusinessAccount?.id))
    return filteredControls
  }

  removeInmiscellaneousExpensesExpense(i) {

    this.miscellaneousExpenses.removeAt(i);
  }

    filterLabourList(labourList:any,id:any) {
    if(id) {
      return labourList.filter((item)=>item.containerExpenseTypeId==id)
    }
    else {
      return labourList
    }
  }

  filterExpenseTypes(expenseTypesList: any,j : any) {
    for (let i = 0; i < this.miscellaneousExpenses.controls.length; i++) {
      expenseTypesList = expenseTypesList.filter(
        (item) =>(( item?.id?.toString() !==    this.miscellaneousExpenses.controls[i]?.value.containerExpenseTypeId?.toString()) && (item?.containerExpenseCategory == 'MISCELLANEOUS')) || ( item?.id?.toString() ==    this.miscellaneousExpenses.controls[j]?.value.containerExpenseTypeId?.toString())
      );
    }
    return expenseTypesList;
  }


  getExpenseTypeCategory(containerExpenseTypeId) {
    let item = this.containerService.expenseTypes.find((item) =>(( item?.id?.toString() == containerExpenseTypeId?.toString()) ))
    if (item) {
      if (item?.containerExpenseCategory=='EXPENSE_SUMMARY') {
        return true
      }
      else {
        return false
      }
    }
    else {
      return false
    }

  }

  getExpenseTypeName(containerExpenseTypeId:any) {
    let item = this.containerService.expenseTypes.find((item) =>(( item?.id?.toString() == containerExpenseTypeId?.toString()) ))
    if (item) {
      if (item?.containerExpenseCategory=='EXPENSE_SUMMARY') {
        return item?.description
      }
      else {
        return ''
      }
    }
    else {
      return ''
    }
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
  getUomByName(type:any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find((item)=> item.attributeName?.toUpperCase()==type?.toUpperCase())?.userConversionUom
  }
}
