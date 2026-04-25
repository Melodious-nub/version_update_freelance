import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryoutListComponent } from './inventoryout-list.component';

describe('InventoryoutListComponent', () => {
  let component: InventoryoutListComponent;
  let fixture: ComponentFixture<InventoryoutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryoutListComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
