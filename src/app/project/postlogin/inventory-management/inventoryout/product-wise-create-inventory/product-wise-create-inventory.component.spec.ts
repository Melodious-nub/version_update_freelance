import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductWiseCreateInventoryComponent } from './product-wise-create-inventory.component';

describe('ProductWiseCreateInventoryComponent', () => {
  let component: ProductWiseCreateInventoryComponent;
  let fixture: ComponentFixture<ProductWiseCreateInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductWiseCreateInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductWiseCreateInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
