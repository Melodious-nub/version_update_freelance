import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedPoComponent } from './related-po.component';

describe('RelatedPoComponent', () => {
  let component: RelatedPoComponent;
  let fixture: ComponentFixture<RelatedPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelatedPoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
