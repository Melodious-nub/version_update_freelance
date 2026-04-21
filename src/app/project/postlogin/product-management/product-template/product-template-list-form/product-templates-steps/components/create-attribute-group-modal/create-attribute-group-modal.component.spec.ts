import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttributeGroupModalComponent } from './create-attribute-group-modal.component';

describe('CreateAttributeGroupModalComponent', () => {
  let component: CreateAttributeGroupModalComponent;
  let fixture: ComponentFixture<CreateAttributeGroupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAttributeGroupModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAttributeGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
