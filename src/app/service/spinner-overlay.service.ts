import { Injectable } from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerOverlayService {
  private activeRequests = 0;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  
  /** Observable representing the current loading state */
  public readonly isLoading$ = this.loadingSubject.asObservable().pipe(delay(0));

  constructor() {}

  /**
   * Shows the global spinner. Increments the request counter.
   */
  public show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingSubject.next(true);

      // Failsafe: if the loader is still showing after 35s, force a reset
      setTimeout(() => {
        if (this.loadingSubject.value) {
          this.reset();
        }
      }, 30000);
    }
  }

  /**
   * Hides the global spinner. Decrements the request counter.
   */
  public hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    
    if (this.activeRequests === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Emergency reset for the spinner state.
   */
  public reset(): void {
    this.activeRequests = 0;
    this.loadingSubject.next(false);
  }
}
