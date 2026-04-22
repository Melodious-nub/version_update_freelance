import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';

@Component({
    selector: 'dadyin-button',
    templateUrl: './dadyin-button.component.html',
    styleUrls: ['./dadyin-button.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinButtonComponent), multi: true },
    ],
    standalone: true,
    imports: [NgIf, MatTooltipModule, MatIconModule]
})
export class DadyinButtonComponent implements OnInit {

    @Input() label = "";
    @Input() theme = "default"; // value will be : default , primary , secondary , danger , warning
    @Input() class = '';
    @Input() fontSize = '';
    @Input() size = ''; // value will be : full , small
    @Input() type = "normal"; // value will be : normal , icon , image;
    @Input() typeval = '';
    @Input() height = '';
    @Input() width = '';
    @Input() heightImage = '30px';
    @Input() widthImage = '30px';
    @Input() isDisabled = false;
    @Input() tooltip = '';
    @Output('clicked') clicked = new EventEmitter();
    @Input() stopPropagation = true;
    @Input() routerLink: string[] = [];

    constructor() {
    }

    


    ngOnInit(): void {
    }

    onClick(event?: MouseEvent) {
        if (this.stopPropagation && event) {
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
        this.clicked.emit()
    }

}