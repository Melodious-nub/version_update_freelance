import { Component, Input, OnInit, Pipe,Output,EventEmitter } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from '../../../service/container-management.service';
import { Subject, takeUntil } from 'rxjs';
import { ContainerFormsService } from '../../../service/container-forms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-documents-details',
  templateUrl: './documents-details.component.html',
  styleUrls: ['./documents-details.component.scss'],
})
export class DocumentsDetailsComponent implements OnInit {
  imgUrl=environment.imgUrl
  @Input() isExport: any;
  expanded:any[]=[]
  imageToShow:any
  @Input() containerForm: UntypedFormGroup;

  @Input() currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public purchaseOrdersList: any[] = [];
  documentForm: UntypedFormGroup=this.containerFormService.documentForm();
  @Output() calculate = new EventEmitter();
  file:any
  constructor(
    public fb: UntypedFormBuilder,
    public containerService: ContainerManagementService,
    public containerFormService: ContainerFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public apiService:ApiService
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



  get documents() {
    return this.containerForm
      .get('documents') as UntypedFormArray;
  }

 async uploadDocument(event: any,i:any) {
    try {
       this.file=null
      this.file=event.target.files[0]
      const res:any = await this.apiService.uploadFiles([this.file]);
      
      this.documents.controls[i].get('fileName').patchValue(res.data[0]?.media_url)
      // this.file=null
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
     ;
    }
  }

  removeDocument(i) {
    this.documents.removeAt(i);
  }

  addDocument() {
    const Form = this.containerFormService.documentForm()
    Form.get('addedByBusinessAccountId').setValue(this.currentBusinessAccount?.id)
    this.documents.push(Form);
  }

  getFilteredDocuments() {
    let filteredControls = this.documents.controls.filter((item)=> (item.get('addedByBusinessAccountId').value==this.currentBusinessAccount?.id))
    return filteredControls
  }

 



}
