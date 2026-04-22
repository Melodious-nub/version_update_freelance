import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  AfterContentChecked,
  Output,
  EventEmitter,
  HostListener,
  Optional,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ControlContainer, UntypedFormControl, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from 'src/app/service/common.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgIf, NgClass, NgStyle } from '@angular/common';

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
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        ExtendedModule,
        NgStyle,
    ],
})
export class DadyinInputComponent
  implements OnInit, ControlValueAccessor, AfterContentChecked
{
  @Input() height: string | null = null;
  @Input() fontSize: string | null = null;
  @Input() class: string = '';
  @Input() inputType: string = 'text';
  @Input() label: string = '';
  @Input() rows;
  @Input() labelBackground: string = '#fffff';
  @Input() placeholder: string = '';
  @Input() isClearable: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() formControlName: string = '';
  @Input() formControl: UntypedFormControl | null = null; // New input for direct FormControl
  @Input() customError: string = '';
  @Input() noPaste: boolean = false;
  @Input() isErrorClass: boolean = false;
  @Input() convertUpperCase: boolean = false;
  @Input() minDate:any;        

  @Output() blurEvent = new EventEmitter<any>();
  @Output() clickedEvent = new EventEmitter<any>();
  @Output() keyupEvent = new EventEmitter<any>();
  @Output() selectedStateChange = new EventEmitter<any>();

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

  constructor(
    private commonService: CommonService,
    @Optional() private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('paste', ['$event'])
  blockPaste(e: ClipboardEvent) {
    if (this.noPaste) {
      e.preventDefault();
    }
  }

  ngOnInit(): void {
    // Priority 1: Use directly provided formControl
    if (this.formControl) {
      this.control = this.formControl;
    }
    // Priority 2: Use formControlName from parent form
    else if (this.controlContainer && this.formControlName) {
      this.control = this.controlContainer.control?.get(
        this.formControlName
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
          this.inputType === 'textarea'
            ? value.replace(/\n\r?/g, '<br />').trim()
            : value.trim();
      } else if (value.currentTarget) {
        const element = value.currentTarget as HTMLInputElement;
        if (this.convertUpperCase) {
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
        this.customError || this.commonService.getFieldErrorDesc(this.control)
      );
    }
    return '';
  }

  selectionChange(selectedOption: any) {
    this.selectedStateChange.emit(selectedOption);
  }

  showRegularInput(): boolean {
    return !['textarea', 'date', 'datetime-local'].includes(this.inputType);
  }

  getInputType(): string {
    return this.inputType === 'password' && !this.pwToggle
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
