
import { Component, OnInit, Input, forwardRef, ChangeDetectorRef, AfterContentChecked, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, UntypedFormControl, ControlContainer } from '@angular/forms';
import { CommonService } from 'src/app/service/common.service';




@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    styleUrls: ['./time-picker.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimePickerComponent), multi: true },
    ],
    standalone: true,
    imports: []
})
export class TimePickerComponent implements OnInit, ControlValueAccessor, AfterContentChecked, OnChanges {

  @Input() class = '';
  @Input() label = '';
  @Input() leftHint = '';
  @Input() rightHint = '';
  @Input() customError = '';
  @Input() formControlName = '';
  @Input() inputWidth = '100%';
  @Input() isRequired: boolean = false;
  @Input() placeholder = '';
  @Input() format = 24; // kept for API compatibility, native input always uses HH:mm
  @Input() minutesGap = 5;
  @Input() disabled: boolean = false;

  control!: UntypedFormControl;

  onChange: any = () => { };
  onTouched: any = () => { };

  @Input('value') _value: any;
  set value(val: any) { this._value = val; }
  get value() { return this._value; }

  constructor(private commonService: CommonService, private controlContainer: ControlContainer, private cdr: ChangeDetectorRef) { }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    if (this.controlContainer?.control) {
      this.control = this.controlContainer.control.get(this.formControlName) as UntypedFormControl;
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
    if (this.customError?.length) return this.customError;
    return this.commonService.getFieldErrorDesc(this.control);
  }
}
