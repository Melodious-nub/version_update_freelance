import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveBusinessListComponent } from './active-business-list.component';

describe('ActiveBusinessListComponent', () => {
  let component: ActiveBusinessListComponent;
  let fixture: ComponentFixture<ActiveBusinessListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveBusinessListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveBusinessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
