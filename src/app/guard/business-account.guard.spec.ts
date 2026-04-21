import { TestBed } from '@angular/core/testing';

import { BusinessAccountGuard } from './business-account.guard';

describe('BusinessAccountGuard', () => {
  let guard: BusinessAccountGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BusinessAccountGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
