import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableEditableComponent } from './data-table-editable.component';

describe('DataTableEditableComponent', () => {
  let component: DataTableEditableComponent;
  let fixture: ComponentFixture<DataTableEditableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataTableEditableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableEditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
