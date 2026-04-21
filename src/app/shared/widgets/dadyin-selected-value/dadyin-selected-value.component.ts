import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'dadyin-selected-value',
    templateUrl: './dadyin-selected-value.component.html',
    styleUrls: ['./dadyin-selected-value.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinSelectedValueComponent), multi: true },
    ]
})
export class DadyinSelectedValueComponent implements OnInit {

    @Input() height = '';
    @Input() options = [];
    @Input() singleValue: any;
    @Input() label = "";

    constructor() { }

    ngOnInit(): void {
    }

    remove(item) {
        const index = this.options.indexOf(item);
        this.options.splice(index, 1);
    }

}
