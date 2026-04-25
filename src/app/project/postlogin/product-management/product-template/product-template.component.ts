import { Component, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product-template',
    templateUrl: './product-template.component.html',
    styleUrls: ['./product-template.component.scss'],
    imports: [RouterOutlet]
})
export class ProductTemplateComponent {
  private fb = inject(UntypedFormBuilder);
  private formsService = inject(FormsService);


  public templateProcesses: UntypedFormArray = this.fb.array([
    this.formsService.createProcessForm(),
  ]);
}
