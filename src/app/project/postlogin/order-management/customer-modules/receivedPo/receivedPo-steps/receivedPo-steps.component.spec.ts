import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedPoStepsComponent } from './receivedPo-steps.component';

describe('ReceivedPoStepsComponent', () => {
  let component: ReceivedPoStepsComponent;
  let fixture: ComponentFixture<ReceivedPoStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceivedPoStepsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedPoStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
