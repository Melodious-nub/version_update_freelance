import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCalculatorComponent } from './edit-calculator.component';

describe('EditCalculatorComponent', () => {
  let component: EditCalculatorComponent;
  let fixture: ComponentFixture<EditCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCalculatorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
