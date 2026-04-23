import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { ApiService } from 'src/app/service/api.service';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgIf, NgFor, SlicePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-lead-filter-box',
    templateUrl: './lead-filter-box.component.html',
    styleUrls: ['./lead-filter-box.component.scss'],
    standalone: true,
    imports: [
        MatIcon,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        NgFor,
        NgSelectModule,
        MatTooltip,
        DadyinButtonComponent,
        SlicePipe,
    ],
})
export class LeadFilterBoxComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.openFilter = false;
  }
  openFilter = false;
  leadfilterCount = 0;
  filterForm: UntypedFormGroup;

  @Output() emitFilterLeads: EventEmitter<any> = new EventEmitter();
  constructor(
    private fb: UntypedFormBuilder,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService
  ) {
    this.filterForm = this.fb.group({
      relationAccountName: [],
      phone: [],
      addressLine: [],
      addressCity: [null],
      addressZipCode: [null],
      assignedSalesId: [null],
      relationStatusId: [null],
    });
  }

  ngOnInit(): void {
    this.businessAccountService.Get_All_employees();
    let leadFilter = JSON.parse(localStorage.getItem('leadFilter'));
    if (leadFilter != null) {
      this.filterForm.patchValue(leadFilter);
    }
    let count = JSON.parse(localStorage.getItem('leadfilterCount'));
    if (count != null) {
      this.leadfilterCount = count;
    }
  }

  clearFilter() {
    this.filterForm.reset();
    this.leadfilterCount = 0;
    localStorage.removeItem('leadFilter');
    localStorage.removeItem('leadfilterCount');
    this.emitFilterLeads.emit(null);
  }

  apply() {
    this.leadfilterCount = 0;
    const formValues = this.filterForm.value;
    const queryParams = Object.keys(formValues)
      .filter(
        (key) =>
          formValues[key] !== null &&
          formValues[key] !== undefined &&
          formValues[key] !== ''
      )
      .map((key) => {
        this.leadfilterCount++;
        if (key == 'assignedSalesId') {
          const formattedKey = formValues[key]
            .map((id) => `*%23${id}%23*`)
            .join(',');
          return `${encodeURIComponent(key)}~'${formattedKey}'`;
        }
        if (key == 'relationAccountName') {
          return `${encodeURIComponent(key)}~'%*${formValues[key]}%*'`;
        }
        if (key == 'addressLine') {
          return `address.addressLine~'%*${formValues[key]}*%'`;
        }


        return `${encodeURIComponent(key)}~'%*${encodeURIComponent(
          formValues[key]
        )}*%'`;
      })
      .join('&filter=');
    const updatedQueryParams = queryParams
      .replace(/addressCity/g, 'address.addressCity')
      .replace(/addressZipCode/g, 'address.addressZipCode');
    this.emitFilterLeads.emit(updatedQueryParams);
    if (this.leadfilterCount > 0) {
      localStorage.setItem('leadfilterCount', this.leadfilterCount.toString());
      localStorage.setItem('leadFilter', JSON.stringify(formValues));
    }
    this.openFilter = false;
  }
}
