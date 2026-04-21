import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'dadyin-radio-button',
  templateUrl: './dadyin-radio-button.component.html',
  styleUrls: ['./dadyin-radio-button.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinRadioButtonComponent) },
  ]
})
export class DadyinRadioButtonComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  @Input() label = "";
  @Input() value: any;
  @Input() customclass = '';
  @Input('controlName') formControlName: string;
  formControl: UntypedFormControl;

  @Input() options: any[] = [];
  @Output() valueChange = new EventEmitter<string>();

  onValueChange(event: any) {
    this.valueChange.emit(event);
  }
}
