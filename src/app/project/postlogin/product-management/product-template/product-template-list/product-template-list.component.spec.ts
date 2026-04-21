import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTemplateListComponent } from './product-template-list.component';

describe('ProductTemplateListComponent', () => {
  let component: ProductTemplateListComponent;
  let fixture: ComponentFixture<ProductTemplateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductTemplateListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
