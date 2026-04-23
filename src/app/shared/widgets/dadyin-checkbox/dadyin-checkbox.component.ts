import {
  Component,
  OnInit,
  Input,
  forwardRef,
  ChangeDetectorRef,
  AfterContentChecked,
  Output,
  EventEmitter,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonService } from 'src/app/service/common.service';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'dadyin-checkbox',
    templateUrl: './dadyin-checkbox.component.html',
    styleUrls: ['./dadyin-checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DadyinCheckBoxComponent),
            multi: true,
        },
    ],
    standalone: true,
    imports: [MatCheckbox, FormsModule],
})
export class DadyinCheckBoxComponent implements OnInit, AfterContentChecked {
  @Input() ischecked = false;
  @Input('disabled') isDisabled = false;
  @Input() class = '';
  @Input() label = '';
  @Input() color = 'primary';
  @Output() valueChange = new EventEmitter<string>();

  constructor(
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {}

  onValueChange(event: any) {
    this.valueChange.emit(event.checked);
  }
}
