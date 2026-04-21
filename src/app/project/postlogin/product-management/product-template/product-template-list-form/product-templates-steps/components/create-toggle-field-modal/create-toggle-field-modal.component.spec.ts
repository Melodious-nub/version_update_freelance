import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateToggleFieldModalComponent } from './create-toggle-field-modal.component';

describe('CreateToggleFieldModalComponent', () => {
  let component: CreateToggleFieldModalComponent;
  let fixture: ComponentFixture<CreateToggleFieldModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateToggleFieldModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateToggleFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
