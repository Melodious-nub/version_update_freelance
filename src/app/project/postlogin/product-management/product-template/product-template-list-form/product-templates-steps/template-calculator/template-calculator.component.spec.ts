import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCalculatorComponent } from './template-calculator.component';

describe('TemplateCalculatorComponent', () => {
  let component: TemplateCalculatorComponent;
  let fixture: ComponentFixture<TemplateCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateCalculatorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
