import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridViewProductCardComponent } from './grid-view-product-card.component';

describe('GridViewProductCardComponent', () => {
  let component: GridViewProductCardComponent;
  let fixture: ComponentFixture<GridViewProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridViewProductCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridViewProductCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
