import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedToInventoryComponent } from './added-to-inventory.component';

describe('AddedToInventoryComponent', () => {
  let component: AddedToInventoryComponent;
  let fixture: ComponentFixture<AddedToInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddedToInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddedToInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
