import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-social-callback',
    templateUrl: './social-callback.component.html',
    styleUrls: ['./social-callback.component.scss'],
    imports: [
        NgClass,
        ExtendedModule,
        TitleCasePipe
    ]
})
export class SocialCallbackComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);

  provider = 'N/A';
  status = 'N/A';
  providerIcon = '';
  statusIcon = '';
  message = '';
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.sub = this.route.queryParamMap.subscribe((params) => {
      this.provider = params.get('provider') || 'N/A';
      this.status = params.get('status') || 'N/A';
      this.message = params.get('message') || '';
      this.updateIcons();
      this.notifyOpenerAndClose();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isSuccess(): boolean {
    return (this.status || '').toLowerCase() === 'success';
  }

  private updateIcons(): void {
    const p = (this.provider || '').toLowerCase();
    const s = (this.status || '').toLowerCase();

    // provider icon (fallback to generic share)
    const providerMap: { [k: string]: string } = {
      facebook: 'facebook.png',
      instagram: 'instagram.png',
      linkedin: 'linkedin.png',
      whatsapp: 'whatsapp 1.png',
      youtube: 'youtube.png',
      mail: 'mail.png',
    };
    this.providerIcon = providerMap[p]
      ? `assets/nicons/${providerMap[p]}`
      : 'assets/nicons/share.png';

    // status icon (success/failure/other)
    if (s === 'success' || s === 'ok' || s === 'completed') {
      this.statusIcon = 'assets/nicons/tick.png';
    } else if (s === 'failure' || s === 'failed' || s === 'error' || s === 'cancel') {
      this.statusIcon = 'assets/nicons/cross.png';
    } else {
      this.statusIcon = 'assets/nicons/info.png';
    }
  }

  private notifyOpenerAndClose(): void {
    try {
      // If this window was opened as a popup, notify the opener window
      if (window && (window as any).opener && !(window as any).opener.closed) {
        const msg = {
          type: 'social-callback',
          provider: this.provider,
          status: this.status,
          message: this.message || undefined,
        };
        // Wait longer so the callback UI is clearly visible to the user,
        // then inform the opener and allow this window to close itself shortly afterwards.
        setTimeout(() => {
          try {
            (window as any).opener.postMessage(msg, window.location.origin);
          } catch (e) {
            try {
              (window as any).opener.postMessage(msg, '*');
            } catch (e2) {
              // ignore
            }
          }

          // allow the user ~2s to see success UI before closing
          setTimeout(() => {
            try {
              window.close();
            } catch (e) {}
          }, 2000);
        }, 2000);
      }
    } catch (err) {
      // ignore
    }
  }
}
