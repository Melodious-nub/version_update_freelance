import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product-template',
    templateUrl: './product-template.component.html',
    styleUrls: ['./product-template.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class ProductTemplateComponent implements OnInit {

  public templateProcesses: UntypedFormArray = this.fb.array([
    this.formsService.createProcessForm(),
  ]);

  constructor(private fb:UntypedFormBuilder,private formsService:FormsService) {}

  ngOnInit(): void {}
}
