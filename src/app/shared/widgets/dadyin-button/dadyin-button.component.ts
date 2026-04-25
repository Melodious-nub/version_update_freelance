import { Component, Input, forwardRef, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';


@Component({
    selector: 'dadyin-button',
    templateUrl: './dadyin-button.component.html',
    styleUrls: ['./dadyin-button.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinButtonComponent), multi: true },
    ],
    imports: [MatTooltip, MatIcon]
})
export class DadyinButtonComponent {

    @Input() label = "";
    readonly theme = input("default"); // value will be : default , primary , secondary , danger , warning
    readonly class = input('');
    readonly fontSize = input('');
    readonly size = input(''); // value will be : full , small
    readonly type = input("normal"); // value will be : normal , icon , image;
    readonly typeval = input('');
    readonly height = input('');
    readonly width = input('');
    readonly heightImage = input('30px');
    readonly widthImage = input('30px');
    @Input() isDisabled = false;
    @Input('disabled') set _isDisabled(val: boolean) { this.isDisabled = val; }
    readonly tooltip = input('');
    readonly clicked = output<any>();
    readonly stopPropagation = input(true);
    readonly routerLink = input<string[]>([]);

    constructor() {
    }

    onClick(event?: MouseEvent) {
        if (this.stopPropagation() && event) {
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
        this.clicked.emit(undefined as any)
    }

}