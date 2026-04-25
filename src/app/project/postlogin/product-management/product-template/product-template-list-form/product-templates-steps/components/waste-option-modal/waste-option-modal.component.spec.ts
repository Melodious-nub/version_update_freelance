import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteOptionModalComponent } from './waste-option-modal.component';

describe('WasteOptionModalComponent', () => {
  let component: WasteOptionModalComponent;
  let fixture: ComponentFixture<WasteOptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WasteOptionModalComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteOptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
