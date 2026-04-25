import { Component, forwardRef, Input, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatTabGroup, MatTab } from '@angular/material/tabs';

@Component({
    selector: 'dadyin-tab',
    templateUrl: './dadyin-tab.component.html',
    styleUrls: ['./dadyin-tab.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinTabComponent), multi: true },
    ],
    imports: [MatTabGroup, MatTab]
})
export class DadyinTabComponent {

    constructor() { }
    readonly actionClick = output<any>();
    @Input() currentIndex: number = 0;
    readonly disabled = input(false);
    readonly action = input<any>([{ id: '', name: '' }]);
    changeMainTab(event:any) {
      
        this.actionClick.emit({index:event});
        this.currentIndex = event;
    }

}