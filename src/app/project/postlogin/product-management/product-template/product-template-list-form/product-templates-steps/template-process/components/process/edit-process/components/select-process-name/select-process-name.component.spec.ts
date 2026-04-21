import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProcessNameComponent } from './select-process-name.component';

describe('SelectProcessNameComponent', () => {
  let component: SelectProcessNameComponent;
  let fixture: ComponentFixture<SelectProcessNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectProcessNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProcessNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
