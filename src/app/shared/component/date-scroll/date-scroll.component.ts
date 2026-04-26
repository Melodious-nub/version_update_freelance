import { Component, OnInit, input, output, signal, computed } from '@angular/core';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-date-scroll',
    templateUrl: './date-scroll.component.html',
    styleUrls: ['./date-scroll.component.scss'],
    imports: [MatIcon, NgClass, ExtendedModule]
})
export class DateScrollComponent implements OnInit {
  readonly initialDate = input(new Date());
  readonly dateSelected = output<any>();

  // Use signals for internal state to ensure stability
  startDateSignal = signal<Date>(new Date());
  selectedDateSignal = signal<Date>(new Date());

  // Computed signal for the date list - stable and memoized
  readonly dateList = computed(() => {
    const list: any[] = [];
    const today = new Date(this.startDateSignal().getTime());
    for (let i = 0; i < 11; i++) {
      const nextDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = nextDate.toLocaleString('en-us', { weekday: 'long' });
      const year = nextDate.getFullYear();
      const month = ('0' + (nextDate.getMonth() + 1)).slice(-2);
      const day = ('0' + nextDate.getDate()).slice(-2);
      const dateString = `${year}-${month}-${day}`;
      list.push({ dateStr: dateString, day: dayName, date: nextDate });
    }
    return list;
  });

  constructor() { }

  ngOnInit(): void {
    const baseDate = this.getDateWithoutTime(this.initialDate());
    this.startDateSignal.set(baseDate);
    this.selectedDateSignal.set(baseDate);
  }

  onDateSelect(date: Date) {
    this.selectedDateSignal.set(new Date(date));
    this.dateSelected.emit(date);
  }

  isDateSelected(date: Date): boolean {
    return this.selectedDateSignal().getTime() === new Date(date).getTime();
  }

  getPrevDate(date: any): Date {
    const d = new Date(date);
    return new Date(d.getTime() - 11 * 24 * 60 * 60 * 1000);
  }

  getNextDate(date: any): Date {
    const d = new Date(date);
    return new Date(d.getTime() + 11 * 24 * 60 * 60 * 1000);
  }

  prev() {
    this.startDateSignal.set(this.getPrevDate(this.startDateSignal()));
  }

  next() {
    this.startDateSignal.set(this.getNextDate(this.startDateSignal()));
  }

  getDateWithoutTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
