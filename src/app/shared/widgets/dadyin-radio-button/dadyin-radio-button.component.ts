import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatLabel } from '@angular/material/form-field';

@Component({
    selector: 'dadyin-radio-button',
    templateUrl: './dadyin-radio-button.component.html',
    styleUrls: ['./dadyin-radio-button.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinRadioButtonComponent) },
    ],
    standalone: true,
    imports: [MatLabel, MatRadioGroup, MatRadioButton]
})
export class DadyinRadioButtonComponent {

  constructor() { }
  @Input() label = "";
  @Input() value: any;
  @Input() customclass = '';
  @Input('disabled') isDisabled = false;
  @Input('controlName') formControlName: string;
  formControl: UntypedFormControl;

  @Input() options: any[] = [];
  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: any) {
    this.valueChange.emit(event);
  }
}
