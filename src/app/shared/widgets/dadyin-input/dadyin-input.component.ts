import { Component, OnInit, Input, ChangeDetectorRef, AfterContentChecked, HostListener, inject, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ControlContainer, UntypedFormControl, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from 'src/app/service/common.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'dadyin-input',
    templateUrl: './dadyin-input.component.html',
    styleUrls: ['./dadyin-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DadyinInputComponent,
            multi: true,
        },
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        ExtendedModule,
        NgStyle
    ]
})
export class DadyinInputComponent
  implements OnInit, ControlValueAccessor, AfterContentChecked
{
  private commonService = inject(CommonService);
  private controlContainer = inject(ControlContainer, { optional: true });
  private cdr = inject(ChangeDetectorRef);

  @Input() height: string | null = null;
  @Input() fontSize: string | null = null;
  readonly class = input<string>('');
  readonly inputType = input<string>('text');
  @Input() label: string = '';
  readonly rows = input(undefined);
  readonly labelBackground = input<string>('#fffff');
  readonly placeholder = input<string>('');
  readonly isClearable = input<boolean>(false);
  @Input() isDisabled: boolean = false;
  @Input('disabled') set _isDisabled(val: boolean) { this.isDisabled = val; }
  readonly formControlName = input<string>('');
  readonly formControl = input<UntypedFormControl | null>(null); // New input for direct FormControl
  readonly customError = input<string>('');
  readonly noPaste = input<boolean>(false);
  readonly isErrorClass = input<boolean>(false);
  readonly convertUpperCase = input<boolean>(false);
  readonly minDate = input<any>(undefined);        

  readonly blurEvent = output<any>();
  readonly clickedEvent = output<any>();
  readonly keyupEvent = output<any>();
  readonly selectedStateChange = output<any>();

  control: UntypedFormControl | null = null;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};
  pwToggle: boolean = false;
  validationRequired: boolean = false;

  private _value: string = '';

  @Input()
  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  get value(): string {
    return this._value;
  }

  @HostListener('paste', ['$event'])
  blockPaste(e: ClipboardEvent) {
    if (this.noPaste()) {
      e.preventDefault();
    }
  }

  ngOnInit(): void {
    // Priority 1: Use directly provided formControl
    const formControl = this.formControl();
    const formControlName = this.formControlName();
    if (formControl) {
      this.control = formControl;
    }
    // Priority 2: Use formControlName from parent form
    else if (this.controlContainer && formControlName) {
      this.control = this.controlContainer.control?.get(
        formControlName
      ) as UntypedFormControl;
    }

    // If we have a control, check for validators
    if (this.control?.validator) {
      const validator = this.control.validator({} as AbstractControl);
      this.validationRequired = !!(validator && validator.required);
    }

    // Handle disabled state
    // if (this.isDisabled && this.control) {
    //   this.control.disable({ onlySelf: true, emitEvent: false });
    // }
  }

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  onBlurEvent(event: any) {
    this.blurEvent.emit(event);
  }

  onClickedEvent(event: any) {
    this.clickedEvent.emit(event);
  }

  writeValue(value: any) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        this.value =
          this.inputType() === 'textarea'
            ? value.replace(/\n\r?/g, '<br />').trim()
            : value.trim();
      } else if (value.currentTarget) {
        const element = value.currentTarget as HTMLInputElement;
        if (this.convertUpperCase()) {
          const startPos = element.selectionStart;
          const endPos = element.selectionEnd;
          element.value = element.value.toUpperCase();
          element.setSelectionRange(startPos, endPos);
        }
        this.value = element.value;
      }
      this.keyupEvent.emit(value);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  getFieldErrorDesc(): string {
    if (this.control?.errors && (this.control.dirty || this.control.touched)) {
      return (
        this.customError() || this.commonService.getFieldErrorDesc(this.control)
      );
    }
    return '';
  }

  selectionChange(selectedOption: any) {
    this.selectedStateChange.emit(selectedOption);
  }

  showRegularInput(): boolean {
    return !['textarea', 'date', 'datetime-local'].includes(this.inputType());
  }

  getInputType(): string {
    return this.inputType() === 'password' && !this.pwToggle
      ? 'password'
      : 'text';
  }

  togglePasswordVisibility(): void {
    this.pwToggle = !this.pwToggle;
  }

  clearValue(): void {
    this.value = '';
    this.onChange('');
    this.onTouched();
  }
}
