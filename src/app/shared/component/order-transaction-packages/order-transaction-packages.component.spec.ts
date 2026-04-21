import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderTransactionPackagesComponent } from './order-transaction-packages.component';

describe('OrderTransactionPackagesComponent', () => {
  let component: OrderTransactionPackagesComponent;
  let fixture: ComponentFixture<OrderTransactionPackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderTransactionPackagesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderTransactionPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
