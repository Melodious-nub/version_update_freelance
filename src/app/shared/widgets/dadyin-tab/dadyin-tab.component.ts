import { Component, forwardRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'dadyin-tab',
    templateUrl: './dadyin-tab.component.html',
    styleUrls: ['./dadyin-tab.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DadyinTabComponent), multi: true },
    ]
})
export class DadyinTabComponent implements OnInit {

    constructor() { }
    ngOnInit(): void {
    }
    @Output() actionClick = new EventEmitter();
    @Input() currentIndex: number = 0;
    @Input() disabled = false;
    @Input() action: any = [{ id: '', name: '' }]
    changeMainTab(event:any) {
      
        this.actionClick.emit({index:event});
        this.currentIndex = event;
    }

}