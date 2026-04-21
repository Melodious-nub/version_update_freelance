import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseorderStepsComponent } from './purchaseorder-steps.component';

describe('PurchaseorderStepsComponent', () => {
  let component: PurchaseorderStepsComponent;
  let fixture: ComponentFixture<PurchaseorderStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PurchaseorderStepsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseorderStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
