import { Component, input, output } from '@angular/core';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'product-types',
    templateUrl: './product-types.component.html',
    styleUrls: ['./product-types.component.scss'],
    imports: [
        NgClass,
        ExtendedModule
    ]
})
export class ProductTypesComponent {
  readonly pageTitle = input<string>('Product Type');
  readonly types = input<any>([]);

  readonly getValues = output<any>();

  selected_types: any = [];

  constructor() {}

  selectedTypes(type: string) {
    if (this.selected_types.includes(type)) {
      const index = this.selected_types.indexOf(type);
      if (index > -1) {
        this.selected_types.splice(index, 1);
      }
    } else {
      this.selected_types.push(type);
    }
    this.getValues.emit(this.selected_types);
  }
}
