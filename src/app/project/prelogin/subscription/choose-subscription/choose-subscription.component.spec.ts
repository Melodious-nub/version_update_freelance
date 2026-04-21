import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseSubscriptionComponent } from './choose-subscription.component';

describe('ChooseSubscriptionComponent', () => {
  let component: ChooseSubscriptionComponent;
  let fixture: ComponentFixture<ChooseSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseSubscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
