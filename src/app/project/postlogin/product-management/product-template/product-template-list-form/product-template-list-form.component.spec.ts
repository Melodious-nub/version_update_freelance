import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTemplateListFormComponent } from './product-template-list-form.component';

describe('ProductTemplateListComponent', () => {
  let component: ProductTemplateListFormComponent;
  let fixture: ComponentFixture<ProductTemplateListFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductTemplateListFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTemplateListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
