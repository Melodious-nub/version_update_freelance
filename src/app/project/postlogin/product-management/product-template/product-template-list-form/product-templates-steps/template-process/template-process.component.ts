import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { UntypedFormArray, FormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ConfirmationDialogComponent } from './components/process/edit-process/components/select-process-name/confirmation-dialog/confirmation-dialog.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent } from '@angular/material/expansion';
import { RawMaterialProcessComponent } from './components/process/raw-material-process/raw-material-process.component';
import { ProcessComponent } from './components/process/process.component';


@Component({
    selector: 'template-process',
    templateUrl: './template-process.component.html',
    styleUrls: ['./template-process.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        ProcessComponent,
        RawMaterialProcessComponent,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelContent
    ]
})
export class TemplateProcessComponent implements OnInit {
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  uomService = inject(UomService);

  // ************* Variable Declarations *************

  @Input() templateForm: UntypedFormGroup;
  @Input() componentUoms: any;

  @Output() calculate = new EventEmitter();

  calculateValues(event: any) {
    this.calculate.emit(event);
  }

  async ngOnInit() {
    this.templateForm.markAsUntouched({ onlySelf: true })
  }



  getDefaultUom(attributeName: string) {
    const attribute = this.apiService.allAttributes.find(
      (item) => item.description?.toUpperCase() == attributeName?.toUpperCase()
    );
    const attributeType = this.apiService.allAttributesTypes.find(
      (item) => item.id == attribute?.attributeTypeId
    );
    return attributeType?.defaultUom ?? [];
  }


  getUomByName(type: any) {
    const componentUoms: any = this.componentUoms.getRawValue();
    return componentUoms.find((item) => item.attributeName?.toUpperCase() == type?.toUpperCase())?.userConversionUom
  }


  get rawMaterialProcess() {
    return this.templateForm.get('rawMaterialProcess');
  }

  get fixedProcess() {
    return this.templateForm.get('fixedProcess');
  }

  get templateProcessType() {
    return this.templateForm.get('templateProcessType');
  }

  get templateProcesses() {
    return this.templateForm.get('templateProcesses') as UntypedFormArray;
  }
}
