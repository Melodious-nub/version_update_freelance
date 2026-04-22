import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderWiseComponent } from './order-wise.component';

describe('OrderWiseComponent', () => {
  let component: OrderWiseComponent;
  let fixture: ComponentFixture<OrderWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OrderWiseComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
