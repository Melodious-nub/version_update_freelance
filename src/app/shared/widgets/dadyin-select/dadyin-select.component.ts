import { ControlContainer, UntypedFormControl, NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';


@Component({
    selector: 'dadyin-select',
    templateUrl: './dadyin-select.component.html',
    styleUrls: ['./dadyin-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DadyinSelectComponent,
            multi: true
        }
    ],
})
export class DadyinSelectComponent implements ControlValueAccessor, OnInit {
    @Input() height: string | null = null;
    @Input() fontSize: string | null = null;
    @Input() label = '';
    @Input() labelBackground = ''
    @Input() optionLabel = 'label';
    @Input() optionValue = 'value';
    @Input() emptyOption = 'Select';
    @Input() optionArr: any = [];
    @Input() isMultiSelect = false;
    @Input() formControlName = '';
    @Input() customError = "";
    @Input() showUser: boolean = false;
    @Input() isDisabled: boolean = false;
    @Input() isErrorClass: boolean = false;
    @Output() selectedStateChange = new EventEmitter();
    @Output() onSelect = new EventEmitter();
    @Input() class: any = '';
    control!: UntypedFormControl;
    onChange: any = (val) => {
    };


    onTouched: any = () => { };
    validationRequired: boolean = false;

    @Input('value') _value: any;
    set value(val) {
        this._value = val;
        this.onChange(val);
        this.onTouched();
    }
    get value() {
        return this._value;
    }

    constructor(private commonService: CommonService, private controlContainer: ControlContainer, private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (this.controlContainer.control && this.formControlName) {
            this.control = this.controlContainer.control.get(this.formControlName) as UntypedFormControl;
            if (this.control) {
                if (this.control.validator) {
                    const validator = this.control.validator && this.control.validator({} as AbstractControl);
                    this.validationRequired = validator && validator.required ? true : false;
                    if (this.validationRequired) {
                    }
                }
            }
        }
    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }

    writeValue(event: any) {
        if (event) {
            if (typeof event === 'string') {
                this._value = event;
            } else if (typeof event === "object") {
                this._value = event;
            } else {
                const element = event.currentTarget as HTMLInputElement
                this._value = element?.value;
            }
        }
    }

    registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.onTouched = fn;
    }

    selectionChange(selectedOption: any) {
        this.selectedStateChange.emit(selectedOption);
    }

    showFieldError() {
        if (this.control?.errors) {
            if (this.control.dirty || this.control.touched) {
                return true;
            }
        }
        return false;
    }

    getFieldErrorDesc() {
        if (this.control?.errors) {
            if (this.control.dirty || this.control.touched) {
                if (this.customError.length) {
                    return this.customError;
                }
                return this.commonService.getFieldErrorDesc(this.control);
            }
        }
        return "";
    }

    compareFn(c1: any, c2: any): boolean {
        return c1 && c2 ? JSON.stringify(c1.value) == JSON.stringify(c2.value) : c1 == c2;
    }

    onSelectOption(event: any) {
        this.onSelect.emit(event)
    }
}
