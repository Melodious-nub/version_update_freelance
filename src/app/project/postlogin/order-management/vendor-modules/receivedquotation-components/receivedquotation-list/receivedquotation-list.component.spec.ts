import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedquotationListComponent } from './receivedquotation-list.component';

describe('ReceivedquotationListComponent', () => {
  let component: ReceivedquotationListComponent;
  let fixture: ComponentFixture<ReceivedquotationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivedquotationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedquotationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
