import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UomService } from 'src/app/service/uom.service';
import { ProductManagementService } from '../../../service/product-management.service';
import { ProductTypeFormService } from '../../service/product-type-form.service';
import { MatOption } from '@angular/material/core';

import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';

@Component({
    selector: 'app-additional-cost-common',
    templateUrl: './additional-cost-common.component.html',
    styleUrls: ['./additional-cost-common.component.scss'],
    standalone: true,
    imports: [
    FormsModule,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    DadyinButtonComponent,
    MatAutocomplete,
    MatOption
],
})
export class AdditionalCostCommonComponent implements OnInit {
  @Input() additionalCosts: UntypedFormArray;
  additionalCostList: any;
  searchControl = new UntypedFormControl(null);

  constructor(
    private toastr: ToastrService,
    public apiService: ProductManagementService,
    public productTypeFormService: ProductTypeFormService,
    public uomService: UomService
  ) {}

  ngOnInit(): void {
    this.loadAdditionalCostValue();
  }

  loadAdditionalCostValue() {
    this.apiService.getAdditionalCostValue().subscribe((data: any) => {
      this.additionalCostList = data;
    });
  }

  isAdditionalCostExist(item) {
    const selectedAdditionalCosts = this.additionalCosts.value.map(
      (itm) => itm.id
    );
    return selectedAdditionalCosts.includes(item.id) ? true : false;
  }

  addNew(value: any) {
    if (!value) {
      this.toastr.error('Please provide name');
      return;
    }
    const form = this.productTypeFormService.createAdditionalCostForm();
    form.get('description').setValue(value);
    this.additionalCosts.push(form);
  }

  addSelectedItem(item) {
    const form = this.productTypeFormService.createAdditionalCostForm();
    form.patchValue(item);
    this.additionalCosts.push(form);
    this.searchControl.setValue(null);
  }

  removeAdditionalcost(i) {
    this.additionalCosts.removeAt(i);
  }
  removeAcValue(i, j) {
    const fg = this.additionalCosts.controls[i].get(
      'additionalCostValues'
    ) as UntypedFormArray;
    fg.removeAt(j);
  }

  addAcValue(i) {
    const fg = this.additionalCosts.controls[i].get(
      'additionalCostValues'
    ) as UntypedFormArray;
    const form = this.productTypeFormService.createAdditionalCostValueForm();
    fg.push(form);
  }
}
