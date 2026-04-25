import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private ngZone = inject(NgZone);


  handleError(error: any): void {
    const actualError = (error && (error.rejection || error)) || error;
    const message = actualError?.message || actualError?.toString?.() || '';

    const isChunkLoadError =
      actualError?.name === 'ChunkLoadError' ||
      /ChunkLoadError/.test(message) ||
      /Loading chunk [\w-]+ failed/i.test(message);

    if (isChunkLoadError) {
      // When a lazy-loaded chunk fails (usually after a new deploy),
      // reload the page so the app can bootstrap with the latest assets.
      this.ngZone.runOutsideAngular(() => {
        window.location.reload();
      });
      return;
    }

    // Fallback: log other errors to the console for now.
    // You can integrate with a remote logging service here.
    // eslint-disable-next-line no-console
    console.error('GlobalErrorHandler caught error:', error);
  }
}
