import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderManagementFormsService } from '../../service/order-management-forms.service';
import { OrderManagementService } from '../../service/order-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { DadyinInputComponent } from '../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-create-note',
    templateUrl: './create-note.component.html',
    styleUrls: ['./create-note.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        DadyinInputComponent,
        NgSelectModule,
    ],
})
export class CreateNoteComponent implements OnInit {

  noteForm: UntypedFormGroup
  selectedAttributes: any[] = []
  attributes: any[]=[]
  allTransactionCategories: any = []
  private ngUnsubscribe: Subject<void> = new Subject();
  constructor(
    public toastr: ToastrService,
    public ordermanagementFormService: OrderManagementFormsService,
    public ordermanagementService: OrderManagementService,
    public fb: UntypedFormBuilder,
    public apiService: ApiService,
    public router:Router,
    public route:ActivatedRoute

  ) {
    this.noteForm=this.ordermanagementFormService.noteForm()
    this.getAllTransactionCategories()

  
  }

  ngOnInit(): void {
      if (this.route.snapshot.params.id) {
      this.ordermanagementService
        .getNoteTypeById(this.route.snapshot.params.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (res: any) => {
          this.noteForm.patchValue(res)
        });
    }
  }


  

  getAllTransactionCategories() {
    this.apiService.Get_ALl_Transaction_Categories().subscribe((res: any) => {
      this.allTransactionCategories = res
      this.allTransactionCategories = this.allTransactionCategories.map((item) => ({ "description": item, "id": item }))
    })
  }

  saveNotes() {
    let formData = this.noteForm.getRawValue()   
    this.ordermanagementService.saveNotes(formData).subscribe((res) => {
      this.toastr.success('Successfully Saved !');
      this.router.navigateByUrl('/home/system-config/order-management?currentStepIndex=1')
    }, (err) => {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    })
  }

  get transaction_categories() {
    return this.noteForm.get('transaction_categories')
  }



  navigate(link: any) {
    this.router.navigateByUrl(link)
  }


  public onSelectAll() {
    const selected = this.allTransactionCategories.map(item => item.id);
    this.transaction_categories.patchValue(selected);
  }
  
  public onClearAll() {
    this.transaction_categories.patchValue(null);
  }

  onOption(event:any) {
   if(event.target.checked) {
   this.onSelectAll()
   }
   else {
    this.onClearAll()
   }
}

}