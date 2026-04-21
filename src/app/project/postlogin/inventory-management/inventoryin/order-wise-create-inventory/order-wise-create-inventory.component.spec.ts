import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderWiseCreateInventoryComponent } from './order-wise-create-inventory.component';

describe('OrderWiseCreateInventoryComponent', () => {
  let component: OrderWiseCreateInventoryComponent;
  let fixture: ComponentFixture<OrderWiseCreateInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderWiseCreateInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderWiseCreateInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
