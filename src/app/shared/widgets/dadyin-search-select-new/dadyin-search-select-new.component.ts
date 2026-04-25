import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';

@Component({
    selector: 'dadyin-search-select-new',
    templateUrl: './dadyin-search-select-new.component.html',
    styleUrls: ['./dadyin-search-select-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ExtendedModule
],
})
export class DadyinSearchSelectNewComponent implements OnInit {
  @Input() highlightItems: any = [];

  @Input() tagType: any;
  @Input() typeahead: any = true;
  @Input() addTag: any = false;
  @Input() label: any;
  @Input() selectedItems: any;
  @Input() fullItems: any;
  @Input() bindValue: any = null;
  @Input() disabled: boolean = false;
  @Input() optionTag: any = null;
  searchControl = new UntypedFormControl();
  searchText = new Subject();
  @Output() search: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  @Input() maxSelectedItems: any = 'none';

  constructor() {}

  ngOnInit(): void {
    if (this.typeahead) {
      this.searchText
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((res) => {
          this.search.emit(res);
        });
    }
  }

  onChange() {
    this.change.emit();
  }

  remove(item, i) {
    const selectedItems = this.selectedItems.value;
    selectedItems.splice(i, 1);
    this.selectedItems.setValue(selectedItems);
    this.change.emit();
  }

  addTagFn = (term) => {
    if (!this.addTag) {
      return null;
    }
    if (this.tagType == 'object') {
      return { id: null, description: term };
    } else {
      return term;
    }
  };

  getName(item) {
    const itl = this.fullItems.find((it) => it.id == item);
    return itl?.description;
  }

  onItemClick(event) {
    this.itemClick.emit(event);
  }
}
