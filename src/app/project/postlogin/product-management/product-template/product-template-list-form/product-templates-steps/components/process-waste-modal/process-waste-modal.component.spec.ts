import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessWasteModalComponent } from './process-waste-modal.component';

describe('ProcessWasteModalComponent', () => {
  let component: ProcessWasteModalComponent;
  let fixture: ComponentFixture<ProcessWasteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ProcessWasteModalComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessWasteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
