import { Component, OnInit, OnDestroy, input, output } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
    selector: 'search-filter',
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatIcon,
        MatIconButton
    ]
})
export class SearchFilterComponent implements OnInit, OnDestroy {
    readonly searchControl = input(new UntypedFormControl());
    readonly advSearchConfig = input(undefined);
    readonly placeholder = input<string>('Type to search here');
    readonly inputChange = output<any>();
    readonly keyupEnter = output<any>();
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
        this.searchControl().setValue('')
        this.inputChange.emit('');
    }

    onInput(value) {
        this.searchSubject.next(value);
    }

}
