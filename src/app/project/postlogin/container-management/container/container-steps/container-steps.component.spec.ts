import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerStepsComponent } from './container-steps.component';

describe('ContainerStepsComponent', () => {
  let component: ContainerStepsComponent;
  let fixture: ComponentFixture<ContainerStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContainerStepsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
