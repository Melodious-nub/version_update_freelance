import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateProcessComponent } from './template-process.component';

describe('TemplateProcessComponent', () => {
  let component: TemplateProcessComponent;
  let fixture: ComponentFixture<TemplateProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateProcessComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
