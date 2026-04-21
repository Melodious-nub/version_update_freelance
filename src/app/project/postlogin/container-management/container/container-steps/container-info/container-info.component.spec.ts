import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerInfoComponent } from './container-info.component';

describe('ContainerInfoComponent', () => {
  let component: ContainerInfoComponent;
  let fixture: ComponentFixture<ContainerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContainerInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
