import { TestBed } from '@angular/core/testing';
import { SocialPostsService } from './social-posts.service';

describe('SocialPostsService', () => {
  let service: SocialPostsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialPostsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
