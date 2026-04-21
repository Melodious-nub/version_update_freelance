import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentOptionDialogComponent } from './payment-option-dialog.component';

describe('PaymentOptionDialogComponent', () => {
  let component: PaymentOptionDialogComponent;
  let fixture: ComponentFixture<PaymentOptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentOptionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentOptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
