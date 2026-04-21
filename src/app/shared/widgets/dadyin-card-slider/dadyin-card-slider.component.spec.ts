import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadyinCardSliderComponent } from './dadyin-card-slider.component';

describe('DadyinCardSliderComponent', () => {
  let component: DadyinCardSliderComponent;
  let fixture: ComponentFixture<DadyinCardSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DadyinCardSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DadyinCardSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
