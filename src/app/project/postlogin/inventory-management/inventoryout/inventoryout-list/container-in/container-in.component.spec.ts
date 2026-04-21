import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerInComponent } from './container-in.component';

describe('ContainerInComponent', () => {
  let component: ContainerInComponent;
  let fixture: ComponentFixture<ContainerInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerInComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
