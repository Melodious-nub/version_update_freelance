import { Component, forwardRef, ChangeDetectorRef, AfterContentChecked, inject, input, output } from '@angular/core';
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
    imports: [MatCheckbox, FormsModule]
})
export class DadyinCheckBoxComponent implements AfterContentChecked{
  private commonService = inject(CommonService);
  private cdr = inject(ChangeDetectorRef);

  readonly ischecked = input(false);
  readonly isDisabled = input(false, { alias: "disabled" });
  readonly class = input('');
  readonly label = input('');
  readonly color = input('primary');
  readonly valueChange = output<any>();

  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  onValueChange(event: any) {
    this.valueChange.emit(event.checked);
  }
}
