import { NgIf, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-process-list',
    templateUrl: './process-list.component.html',
    styleUrls: ['./process-list.component.scss'],
    standalone: true,
    imports: [MatExpansionModule, NgFor],
})
export class ProcessListComponent implements OnInit {
  @Input() processData: any;

  newProcessProducts: UntypedFormArray = this.fb.array([]);

  constructor(public fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    if (this.processData?.controls.length > 0) {
      this.readyNewArrayOfProcessProducts();
    }
  }

  readyNewArrayOfProcessProducts() {
    this.processData?.controls.forEach((process: any) => {
      this.getprocessProducts(process).controls.forEach(
        (processproduct: UntypedFormGroup) => {
          this.newProcessProducts?.push(processproduct);
        }
      );
    });


    let uniqueArrayIds = [];
    let uniqueArray = [];

    this.newProcessProducts.controls.forEach((c, index) => {
      if (
        uniqueArrayIds.includes(
          this.getAttribute(c, 'subProductId').value.toString()
        )
      ) {
        this.newProcessProducts.controls.splice(index, 1)
      }
      else {
        uniqueArrayIds.push(
          this.getAttribute(c, 'subProductId').value.toString()
        );
      }
    });

  }

  getprocessProducts(process) {
    return process.get('process').get('processProducts');
  }

  getAttribute(process: any, value: string): any {
    return process.get(value);
  }

  getAttributeValue(process, attr: string) {
    return this.getAttribute(process, attr).get('attributeValue');
  }

  getUserConversionUom(process, attr: string) {
    return this.getAttribute(process, attr).get('userConversionUom');
  }
}
