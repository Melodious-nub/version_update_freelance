import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';

@Component({
  selector: 'app-container-info',
  templateUrl: './container-info.component.html',
  styleUrls: ['./container-info.component.scss'],
})
export class ContainerInfoComponent implements OnInit {
  @Input() isExport: any;
  expanded: any[] = [];
  @Input() containerForm: UntypedFormGroup;
  @Input() componentUoms: any;
  @Input() currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public purchaseOrdersList: any[] = [];

  @Output() calculate = new EventEmitter();

  constructor(
    public fb: UntypedFormBuilder,
    public containerService: ContainerManagementService,
    public containerFormService: ContainerFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService
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

  getAttributeUserConversionUom(value: any): any {
    return this.containerForm.get(value).get('userConversionUom');
  }
  getAttributeAttributeValue(value: any): any {
    return this.containerForm.get(value).get('attributeValue');
  }

  get finalContactDetails() {
    return this.containerForm
      .get('containerExpense')
      .get('containerContacts') as UntypedFormArray;
  }

  addInFinalContact() {
    const Form = this.containerFormService.containerContactForm();
    Form.get('addedByBusinessAccountId').setValue(
      this.currentBusinessAccount?.id
    );
    if (this.isExport) {
      Form.get('forExporter').setValue(true);
    } else {
      Form.get('forImporter').setValue(true);
    }
    Form.get('cost')
      .get('userConversionUom')
      .setValue(
        this.isExport
          ? this.getUomByName('exportCost')
          : this.getUomByName('importCost')
      );
    this.finalContactDetails.push(Form);
  }
  getFilteredFinalContactDetail() {
    let filteredControls = this.finalContactDetails.controls.filter(
      (item) =>
        item.get('addedByBusinessAccountId').value ==
        this.currentBusinessAccount?.id
    );
    return filteredControls;
  }

  removeInFinalContact(i) {
    this.finalContactDetails.removeAt(i);
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

  filterLabourList(labourList: any, id: any) {
    if (id) {
      return labourList.filter((item) => item.containerExpenseTypeId == id);
    } else {
      return [];
    }
  }

  filterExpenseTypes(expenseTypesList: any, j: any) {
    for (let i = 0; i < this.finalContactDetails.controls.length; i++) {
      expenseTypesList = expenseTypesList.filter(
        (item) =>
          (item?.id?.toString() !==
            this.finalContactDetails.controls[
              i
            ]?.value.containerExpenseTypeId?.toString() &&
            item?.containerExpenseCategory == 'SERVICES') ||
          item?.id?.toString() ==
            this.finalContactDetails.controls[
              j
            ]?.value.containerExpenseTypeId?.toString()
      );
    }
    return expenseTypesList;
  }

  share(item) {
    if (this.isExport) {
      item.get('forImporter').setValue(true);
      this.calculate.emit();
    } else {
      item.get('forExporter').setValue(true);
      this.calculate.emit();
    }
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }
}
