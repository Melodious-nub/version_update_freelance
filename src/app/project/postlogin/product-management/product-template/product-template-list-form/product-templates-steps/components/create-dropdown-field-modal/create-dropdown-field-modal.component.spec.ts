import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDropdownFieldModalComponent } from './create-dropdown-field-modal.component';

describe('CreateDropdownFieldModalComponent', () => {
  let component: CreateDropdownFieldModalComponent;
  let fixture: ComponentFixture<CreateDropdownFieldModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDropdownFieldModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDropdownFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
