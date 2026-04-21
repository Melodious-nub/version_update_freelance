import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedPoListComponent } from './receivedPo-list.component';

describe('ReceivedPoListComponent', () => {
  let component: ReceivedPoListComponent;
  let fixture: ComponentFixture<ReceivedPoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivedPoListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedPoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
