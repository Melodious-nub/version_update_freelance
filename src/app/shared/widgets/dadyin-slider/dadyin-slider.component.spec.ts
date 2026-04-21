import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DadyinSliderComponent } from './dadyin-slider.component';

describe('DadyinSliderComponent', () => {
  let component: DadyinSliderComponent;
  let fixture: ComponentFixture<DadyinSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DadyinSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DadyinSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
