import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  input,
  output
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
    imports: [
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        ExtendedModule
    ]
})
export class DadyinSearchSelectNewComponent implements OnInit {
  readonly highlightItems = input<any>([]);

  readonly tagType = input<any>(undefined);
  readonly typeahead = input<any>(true);
  readonly addTag = input<any>(false);
  readonly label = input<any>(undefined);
  readonly selectedItems = input<any>(undefined);
  readonly fullItems = input<any>(undefined);
  readonly bindValue = input<any>(null);
  readonly disabled = input<boolean>(false);
  @Input() optionTag: any = null;
  searchControl = new UntypedFormControl();
  searchText = new Subject();
  readonly search = output<any>();
  readonly itemClick = output<any>();
  readonly change = output<any>();

  readonly maxSelectedItems = input<any>('none');

  constructor() {}

  ngOnInit(): void {
    if (this.typeahead()) {
      this.searchText
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((res) => {
          this.search.emit(res);
        });
    }
  }

  onChange() {
    this.change.emit(undefined as any);
  }

  remove(item, i) {
    const selectedItems = this.selectedItems().value;
    selectedItems.splice(i, 1);
    this.selectedItems().setValue(selectedItems);
    this.change.emit(undefined as any);
  }

  addTagFn = (term) => {
    if (!this.addTag()) {
      return null;
    }
    if (this.tagType() == 'object') {
      return { id: null, description: term };
    } else {
      return term;
    }
  };

  getName(item) {
    const itl = this.fullItems().find((it) => it.id == item);
    return itl?.description;
  }

  onItemClick(event) {
    this.itemClick.emit(event);
  }
}
