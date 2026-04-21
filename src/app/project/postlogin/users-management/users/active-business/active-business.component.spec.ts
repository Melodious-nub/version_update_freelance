import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveBusinessComponent } from './active-business.component';

describe('ActiveBusinessComponent', () => {
  let component: ActiveBusinessComponent;
  let fixture: ComponentFixture<ActiveBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveBusinessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
