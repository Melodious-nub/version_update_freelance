import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageFormulasModalComponent } from './usage-formulas-modal.component';

describe('UsageFormulasModalComponent', () => {
  let component: UsageFormulasModalComponent;
  let fixture: ComponentFixture<UsageFormulasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UsageFormulasModalComponent]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageFormulasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
