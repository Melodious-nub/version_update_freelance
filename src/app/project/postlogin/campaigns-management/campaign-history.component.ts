import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Location, NgIf, NgClass, NgFor, TitleCasePipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CampaignsApiService } from './service/campaigns-api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { SpinnerOverlayComponent } from '../../../shared/component/spinner-overlay/spinner-overlay.component';

@Component({
    selector: 'app-campaign-history',
    templateUrl: './campaign-history.component.html',
    styleUrls: ['./campaign-history.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        SpinnerOverlayComponent,
        NgClass,
        ExtendedModule,
        MatAccordion,
        NgFor,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        TitleCasePipe,
        DatePipe,
    ],
})
export class CampaignHistoryComponent implements OnInit, AfterViewInit {
  public campaignName: string = 'Campaign History';
  public statusLabel: string = 'N/A';
  public campaignPlatformsForDisplay: string[] = [];
  public campaignPublicationDate: string | null = null;
  public historyItems: Array<any> = [];
  isLoading = false;
  readonly maxVisibleImages = 3;
  @ViewChildren('imageViewport') imageViewports!: QueryList<ElementRef>;
  public sliderStates: Array<{ canPrev: boolean; canNext: boolean }> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private api: CampaignsApiService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const state: any = window.history.state || {};

    const hasHeaderFromState = !!state?.campaignName;

    if (hasHeaderFromState) {
      this.campaignName = state.campaignName;
      this.statusLabel = state.statusLabel;
      this.campaignPlatformsForDisplay =
        state.campaignPlatformsForDisplay || [];
      this.campaignPublicationDate = state.campaignPublicationDate || null;
    }
    const campaignId = Number(this.route.snapshot.paramMap.get('id'));

    if (!campaignId) {
      this.toastr.error('Campaign id not provided. Cannot load history.');
      return;
    }

    this.loadCampaignHistory(campaignId);

