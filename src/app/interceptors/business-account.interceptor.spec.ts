import { TestBed } from '@angular/core/testing';

import { BusinessAccountInterceptor } from './business-account.interceptor';

describe('BusinessAccountInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      BusinessAccountInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: BusinessAccountInterceptor = TestBed.inject(BusinessAccountInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
