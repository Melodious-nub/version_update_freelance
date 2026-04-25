import { ControlContainer, UntypedFormControl, NG_VALUE_ACCESSOR, ControlValueAccessor, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef, ViewEncapsulation, AfterContentChecked, inject, input, output } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass, NgStyle } from '@angular/common';


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
    imports: [
        FormsModule,
        NgClass,
        ExtendedModule,
        NgStyle,
        ReactiveFormsModule
    ]
})
export class DadyinSelectComponent implements ControlValueAccessor, OnInit, AfterContentChecked {
    private commonService = inject(CommonService);
    private controlContainer = inject(ControlContainer);
    private cdr = inject(ChangeDetectorRef);

    @Input() height: string | null = null;
    @Input() fontSize: string | null = null;
    readonly label = input('');
    readonly labelBackground = input('');
    readonly optionLabel = input('label');
    readonly optionValue = input('value');
    readonly emptyOption = input('Select');
    @Input() optionArr: any = [];
    @Input() set items(val: any) { this.optionArr = val; }
    readonly isMultiSelect = input(false);
    readonly formControlName = input('');
    readonly customError = input("");
    readonly showUser = input<boolean>(false);
    @Input() isDisabled: boolean = false;
    @Input('disabled') set _isDisabled(val: boolean) { this.isDisabled = val; }
    readonly isErrorClass = input<boolean>(false);
    readonly selectedStateChange = output<any>();
    readonly onSelect = output<any>();
    readonly class = input<any>('');
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

    ngOnInit(): void {
        const formControlName = this.formControlName();
        if (this.controlContainer.control && formControlName) {
            this.control = this.controlContainer.control.get(formControlName) as UntypedFormControl;
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
                const customError = this.customError();
                if (customError.length) {
                    return customError;
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
