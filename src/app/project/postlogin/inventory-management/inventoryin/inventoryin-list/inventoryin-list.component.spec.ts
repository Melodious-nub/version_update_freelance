import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryinListComponent } from './inventoryin-list.component';

describe('InventoryinListComponent', () => {
  let component: InventoryinListComponent;
  let fixture: ComponentFixture<InventoryinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryinListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
