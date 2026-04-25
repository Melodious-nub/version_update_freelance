
import { Component, OnInit, Input, forwardRef, ChangeDetectorRef, AfterContentChecked, OnChanges, SimpleChanges, inject, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, UntypedFormControl, ControlContainer } from '@angular/forms';
import { CommonService } from 'src/app/service/common.service';




@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true },
    ],
    imports: []
})
export class TimePickerComponent implements OnInit, ControlValueAccessor, AfterContentChecked, OnChanges {
  private commonService = inject(CommonService);
  private controlContainer = inject(ControlContainer);
  private cdr = inject(ChangeDetectorRef);


  readonly class = input('');
  @Input() label = '';
  readonly leftHint = input('');
  readonly rightHint = input('');
  readonly customError = input('');
  readonly formControlName = input('');
  readonly inputWidth = input('100%');
  readonly isRequired = input<boolean>(false);
  readonly placeholder = input('');
  readonly format = input(24); // kept for API compatibility, native input always uses HH:mm
  readonly minutesGap = input(5);
  @Input() disabled: boolean = false;

  control!: UntypedFormControl;

  onChange: any = () => { };
  onTouched: any = () => { };

  @Input('value') _value: any;
  set value(val: any) { this._value = val; }
  get value() { return this._value; }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    if (this.controlContainer?.control) {
      this.control = this.controlContainer.control.get(this.formControlName()) as UntypedFormControl;
      this.syncDisabledToControl();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled']) {
      this.syncDisabledToControl();
    }
  }

  writeValue(obj: any) {
    this.value = obj ?? '';
  }

  onTimeSet(event: Event) {
    const next = (event.target as HTMLInputElement).value ?? '';
    this.value = next;
    this.onChange(next);
    this.onTouched();
    if (this.control && this.control.value !== next) {
      this.control.setValue(next, { emitEvent: false });
    }
  }

  registerOnChange(fn: Function) { this.onChange = fn; }

  registerOnTouched(fn: Function) { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = !!isDisabled;
    this.syncDisabledToControl();
  }

  private syncDisabledToControl() {
    if (!this.control) return;
    if (this.disabled) {
      if (!this.control.disabled) this.control.disable({ emitEvent: false });
    } else {
      if (this.control.disabled) this.control.enable({ emitEvent: false });
    }
  }

  showFieldError() {
    return !!(this.control?.errors && (this.control.dirty || this.control.touched));
  }

  getFieldErrorDesc() {
    const customError = this.customError();
    if (customError?.length) return customError;
    return this.commonService.getFieldErrorDesc(this.control);
  }
}
