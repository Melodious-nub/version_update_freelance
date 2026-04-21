import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcProductDetailComponent } from './qc-product-detail.component';

describe('QcProductDetailComponent', () => {
  let component: QcProductDetailComponent;
  let fixture: ComponentFixture<QcProductDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QcProductDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QcProductDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
