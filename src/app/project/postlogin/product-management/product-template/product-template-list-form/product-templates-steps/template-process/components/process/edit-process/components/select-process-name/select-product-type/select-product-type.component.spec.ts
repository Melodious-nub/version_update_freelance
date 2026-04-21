import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProductTypeComponent } from './select-product-type.component';

describe('SelectProductTypeComponent', () => {
  let component: SelectProductTypeComponent;
  let fixture: ComponentFixture<SelectProductTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectProductTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
