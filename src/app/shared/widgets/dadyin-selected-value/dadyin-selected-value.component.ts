import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'dadyin-selected-value',
    templateUrl: './dadyin-selected-value.component.html',
    styleUrls: ['./dadyin-selected-value.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinSelectedValueComponent), multi: true },
    ],
    standalone: true,
    imports: [NgFor, NgIf, MatTooltip, MatIcon]
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
