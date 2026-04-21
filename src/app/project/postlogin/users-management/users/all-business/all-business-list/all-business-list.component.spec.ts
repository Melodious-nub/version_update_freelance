import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBusinessListComponent } from './all-business-list.component';

describe('AllBusinessListComponent', () => {
  let component: AllBusinessListComponent;
  let fixture: ComponentFixture<AllBusinessListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllBusinessListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllBusinessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
