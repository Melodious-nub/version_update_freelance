import { Component, HostListener, OnInit, inject, input, output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';

import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-campaign-filter-box',
    templateUrl: './campaign-filter-box.component.html',
    styleUrls: ['./campaign-filter-box.component.scss'],
    imports: [MatIcon, DadyinButtonComponent, FormsModule, ReactiveFormsModule]
})
export class CampaignFilterBoxComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);

  readonly filtersApplied = output<any>();
  readonly mode = input<'status' | 'interval'>('status');

  openFilter = false;
  filterForm: UntypedFormGroup;
  filterCount = 0;

  constructor() {
    this.filterForm = this.fb.group({
      statusDraft: [false],
      statusRunning: [false],
      statusCompleted: [false],
      intervalDaily: [false],
      intervalWeekly: [false],
      intervalMonthly: [false],
      intervalYearly: [false],
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openFilter = false;
  }

  ngOnInit(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.updateFilterCount();
    });
  }

  private updateFilterCount(): void {
    const v = this.filterForm.value;
    let count = 0;
    if (this.mode() === 'status') {
      if (v.statusDraft) count++;
      if (v.statusRunning) count++;
      if (v.statusCompleted) count++;
    } else {
      if (v.intervalDaily) count++;
      if (v.intervalWeekly) count++;
      if (v.intervalMonthly) count++;
      if (v.intervalYearly) count++;
    }
    this.filterCount = count;
  }

  apply(): void {
    const v = this.filterForm.value;
    if (this.mode() === 'status') {
      const selected: string[] = [];
      if (v.statusDraft) selected.push('draft');
      if (v.statusRunning) selected.push('running');
      if (v.statusCompleted) selected.push('completed');
      this.filtersApplied.emit({ status: selected.length ? selected.join(',') : undefined });
    } else {
      const selected: string[] = [];
      if (v.intervalDaily) selected.push('daily');
      if (v.intervalWeekly) selected.push('weekly');
      if (v.intervalMonthly) selected.push('monthly');
      if (v.intervalYearly) selected.push('yearly');
      this.filtersApplied.emit({ 'interval-type': selected.length ? selected.join(',') : undefined });
    }
    this.openFilter = false;
  }

  clearFilter(): void {
    this.filterForm.reset(
      {
        statusDraft: false,
        statusRunning: false,
        statusCompleted: false,
        intervalDaily: false,
        intervalWeekly: false,
        intervalMonthly: false,
        intervalYearly: false,
      },
      { emitEvent: true }
    );

    this.filterCount = 0;
    this.filtersApplied.emit({});
    this.openFilter = false;
  }
}
