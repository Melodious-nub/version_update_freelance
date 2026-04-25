import { Component, Input, OnChanges, SimpleChanges, input, output } from '@angular/core';
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
  readonly class = input<any>(undefined);
  readonly label = input<any>(undefined);
  readonly fullItems = input<any>(undefined);
  readonly bindValue = input<any>('id');
  readonly bindLabel = input<any>('description');
  readonly control = input<any>(new UntypedFormControl());
  readonly placeholder = input<any>('');
  readonly changed = output<any>();
  @Input() isDisabled: any = false;
  @Input('disabled') set _isDisabled(val: boolean) { this.isDisabled = val; }
  readonly multiple = input(false);
  readonly optionTag = input(null);
  readonly required = input<any>(false);

  readonly marginBottom = input(true);
  readonly clearable = input<any>(false);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    const control = this.control();
    if ((changes['isDisabled'] || changes['disabled']) && control) {
      if (this.isDisabled) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }

  customSearchFn = (term: string, item: any): boolean => {
    if (!term || !item) return false;
    const itemText = item[this.bindLabel()]
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
    this.changed.emit(this.control()?.value);
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
