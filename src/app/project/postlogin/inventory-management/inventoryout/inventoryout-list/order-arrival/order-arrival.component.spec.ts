import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderArrivalComponent } from './order-arrival.component';

describe('OrderArrivalComponent', () => {
  let component: OrderArrivalComponent;
  let fixture: ComponentFixture<OrderArrivalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderArrivalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderArrivalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
