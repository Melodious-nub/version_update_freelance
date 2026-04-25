import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'dadyin-searchable-select',
    templateUrl: './dadyin-searchable-select.component.html',
    styleUrls: ['./dadyin-searchable-select.component.scss'],
    imports: [
        NgClass,
        ExtendedModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatTooltip
    ]
})
export class DadyinSearchableSelectComponent implements OnChanges{
  @Input() class: any;
  @Input() label: any;
  @Input() fullItems: any;
  @Input() bindValue: any = 'id';
  @Input() bindLabel: any = 'description';
  @Input() control: any = new UntypedFormControl();
  @Input() placeholder: any = '';
  @Output() changed: any = new EventEmitter();
  @Input() isDisabled: any = false;
  @Input('disabled') set _isDisabled(val: boolean) { this.isDisabled = val; }
  @Input() multiple = false;
  @Input() optionTag = null;
  @Input() required: any = false;

  @Input() marginBottom=true
  @Input() clearable: any =false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isDisabled'] || changes['disabled']) && this.control) {
      if (this.isDisabled) {
        this.control.disable();
      } else {
        this.control.enable();
      }
    }
  }

  customSearchFn = (term: string, item: any): boolean => {
    if (!term || !item) return false;
    const itemText = item[this.bindLabel]
      ?.toString()
      .toLowerCase()
      .replace(/,/g, '');
    if (!itemText) return false;
    const [firstPart, secondPart = ''] = term
      .split(',')
      .map((part) => part.trim());
    const keywords = firstPart
      .split(' ')
      .map((word) =>
        (word + (secondPart ? ` ${secondPart}` : '')).toLowerCase()
      );
    // Also check the original term in case there's no comma
    if (!term.includes(',')) {
      keywords.push(term.toLowerCase());
    }
    return keywords.some((keyword) => {
      const keywordParts = keyword.split(' ');
      return keywordParts.every((part) => itemText.includes(part));
    });
  };

  onChange() {
    this.changed.emit(this.control?.value);
  }

  returnAddress(item) {
    if (!item || !item.address) {
      return '';
    }
    const addressFields = [
      item.address.addressLine,
      item.address.addressCity,
      item.address.addressState,
      item.address.addressZipCode,
      item.address.addressCountry,
    ].filter((field) => !!field);
    return addressFields.join(',');
  }
}