    if (!hasHeaderFromState) {
      this.api.getCampaignById(campaignId).subscribe({
        next: (resp: any) => {
          this.campaignName = resp?.name || this.campaignName;
          this.statusLabel = resp?.status || this.statusLabel;
          this.campaignPlatformsForDisplay = (
            resp?.publication_platforms || []
          ).map((p: any) =>
            String(p.platform_name || p.name || '').replace(/^./, (m: string) =>
              m.toUpperCase(),
            ),
          );
          this.campaignPublicationDate = resp?.publish_date || null;
        },
        error: () => {},
      });
    }
  }

  ngAfterViewInit(): void {
    this.imageViewports.changes.subscribe(() => {
      this.attachScrollListeners();
      this.updateAllSliderStates();
    });
  }

  computeSanitizedHtml(desc: any): SafeHtml {
    const value = desc || '';
    if (!value) return this.sanitizer.bypassSecurityTrustHtml('');
    const asStr = String(value);
    const containsHtml = /<[^>]+>/.test(asStr);
    if (containsHtml) {
      const withBreaks = asStr.replace(/\r\n|\r|\n/g, '<br/>');
      return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
    }
    const escaped = asStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const withBreaks = escaped.replace(/\r\n|\r|\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
  }

  private loadCampaignHistory(campaignId: number) {
    this.isLoading = true;
    this.api.getCampaignHistory(campaignId).subscribe({
      next: (resp: any) => {
        try {
          const items = Array.isArray(resp.history) ? resp.history : [];
          const campaignType = resp?.campaign_type
            ? String(resp.campaign_type).toLowerCase()
            : '';

          const campaignAudience = resp?.personalized_type
            ? String(resp.personalized_type).toLowerCase()
            : null;

          const storagePrefix = String(environment?.imgUrl ?? '');
          this.historyItems = items.map((it: any) => {
            const mappedMedia = Array.isArray(it.media)
              ? it.media.map((m: any) => {
                  const mediaType = (m.media_type || '').toLowerCase();
                  const key = m.media_key || '';
                  let url = String(key || '');
                  if (!/^https?:\/\//i.test(url) && mediaType === 'image') {
                    url = storagePrefix + url;
                  }
                  return {
                    id: m.id,
                    media_type: mediaType,
                    url,
                    prompt: m.prompt,
                  };
                })
              : [];

            const images = mappedMedia
              .filter((m: any) => m.media_type === 'image')
              .map((m: any) => m.url);
            const pdfItem = mappedMedia.find(
              (m: any) => m.media_type === 'pdf',
            );

            const customers = Array.isArray(it.customers)
              ? it.customers.map((c: any) => ({
                  customerName:
                    c.customer_name || c.customerName || c.customer || 'N/A',
                  customerEmail:
                    c.customer_email || c.customerEmail || c.email || '',
                  customerContact: {
                    number:
                      c.customer_phone ||
                      c.customer_phone_number ||
                      c.customerContact?.number ||
                      c.phone ||
                      '',
                  },
                  whatsapp: !!c.whatsapp,
                  email: !!c.email,
                  message_status: c.message_status || c.status || null,
                  sent_at: c.sent_at || null,
                }))
              : [];

            const runDate = it.publish_date || it.created_at || null;
            const typeVal = campaignType;
            const audience = campaignAudience;

            const sharingPlatforms = Array.isArray(resp?.publication_platforms)
              ? resp.publication_platforms.map((p: any) =>
                  String(p.platform_name || p.name || '').replace(
                    /^./,
                    (m: string) => m.toUpperCase(),
                  ),
                )
              : Array.isArray(it.publication_platforms)
                ? it.publication_platforms.map((p: any) =>
                    String(p.platform_name || p.name || '').replace(
                      /^./,
                      (m: string) => m.toUpperCase(),
                    ),
                  )
                : [];

            return {
              id: it.id,
              content: it.content,
              status: it.status,
              publish_date: it.publish_date,
              created_at: it.created_at,
              updated_at: it.updated_at,
              media: mappedMedia,
              images,
              pdfUrl: pdfItem ? pdfItem.url : null,
              customers,
              runDate,
              type: typeVal,
              audience,
              sharingPlatforms,
              startIndex: 0,
            };
          });
          this.sliderStates = this.historyItems.map(() => ({ canPrev: false, canNext: false }));
          setTimeout(() => {
            this.attachScrollListeners();
            this.updateAllSliderStates();
          }, 50);
        } catch (e) {
          console.error('Error mapping history response', e);
          this.toastr.error('Failed to parse campaign history');
        } finally {
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        this.toastr.error('Failed to load campaign history');
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.location.back();
  }

  prevImages(idx: number) {
    const vp = this.getViewportForIndex(idx);
    if (!vp) return;
    const visible = Math.min(this.maxVisibleImages, this.historyItems[idx]?.images?.length || 1);
    const step = Math.floor(vp.clientWidth / visible);
    vp.scrollBy({ left: -step, behavior: 'smooth' });
    setTimeout(() => this.updateSliderStateForIndex(idx), 250);
  }

  nextImages(idx: number) {
    const vp = this.getViewportForIndex(idx);
    if (!vp) return;
    const visible = Math.min(this.maxVisibleImages, this.historyItems[idx]?.images?.length || 1);
    const step = Math.floor(vp.clientWidth / visible);
    vp.scrollBy({ left: step, behavior: 'smooth' });
    setTimeout(() => this.updateSliderStateForIndex(idx), 250);
  }

  private getViewportForIndex(idx: number): HTMLElement | null {
    const arr = this.imageViewports ? this.imageViewports.toArray() : [];
    const ref = arr[idx];
    return ref ? (ref.nativeElement as HTMLElement) : null;
  }

  private attachScrollListeners() {
    const arr = this.imageViewports ? this.imageViewports.toArray() : [];
    arr.forEach((v, i) => {
      const el = v.nativeElement as HTMLElement;
      el.removeEventListener('scroll', (el as any).__historyScrollHandler);
      const handler = () => this.updateSliderStateForIndex(i);
      (el as any).__historyScrollHandler = handler;
      el.addEventListener('scroll', handler, { passive: true });
    });
  }

  private updateAllSliderStates() {
    for (let i = 0; i < this.historyItems.length; i++) this.updateSliderStateForIndex(i);
  }

  private updateSliderStateForIndex(idx: number) {
    const vp = this.getViewportForIndex(idx);
    if (!vp) return;
    const canPrev = vp.scrollLeft > 5;
    const canNext = vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 5;
    this.sliderStates[idx] = { canPrev, canNext };
  }

  getStatusChipClass(status: string | null | undefined): string {
    const s = (status || '').toString().toLowerCase();
    switch (s) {
      case 'draft':
        return 'chip-draft';
      case 'running':
        return 'chip-running';
      case 'completed':
      case 'complete':
        return 'chip-completed';
      default:
        return 'chip-draft';
    }
  }
}
