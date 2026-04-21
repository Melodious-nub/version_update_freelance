import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveBusinessComponent } from './inactive-business.component';

describe('InactiveBusinessComponent', () => {
  let component: InactiveBusinessComponent;
  let fixture: ComponentFixture<InactiveBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactiveBusinessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
