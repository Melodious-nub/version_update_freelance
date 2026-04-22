import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAssigningModalComponent } from './inventory-assigning-modal.component';

describe('InventoryAssigningModalComponent', () => {
  let component: InventoryAssigningModalComponent;
  let fixture: ComponentFixture<InventoryAssigningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryAssigningModalComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryAssigningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
