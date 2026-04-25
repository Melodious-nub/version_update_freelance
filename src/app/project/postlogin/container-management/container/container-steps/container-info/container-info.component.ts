import { Component, OnDestroy, inject, input, output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';
import { MatOption } from '@angular/material/core';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSelectComponent } from '../../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgStyle, SlicePipe } from '@angular/common';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-container-info',
    templateUrl: './container-info.component.html',
    styleUrls: ['./container-info.component.scss'],
    imports: [
        FormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        NgStyle,
        ExtendedModule,
        MatExpansionPanelContent,
        ReactiveFormsModule,
        DadyinInputComponent,
        DadyinSelectComponent,
        DadyinButtonComponent,
        MatAutocompleteTrigger,
        MatAutocomplete,
        MatOption,
        SlicePipe
    ]
})
export class ContainerInfoComponent implements OnDestroy{
  fb = inject(UntypedFormBuilder);
  containerService = inject(ContainerManagementService);
  containerFormService = inject(ContainerFormsService);
  formsService = inject(FormsService);
  route = inject(ActivatedRoute);
  toastr = inject(ToastrService);
  uomService = inject(UomService);

  readonly isExport = input<any>(undefined);
  expanded: any[] = [];
  readonly containerForm = input<UntypedFormGroup>(undefined);
  readonly componentUoms = input<any>(undefined);
  readonly currentBusinessAccount = input<any>(undefined);
  private ngUnsubscribe: Subject<void> = new Subject();
  public purchaseOrdersList: any[] = [];

  readonly calculate = output<any>();

  async

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
    return this.containerForm().get(value).get('userConversionUom');
  }
  getAttributeAttributeValue(value: any): any {
    return this.containerForm().get(value).get('attributeValue');
  }

  get finalContactDetails() {
    return this.containerForm()
      .get('containerExpense')
      .get('containerContacts') as UntypedFormArray;
  }

  addInFinalContact() {
    const Form = this.containerFormService.containerContactForm();
    Form.get('addedByBusinessAccountId').setValue(
      this.currentBusinessAccount()?.id
    );
    const isExport = this.isExport();
    if (isExport) {
      Form.get('forExporter').setValue(true);
    } else {
      Form.get('forImporter').setValue(true);
    }
    Form.get('cost')
      .get('userConversionUom')
      .setValue(
        isExport
          ? this.getUomByName('exportCost')
          : this.getUomByName('importCost')
      );
    this.finalContactDetails.push(Form);
  }
  getFilteredFinalContactDetail() {
    let filteredControls = this.finalContactDetails.controls.filter(
      (item) =>
        item.get('addedByBusinessAccountId').value ==
        this.currentBusinessAccount()?.id
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
    if (this.isExport()) {
      item.get('forImporter').setValue(true);
      this.calculate.emit(undefined as any);
    } else {
      item.get('forExporter').setValue(true);
      this.calculate.emit(undefined as any);
    }
  }

  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms().getRawValue();
    return componentUoms.find(
      (item) => item.attributeName?.toUpperCase() == type?.toUpperCase()
    )?.userConversionUom;
  }
}
