import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialBroadcastManagementComponent } from './social-broadcast-management.component';

describe('SocialBroadcastManagementComponent', () => {
  let component: SocialBroadcastManagementComponent;
  let fixture: ComponentFixture<SocialBroadcastManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SocialBroadcastManagementComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialBroadcastManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
