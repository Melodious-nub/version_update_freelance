import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMaterialProcessComponent } from './raw-material-process.component';

describe('RawMaterialProcessComponent', () => {
  let component: RawMaterialProcessComponent;
  let fixture: ComponentFixture<RawMaterialProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RawMaterialProcessComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RawMaterialProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
