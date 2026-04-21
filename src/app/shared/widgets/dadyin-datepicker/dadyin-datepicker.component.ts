
import { Component, OnInit, Input, forwardRef, Injector, Inject, Optional, ChangeDetectorRef, AfterContentInit, AfterContentChecked, Output, EventEmitter } from '@angular/core';

import { NG_VALUE_ACCESSOR, NgControl, ControlValueAccessor, UntypedFormControl, ControlContainer, AbstractControl } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { CommonService } from 'src/app/service/common.service';

export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'dadyin-datepicker',
    templateUrl: './dadyin-datepicker.component.html',
    styleUrls: ['./dadyin-datepicker.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinDatePickerComponent), multi: true },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class DadyinDatePickerComponent implements OnInit, ControlValueAccessor, AfterContentChecked {

    @Input() class = '';
    @Input() label = "";
    // @Input() disabledDays = [0, 6]; add this into your component if you want to disable the weekends
    @Input() disabledDays = [];
    @Input() customError = "";
    @Input() formControlName = '';
    @Input() inputWidth = "100%";
    @Input() hasMaxDate = true;
    @Input() hasMinDate = true;
    @Input() minDate: Date = new Date(0, 0, 0);
    @Input() maxDate: Date = new Date();
    @Input() isRequired: boolean = false;
    @Input() cancelBtn: string = "Cancel";
    @Input() actionBtn: string = "Submit";
    @Input() showActionBtn: boolean = false;
    @Output('onAction') onAction = new EventEmitter();
    validationRequired: boolean = false;

    control!: UntypedFormControl;

    onChange: any = () => { };
    onTouched: any = () => { };

    @Input('value') _value: any = '';
    set value(val) {
        this._value = val;
        this.onChange(val);
        this.onTouched();
    }
    get value() {
        return this._value;
    }


    constructor(private commonService: CommonService, private controlContainer: ControlContainer, private injector: Injector,
        private cdr: ChangeDetectorRef) {
    }

    ngAfterContentChecked() {
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        if (this.controlContainer.control) {
            this.control = this.controlContainer.control.get(this.formControlName) as UntypedFormControl;
            if (this.control.validator) {
                const validator = this.control.validator && this.control.validator({} as AbstractControl);
                this.validationRequired = validator && validator.required ? true : false;
                if (this.validationRequired) {
                    // if (this.label.charAt(this.label.length - 1) !== "*") {
                    //     this.label = this.label + " *";
                    // }
                }
            }
        }
    }

    writeValue(event: MatDatepickerInputEvent<Date>) {
        if (typeof event === "string") {
            this.value = event ? `${event}` : '';
        } else {
            this.value = event ? event.value : '';
        }
    }

    registerOnChange(fn: Function) {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.onTouched = fn;
    }

    myFilter = (d: Date | null): boolean => {
        const day = new Date((d ? d : "")).getDay();
        // Prevent Saturday and Sunday from being selected.
        if (this.disabledDays.length > 0) {
            for (let index = 0; index < this.disabledDays.length; index++) {
                return day !== this.disabledDays[index];
            }
        }
        return true;
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
        if (this.customError.length) {
            return this.customError;
        }
        return this.commonService.getFieldErrorDesc(this.control);
    }

    actionBtnClicked() {
        if (this.value) {
            this.onAction.emit(null);
        } else {
            // this.commonService.openSnackBar("Select valid date");
        }
    }
}
