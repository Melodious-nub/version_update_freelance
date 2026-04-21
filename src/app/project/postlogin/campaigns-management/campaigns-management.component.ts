import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CampaignsApiService } from './service/campaigns-api.service';

interface Campaign {
  id?: number;
  date: string;
  upcoming_date?: string;
  regenerate_date?: string;
  interval_type?: string;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  scheduled_time: string;
  status: string;
}

interface CampaignApiItem {
  id?: number;
  campaign_name?: string;
  campaign_type?: string;
  start_date?: string;
  end_date?: string;
  scheduled_time?: string;
  status?: string;
  created_at?: string;
  next_run_time?: string;
  last_run_time?: string;
}

@Component({
  selector: 'app-campaigns-management',
  templateUrl: './campaigns-management.component.html',
  styleUrls: ['./campaigns-management.component.scss'],
})
export class CampaignsManagementComponent implements OnInit {
  searchControl = new UntypedFormControl('');
  socialPosts: Campaign[] = [];
  filtered: Campaign[] = [];
  showUpcoming = false;
  upcomingCampaigns: Campaign[] = [];
  upcomingFiltered: Campaign[] = [];
  upcomingFilters: any = {};
  upcomingHeaders: any[] = [
    { name: 'UPCOMING DATE', prop: 'upcoming_date', sortable: true },
    { name: 'CAMPAIGN NAME', prop: 'name', sortable: true, minWidth: '200px' },
    { name: 'CAMPAIGN TYPE', prop: 'type', sortable: true, minWidth: '150px' },
    { name: 'INTERVAL TYPE', prop: 'interval_type', sortable: true, minWidth: '120px' },
    { name: 'REGENERATE DATE', prop: 'regenerate_date', sortable: true, minWidth: '140px' },
    { name: 'START DATE', prop: 'start_date', sortable: true, minWidth: '140px' },
    { name: 'END DATE', prop: 'end_date', sortable: true, minWidth: '140px' },
    { name: 'SCHEDULED TIME', prop: 'scheduled_time', sortable: true, minWidth: '140px' },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true, minWidth: '100px' },
  ];
  isLoading = false;

  private activeFilters: { status?: string } = {};
  pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
    totalPages: 1,
    totalElements: 0,
  };
  pageIndex = 0;
  pageS = 20;
  activeTab: 'campaigns' | 'upcoming' = 'campaigns';
  headers = [
    { name: 'CREATED DATE', prop: 'date', sortable: true },
    { name: 'CAMPAIGN NAME', prop: 'name', sortable: true, minWidth: '200px', maxWidth: '100%' },
    { name: 'CAMPAIGN TYPE', prop: 'type', sortable: true, minWidth: '150px', maxWidth: '100%' },
    { name: 'START DATE', prop: 'start_date', sortable: true, minWidth: '140px' },
    { name: 'END DATE', prop: 'end_date', sortable: true, minWidth: '140px' },
    { name: 'SCHEDULED TIME', prop: 'scheduled_time', sortable: true, minWidth: '140px' },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true, minWidth: '100px', maxWidth: '300px !important' },
  ];

  tableActions: any[] = [];

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private campaignsApi: CampaignsApiService
  ) {}

  ngOnInit(): void {
    this.updateActiveTabFromUrl();
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) this.updateActiveTabFromUrl();
    });

    this.loadCampaigns();
  }

  private updateActiveTabFromUrl(): void {
    const url = (this.router && this.router.url) ? this.router.url.toLowerCase() : '';
    if (url.includes('upcoming')) {
      this.activeTab = 'upcoming';
    } else {
      this.activeTab = 'campaigns';
    }
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.campaignsApi.getCampaigns(this.pageIndex + 1, this.pageS, this.activeFilters).subscribe({
      next: (res: any) => {
        const items: CampaignApiItem[] = Array.isArray(res?.campaigns) ? res.campaigns : [];
        this.socialPosts = this.formatCampaignsForDisplay(items);
        this.filtered = [...this.socialPosts];

        const total = Number(res?.total ?? this.socialPosts.length ?? 0);
        this.pageConfig.totalElements = isFinite(total) ? total : 0;
        this.pageConfig.totalPages = Math.max(1, Math.ceil(this.pageConfig.totalElements / this.pageS));

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.socialPosts = [];
        this.filtered = [];
        this.pageConfig.totalElements = 0;
        this.pageConfig.totalPages = 1;
        this.isLoading = false;
      },
    });
  }

  private formatCampaignsForDisplay(items: CampaignApiItem[]): Campaign[] {
    return (items || []).map((c: CampaignApiItem) => {
      const createdAt = c?.created_at ?? null;
      const startDate = c?.start_date ?? null;
      const endDate = c?.end_date ?? null;
      const scheduled = c?.scheduled_time ?? null;
      const typeRaw = String(c?.campaign_type ?? '').trim();
      const typeLabel = typeRaw ? typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1) : 'N/A';

      const statusRaw = String(c?.status ?? '').trim();
      const status = statusRaw
        ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)
        : 'N/A';

      return {
        id: c?.id,
        date: this.formatDate(createdAt),
        name: String(c?.campaign_name ?? 'N/A'),
        type: typeLabel,
        start_date: startDate ? this.formatDate(startDate) : 'N/A',
        end_date: endDate ? this.formatDate(endDate) : 'N/A',
        scheduled_time: scheduled ? this.formatScheduledTime(scheduled) : 'N/A',
        status,
      };
    });
  }

  private formatScheduledTime(time24: any): string {
    if (!time24) return 'N/A';
    const s = String(time24).trim();
    const m = s.match(/^([0-9]{1,2}):([0-9]{2})$/);
    if (!m) return s;

    try {
      const utcHours = parseInt(m[1], 10);
      const utcMinutes = parseInt(m[2], 10);
      const now = new Date();
      const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), utcHours, utcMinutes, 0));
      const localHours = utcDate.getHours();
      const localMinutes = utcDate.getMinutes();
      const ampm = localHours >= 12 ? 'PM' : 'AM';
      let h = localHours % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')} ${ampm}`;
    } catch (e) {
      let hh = parseInt(m[1], 10);
      const mm = m[2];
      const ampm = hh >= 12 ? 'PM' : 'AM';
      let h = hh % 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, '0')}:${mm} ${ampm}`;
    }
  }

  private formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  onInput(searchValue: string): void {
    if (!searchValue) {
      if (this.showUpcoming) {
        this.upcomingFiltered = [...this.upcomingCampaigns];
        this.pageConfig.totalElements = this.upcomingFiltered.length;
      } else {
        this.filtered = [...this.socialPosts];
        this.pageConfig.totalElements = this.filtered.length;
      }
    } else {
      const q = searchValue.toLowerCase();
      if (this.showUpcoming) {
        this.upcomingFiltered = this.upcomingCampaigns.filter(
          (p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.status.toLowerCase().includes(q)
        );
        this.pageConfig.totalElements = this.upcomingFiltered.length;
      } else {
        this.filtered = this.socialPosts.filter(
          (p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.status.toLowerCase().includes(q)
        );
        this.pageConfig.totalElements = this.filtered.length;
      }
    }
    this.pageConfig.currentPage = 1;
  }

  pageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    if (this.showUpcoming) {
      this.loadUpcoming(this.pageIndex + 1, this.pageS);
    } else {
      this.loadCampaigns();
    }
  }

  showUpcomingList(): void {
    if (this.showUpcoming) return;
    this.showUpcoming = true;
    this.activeTab = 'upcoming';
    this.pageIndex = 0;
    this.loadUpcoming(1, this.pageS);
  }

  showCampaignsList(): void {
    if (!this.showUpcoming) return;
    this.showUpcoming = false;
    this.activeTab = 'campaigns';
    this.pageIndex = 0;
    this.pageConfig.currentPage = 1;
    this.loadCampaigns();
  }

  private loadUpcoming(page: number = 1, pageSize: number = 20, filters?: any): void {
    try {
      this.isLoading = true;
      this.campaignsApi.getUpcomingCampaigns(page, pageSize, filters).subscribe({
        next: (res: any) => {
          try {
            const items = Array.isArray(res?.campaigns) ? res.campaigns : [];
            const mapped: Campaign[] = (items || []).map((c: any) => {
              const id = Number(c?.campaign_id ?? c?.id ?? 0) || 0;
              const name = String(c?.campaign_name ?? 'N/A');
              const typeRaw = String(c?.campaign_type ?? '').trim();
              const type = typeRaw ? typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1) : 'N/A';
              const interval_type_raw = String(c?.interval_type).trim();
              const interval_type = interval_type_raw
                ? interval_type_raw.charAt(0).toUpperCase() + interval_type_raw.slice(1).toLowerCase()
                : 'N/A';
              const upcomingRaw = c?.next_run_time ?? null;
              const regenerateRaw = c?.regenerated_date ?? null;
              const startRaw = c?.start_date ?? null;
              const endRaw = c?.end_date ?? null;
              const scheduled = c?.scheduled_time ?? '';
              const statusRaw = String(c?.status ?? '').trim();

              return {
                id,
                date: this.formatDate(c?.created_at ?? c?.createdAt ?? null),
                upcoming_date: upcomingRaw ? this.formatDate(upcomingRaw) : 'N/A',
                regenerate_date: regenerateRaw ? this.formatDate(regenerateRaw) : 'N/A',
                name,
                type,
                interval_type,
                start_date: startRaw ? this.formatDate(startRaw) : 'N/A',
                end_date: endRaw ? this.formatDate(endRaw) : 'N/A',
                scheduled_time: scheduled ? this.formatScheduledTime(scheduled) : 'N/A',
                status: statusRaw ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1) : 'N/A',
              } as Campaign;
            });

            this.upcomingCampaigns = mapped;
            this.upcomingFiltered = [...this.upcomingCampaigns];

            const total = Number(res?.total ?? mapped.length ?? 0);
            this.pageConfig.totalElements = isFinite(total) ? total : 0;
            this.pageConfig.totalPages = Math.max(1, Math.ceil(this.pageConfig.totalElements / pageSize));
          } catch (e) {
            this.upcomingCampaigns = [];
            this.upcomingFiltered = [];
            this.pageConfig.totalElements = 0;
            this.pageConfig.totalPages = 1;
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Failed to load upcoming campaigns', err);
          this.upcomingCampaigns = [];
          this.upcomingFiltered = [];
          this.pageConfig.totalElements = 0;
          this.pageConfig.totalPages = 1;
          this.isLoading = false;
        },
      });
    } catch (e) {
      this.upcomingCampaigns = [];
      this.upcomingFiltered = [];
      this.pageConfig.totalElements = 0;
      this.pageConfig.totalPages = 1;
      this.isLoading = false;
    }
  }

  onFiltersApplied(filters: any): void {
    if (this.showUpcoming) {
      this.upcomingFilters = filters || {};
      this.pageIndex = 0;
      this.loadUpcoming(1, this.pageS, this.upcomingFilters);
    } else {
      this.activeFilters = filters?.status ? { status: filters.status } : {};
      this.pageIndex = 0;
      this.loadCampaigns();
    }
  }

  createCampaign(): void {
    this.router.navigate(['create'], { relativeTo: (this as any).route });
  }

  viewCampaign(campaign: Campaign | any): void {
    const id = Number(campaign?.id);
    if (!isFinite(id) || id <= 0) return;
    this.router.navigate(['detail', id], { relativeTo: this.route });
  }
}
