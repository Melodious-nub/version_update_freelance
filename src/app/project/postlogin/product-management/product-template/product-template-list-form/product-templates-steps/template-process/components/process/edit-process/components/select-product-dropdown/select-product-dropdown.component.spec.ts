import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProductDropdownComponent } from './select-product-dropdown.component';

describe('SelectProductDropdownComponent', () => {
  let component: SelectProductDropdownComponent;
  let fixture: ComponentFixture<SelectProductDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectProductDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProductDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
