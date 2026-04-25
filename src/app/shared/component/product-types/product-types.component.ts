import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class ProductTypesComponent implements OnInit {
  @Input() pageTitle: string = 'Product Type';
  @Input() types: any = [];

  @Output() getValues = new EventEmitter<any[]>();

  selected_types: any = [];

  constructor() {}

  ngOnInit(): void {}

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
