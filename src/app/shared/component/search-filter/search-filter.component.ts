import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    selector: 'search-filter',
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        MatIconModule,
        MatButtonModule,
    ],
})
export class SearchFilterComponent implements OnInit {
    @Input() searchControl =new UntypedFormControl();
    @Input() advSearchConfig;
    @Input() placeholder: string = 'Type to search here';
    @Output() inputChange = new EventEmitter<any>();
    @Output() keyupEnter = new EventEmitter<any>();
    valueChangesSubscription: Subscription;
    filterToggle = false;
    private searchSubject = new Subject<string>();

    ngOnInit() {
        this.searchSubject.pipe(debounceTime(500)).subscribe(value => {
            this.inputChange.emit(value)
        });
    }

    ngOnDestroy() {
        if (this.valueChangesSubscription) {
            this.valueChangesSubscription.unsubscribe();
        }
    }

    toggleFilter() {
        debounceTime(500)
        this.inputChange.emit('');
        this.filterToggle = !this.filterToggle;
    }

    clearSearchValue(searchInput: HTMLInputElement) {
        searchInput.value = '';
        this.searchControl.setValue('')
        this.inputChange.emit('');
    }

    onInput(value) {
        this.searchSubject.next(value);
    }

}
