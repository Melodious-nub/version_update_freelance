import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SocialPostItem } from 'src/app/model/social-broadcast/social-post.model';
import { SocialPostsService } from '../../service/social-posts.service';
import { SocialPostsDetailsService } from '../../service/social-posts-details.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-social-posts-list',
  templateUrl: './social-posts-list.component.html',
  styleUrls: ['./social-posts-list.component.scss']
})
export class SocialPostsListComponent implements OnInit, OnChanges {
  @Input() productId?: any;
  @Input() showVersionColumn: boolean = false;
  searchControl = new UntypedFormControl('');
  socialPosts: SocialPostItem[] = [];
  filteredPosts: SocialPostItem[] = [];
  isLoading: boolean = false;

  private activeFilters: { status?: string; post_type?: string; selectedCategory?: string } = {};

  pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
    totalPages: 1,
    totalElements: 0
  };
  pageIndex: number = 0;
  pageS: number = 20;
  activeTab: 'posts' | 'campaigns' = 'posts';
  headers = [
    { name: 'DATE', prop: 'date', sortable: true },
    { name: 'POST NAME', prop: 'postName', sortable: true, minWidth: '200px', maxWidth: '300px' },
    { name: 'POST CATEGORY', prop: 'postCategory', sortable: true, minWidth: '150px', maxWidth: '200px' },
    { name: 'CREATION TYPE', prop: 'creationType', sortable: true, minWidth: '130px', maxWidth: '150px' },
    { name: 'PUBLICATION PLATFORMS', prop: 'publicationPlatforms', sortable: false, minWidth: '200px', maxWidth: '250px' },
    { name: 'PUBLICATION DATE | TIME', prop: 'publicationDateTime', sortable: true, minWidth: '180px', maxWidth: '220px' },
    { name: 'VIEWS', prop: 'views', sortable: true },
    { name: 'CLICKS', prop: 'clicks', sortable: true },
    { name: 'STATUS', prop: 'status', type: 'status', sortable: true, minWidth: '100px', maxWidth: '120px' },
    { name: 'PRODUCT NAME', prop: 'product', sortable: true, minWidth: '200px', maxWidth: '250px' },
    { name: 'CAPTIONS', prop: 'captions', sortable: true, minWidth: '280px', maxWidth: '320px' },
    { name: 'ACTIONS', prop: 'actions', type: 'menu', maxWidth: '220px' },
  ];
  displayedHeaders: any[] = [];
  displayedActions: any[] = [];
  tableActions = [
    {
      label: 'Approve',
      icon: 'assets/nicons/approve-square.png',
      action: 'approve',
      type: 'image',
      showOnStatus: ['draft']
    },
    {
      label: 'Reject',
      icon: 'assets/nicons/close-square.png',
      action: 'reject',
      type: 'image',
      showOnStatus: ['draft']
    },
    {
      label: 'Delete',
      icon: 'assets/nicons/delete-square.png',
      action: 'delete',
      type: 'image',
      showOnStatus: ['draft']
    },
  ];

  constructor(
    private socialPostsService: SocialPostsService,
    private detailsService: SocialPostsDetailsService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  goToCampaigns(): void {
    this.activeTab = 'campaigns';
    this.router.navigate(['/home/social-broadcast-management/campaigns']);
  }

  ngOnInit(): void {
    this.updateTableConfig();
    this.updateActiveTabFromUrl();
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        this.updateActiveTabFromUrl();
      }
    });

    this.loadSocialPosts();
  }

  private updateActiveTabFromUrl(): void {
    const url = (this.router && this.router.url) ? this.router.url.toLowerCase() : '';
    if (url.includes('campaign')) {
      this.activeTab = 'campaigns';
    } else {
      this.activeTab = 'posts';
    }
  }

  goToPosts(): void {
    this.activeTab = 'posts';
    this.router.navigate(['/home/social-broadcast-management/social-posts']);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.productId && !changes.productId.firstChange) {
      this.pageIndex = 0;
      this.updateTableConfig();
      this.loadSocialPosts();
    }
  }

  updateTableConfig(): void {
    this.displayedHeaders = this.headers.map(h => ({ ...h }));

    if (this.productId) {
      this.displayedHeaders = this.displayedHeaders.filter(h => h.prop !== 'actions');
      const statusIdx = this.displayedHeaders.findIndex(h => h.prop === 'status');
      if (statusIdx !== -1) {
        const stageHeader = { name: 'STAGE', prop: 'stage', sortable: true, minWidth: '120px' };
        this.displayedHeaders.splice(statusIdx + 1, 0, stageHeader);

        if (this.showVersionColumn) {
          const versionHeader = { name: 'VERSION', prop: 'version', sortable: true, minWidth: '120px' };
          this.displayedHeaders.splice(statusIdx + 2, 0, versionHeader);
        }
      }

      this.displayedActions = [];
    } else {
      this.displayedActions = this.tableActions;
    }
  }

  loadSocialPosts(): void {
    this.isLoading = true;
    const apiFilters = {
      status: this.activeFilters.status,
      post_type: this.activeFilters.post_type,
    };

    const obs = this.productId
      ? this.socialPostsService.getSocialPostsByProduct(this.productId, this.pageIndex + 1, this.pageS, apiFilters)
      : this.socialPostsService.getSocialPosts(this.pageIndex + 1, this.pageS, apiFilters);

    obs.subscribe({
      next: (res: any) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        this.socialPosts = this.formatPostsForDisplay(items);
        this.filteredPosts = [...this.socialPosts];

        if (this.activeFilters.selectedCategory) {
          this.filteredPosts = this.filteredPosts.filter(
            (p: any) => String(p.postCategory) === String(this.activeFilters.selectedCategory)
          );
        }

        this.pageConfig.totalElements = res?.totalElements ?? res?.total ?? this.filteredPosts.length ?? 0;
        this.pageConfig.totalPages = res?.totalPages ?? Math.ceil((res?.total ?? this.filteredPosts.length) / this.pageS) ?? 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading social posts:', error);
        this.isLoading = false;
      }
    });
  }

  onFiltersApplied(filters: { status?: string; post_type?: string; selectedCategory?: string }): void {
    this.activeFilters = filters || {};
    this.pageIndex = 0;
    this.loadSocialPosts();
  }

  formatPostsForDisplay(posts: SocialPostItem[]): any[] {
    return posts.map(post => ({
      ...post,
      date: this.formatDate(post.date),
      publicationDateTime: post.publicationDateTime
        ? this.formatDateTime(post.publicationDateTime)
        : 'N/A',
      views: post.views === 0 ? 'N/A' : post.views.toString(),
      clicks: post.clicks === 0 ? 'N/A' : post.clicks.toString(),
      publicationPlatforms: this.formatPlatforms(post.publicationPlatforms),
      product: post.product || 'N/A',
      version: post.version === null || post.version === undefined || post.version === '' ? 'N/A' : String(post.version)
    }));
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${day}-${month}-${year} | ${time}`;
  }

  formatPlatforms(platforms: string[]): string {
    if (!platforms || platforms.length === 0) return 'N/A';

    const platformIcons: { [key: string]: string } = {
      'instagram': 'assets/nicons/instagram.png',
      'facebook': 'assets/nicons/facebook.png',
      'linkedin': 'assets/nicons/linkedin.png',
      'youtube': 'assets/nicons/youtube.png',
      'twitter': 'assets/nicons/x.png',
    };

    return platforms
      .map(p => {
        const src = platformIcons[p.toLowerCase()] || 'assets/icons/default.png';
        return `<img src="${src}" alt="${p}" title="${p}" style="width:20px;height:20px;margin-right:4px;vertical-align:middle;" />`;
      })
      .join(' ');
  }

  onInput(searchValue: string): void {
    if (!searchValue) {
      this.filteredPosts = [...this.socialPosts];
    } else {
      const search = searchValue.toLowerCase();
      this.filteredPosts = this.socialPosts.filter(post =>
        (post.postName && String(post.postName).toLowerCase().includes(search)) ||
        (post.status && String(post.status).toLowerCase().includes(search)) ||
        (post.product && String(post.product).toLowerCase().includes(search))
      );
    }
    this.pageConfig.totalItems = this.filteredPosts.length;
    this.pageConfig.currentPage = 1;
  }

  filterPosts(filteredPosts: SocialPostItem[]): void {
    this.filteredPosts = filteredPosts;
    this.pageConfig.totalItems = filteredPosts.length;
    this.pageConfig.currentPage = 1;
  }

  sort(event: any): void {
    const { active, direction } = event;

    if (!direction) {
      this.filteredPosts = [...this.socialPosts];
      return;
    }

    this.filteredPosts.sort((a, b) => {
      const aValue = a[active];
      const bValue = b[active];

      if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'string') {
        return direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  pageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadSocialPosts();
  }

  editRecord(post: SocialPostItem): void {}

  onActionClick(event: any): void {
    const { action, row } = event;

    switch (action.action) {
      case 'approve':
        if (!row?.id) return;
        this.isLoading = true;
        this.detailsService.approveSocialPost(row.id, {}).subscribe({
          next: () => {
            try { this.toastr.success('Post approved'); } catch (e) { }
            this.loadSocialPosts();
          },
          error: (err) => {
            console.error('Approve failed', err);
            try { this.toastr.error('Failed to approve the post'); } catch (e) { }
            this.isLoading = false;
          }
        });
        break;
      case 'reject':
        if (!row?.id) return;
        this.isLoading = true;
        this.detailsService.rejectSocialPost(row.id).subscribe({
          next: () => {
            try { this.toastr.success('Post rejected'); } catch (e) { }
            this.loadSocialPosts();
          },
          error: (err) => {
            console.error('Reject failed', err);
            try { this.toastr.error('Failed to reject the post'); } catch (e) { }
            this.isLoading = false;
          }
        });
        break;
      case 'edit':
        this.editRecord(row);
        break;
      case 'view':
        this.viewPost(row);
        break;
      case 'delete':
        this.deletePost(row);
        break;
    }
  }

  viewPost(post: SocialPostItem): void {
    if (post && post.id) {
      if (this.productId) {
        this.router.navigate(['/home/social-broadcast-management/social-posts/detail', post.id]);
      } else {
        this.router.navigate(['detail', post.id], { relativeTo: this.route });
      }
    }
  }

  deletePost(post: SocialPostItem): void {
    if (!post?.id) return;
    this.isLoading = true;
    this.detailsService.deleteSocialPost(post.id).subscribe({
      next: () => {
        try { this.toastr.success('Post deleted'); } catch (e) { }
        this.loadSocialPosts();
      },
      error: (err) => {
        console.error('Delete failed', err);
        try { this.toastr.error('Failed to delete the post'); } catch (e) { }
        this.isLoading = false;
      }
    });
  }

  createManualPost(): void {
    this.router.navigate(['create'], { relativeTo: this.route });
  }
}