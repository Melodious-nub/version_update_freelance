import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnloadingDetailsComponent } from './unloading-details.component';

describe('UnloadingDetailsComponent', () => {
  let component: UnloadingDetailsComponent;
  let fixture: ComponentFixture<UnloadingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnloadingDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnloadingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
