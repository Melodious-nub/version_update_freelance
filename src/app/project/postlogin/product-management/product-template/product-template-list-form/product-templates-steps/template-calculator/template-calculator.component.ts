import { productTemplate } from '../../../../../../../shared/constant';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { ProductTemplateService } from '../../../service/product-template.service';
@Component({
  selector: 'template-calculator',
  templateUrl: './template-calculator.component.html',
  styleUrls: ['./template-calculator.component.scss'],
})
export class TemplateCalculatorComponent implements OnInit {

  // ************* Variable Declarations *************
  @Input() templateForm: UntypedFormGroup;

  currentStepIndex = 0

  calculatorType = new UntypedFormControl('product');
  constructor(
    public dialog: MatDialog,
    public apiService: ApiService,
    public route: ActivatedRoute,
    public productTemplateService: ProductTemplateService,
  ) {

  }

  ngOnInit(): void {

  }



  get productTemplateCalculator() {
    return this.templateForm.get('productTemplateCalculator');
  }




}
