import { Component, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';


@Component({
    selector: 'dadyin-selected-value',
    templateUrl: './dadyin-selected-value.component.html',
    styleUrls: ['./dadyin-selected-value.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinSelectedValueComponent), multi: true },
    ],
    standalone: true,
    imports: [MatTooltip, MatIcon]
})
export class DadyinSelectedValueComponent {

    @Input() height = '';
    @Input() options = [];
    @Input() singleValue: any;
    @Input() label = "";

    constructor() { }

    remove(item) {
        const index = this.options.indexOf(item);
        this.options.splice(index, 1);
    }

}
