import { Location, NgClass, TitleCasePipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { environment } from 'src/environments/environment';
import { CampaignsApiService } from './service/campaigns-api.service';
import { CommonService } from 'src/app/service/common.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { APPCOMMONHELPERS } from 'src/app/helpers/appcommonhelpers';
import {
  formatGeneratedContentToHtml,
  htmlToSocialText,
} from 'src/app/helpers/content-utils';
import validateEndDate from 'src/app/helpers/date-validators';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DadyinSearchSelectNewComponent } from '../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinSearchableSelectComponent } from '../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { TimePickerComponent } from '../../../shared/widgets/time-picker/time-picker.component';
import { DadyinSelectComponent } from '../../../shared/widgets/dadyin-select/dadyin-select.component';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { SpinnerOverlayComponent } from '../../../shared/component/spinner-overlay/spinner-overlay.component';

type ProductImageTile = {
  productId: any;
  productLabel: string;
  fileName: string;
  url: string;
  imageIndex: number;
  imageTotal: number;
};

@Component({
    selector: 'app-campaign-detail',
    templateUrl: './campaign-detail.component.html',
    styleUrls: ['./campaign-detail.component.scss'],
    imports: [
        SpinnerOverlayComponent,
        NgClass,
        ExtendedModule,
        DadyinButtonComponent,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        DadyinInputComponent,
        MatTooltip,
        DadyinSelectComponent,
        TimePickerComponent,
        DadyinSearchableSelectComponent,
        DadyinSearchSelectNewComponent,
        CKEditorModule,
        TitleCasePipe,
        DatePipe
    ]
})
export class CampaignDetailComponent implements OnInit {
  public Editor: any = (ClassicEditor as any).default || ClassicEditor;
  public editorConfig: any = {
    toolbar: ['bulletedList', 'numberedList', '|', 'undo', 'redo']
  };

  campaignForm: UntypedFormGroup;
  isLoading = false;
  todayForInput: string = '';
  startDateForInput: string = '';
  startSelected = false;
  campaignTooltip: string =
    'Campaigns help you generate posts. Use "Personalised" for single personalised campaigns and "Interval" for recurring/automated campaigns. Configure interval type and value for recurring schedules.';
  productsForDropdown: any[] = [];
  private productsFilter = "&filter=status!'DELETED'";
  purchaseRows: any[] = [];
  purchaseNameSelection: boolean[] = [];
  purchaseWhatsappSelection: boolean[] = [];
  purchaseEmailSelection: boolean[] = [];
  purchasePdfUrl: string | null = null;
  private contentPdfUrl: string | null = null;
  private campaignSelectedCustomers: any[] = [];
  private pendingSelectedProductIds: Array<number | string> | null = null;
  private pendingSelectedProductNames: Array<string> | null = null;
  private isHydratingFromApi: boolean = false;
  private readonly allowProductApiCalls = false;

  connectedSocialPlatforms: Array<{ name: string; icon: string }> = [];
  private connectedPlatformNames: string[] = [];
  private connectedPlatformIdsCsv: string = '';
  public campaignPlatformsForDisplay: string[] = [];
  public campaignPublicationDate: string | null = null;

  @ViewChild('refFileInput') refFileInputRef!: ElementRef<HTMLInputElement>;
  selectedAttachments: Array<{ file: File; url: string; name: string }> = [];
  maxAttachments = 3;
  allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  productImageBaseUrl: string = environment?.imgUrl || '';
  productImagesForDisplay: ProductImageTile[] = [];
  productImagesPageIndex: number = 0;
  productImagesPageSize: number = 4;

  private latestContentId: number | null = null;
  private existingMediaKeyToId: Map<string, number> = new Map();

  generatedCampaignImageUrl: string | null = null;
  generatedCampaignImages: Array<{
    url: string;
    mediaId?: number | null;
    mediaKey?: string | null;
    mediaType?: string;
    isNew?: boolean;
    productId?: number;
    productName?: string;
  }> = [];
  generatedCampaignSelectedIndex: number = 0;

  private purchaseHistorySub: Subscription | null = null;

  isModified = false;
  private initialSnapshot: string | null = null;
  private snapshotSub: any = null;

  campaignId: number | null = null;
  campaignName: string = 'Campaign Details';
  statusLabel: string = 'N/A';
  private campaignStatus: string | null = null;
  private editableFlag: boolean = false;

  private ckEditorInstance: any = null;
  private pendingEditorValue: string | null = null;
  private readonly ckEditorReadOnlyKey = 'campaign-detail-readonly';

  private suppressModifiedTracking: boolean = false;

  private suppressModifiedFor(ms: number = 350): void {
    try {
      this.suppressModifiedTracking = true;
      setTimeout(() => {
        this.suppressModifiedTracking = false;
      }, Math.max(0, Number(ms) || 0));
    } catch (e) {
      this.suppressModifiedTracking = false;
    }
  }

  private isCompletedStatus(status: any): boolean {
    const s = String(status ?? '').trim().toLowerCase();
    return s === 'completed' || s === 'complete';
  }

  get isCompleted(): boolean {
    return this.isCompletedStatus(this.statusLabel);
  }

  get isDraft(): boolean {
    const status = this.campaignStatus?.toLowerCase();
    return status === 'draft';
  }

  get isRunning(): boolean {
    const status = this.campaignStatus?.toLowerCase();
    return status === 'running';
  }

  get isPersonalizedInterval(): boolean {
    const type = this.campaignForm.get('type')?.value;
    return type === 'Personalised';
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

  get canEditCampaignName(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft || this.isRunning) return true;
    return false;
  }

  get canEditPostType(): boolean {
    if (this.isCompleted) return false;
    if (this.isRunning) return true;
    if (this.isDraft) return true;
    return false;
  }

  get canEditCampaignType(): boolean {
    return false;
  }

  get canEditPersonalizedType(): boolean {
    return false;
  }

  get canEditStartDate(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft) return true;
    return false;
  }

  get canEditEndDate(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft || this.isRunning) return true;
    return false;
  }

  get canEditTime(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft || this.isRunning) return true;
    return false;
  }

  get canEditIntervalType(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft) return true;
    return false;
  }

  get canEditProduct(): boolean {
    return false;
  }

  get canEditPrompt(): boolean {
    if (this.isCompleted) return false;
    if (this.isPersonalizedInterval) return false;
    if (this.isDraft && this.editableFlag) return true;
    if (this.isRunning && this.editableFlag) return true;
    return false;
  }

  get canEditDescription(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft && this.editableFlag) return true;
    if (this.isRunning && this.editableFlag) return true;
    return false;
  }

  get canEditCustomerTable(): boolean {
    if (this.isCompleted) return false;
    if (this.isDraft && this.editableFlag) return true;
    if (this.isRunning && this.editableFlag) return true;
    return false;
  }

  get canGenerateContent(): boolean {
    if (this.isCompleted) return false;
    if (this.isPersonalizedInterval) {
      if (this.isDraft && this.editableFlag) return true;
      if (this.isRunning && this.editableFlag) return true;
      return false;
    }
    if (this.isDraft && this.editableFlag) return true;
    if (this.isRunning && this.editableFlag) return true;
    return false;
  }

  intervalTypeOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  postTypeOptions = [
    { label: 'Festival Post', value: 'Festival Post' },
    { label: 'Product Post', value: 'Product Post' },
    { label: 'Service Post', value: 'Service Post' },
    { label: 'Sale Post', value: 'Sale Post' },
    { label: 'Clearance Post', value: 'Clearance Post' },
  ];

  maxProductSelection = 3;

  get productSelectionCount(): number {
    try {
      const v = this.productControl?.value;
      if (v == null || v === '') return 0;
      if (Array.isArray(v)) return v.length;
      return 1;
    } catch (e) {
      return 0;
    }
  }

  get hasProductImagesSlider(): boolean {
    return Array.isArray(this.productImagesForDisplay) && this.productImagesForDisplay.length > this.productImagesPageSize;
  }

  get canNextProductImagesPage(): boolean {
    try {
      const total = this.productImagesForDisplay.length;
      const nextStart = (this.productImagesPageIndex + 1) * this.productImagesPageSize;
      return nextStart < total;
    } catch (e) {
      return false;
    }
  }

  get pagedProductImages(): ProductImageTile[] {
    try {
      const start = this.productImagesPageIndex * this.productImagesPageSize;
      const end = start + this.productImagesPageSize;
      return this.productImagesForDisplay.slice(start, end);
    } catch (e) {
      return [];
    }
  }

  prevProductImagesPage() {
    if (this.productImagesPageIndex > 0) {
      this.productImagesPageIndex--;
    }
  }

  nextProductImagesPage() {
    if (this.canNextProductImagesPage) {
      this.productImagesPageIndex++;
    }
  }

  private buildProductImageUrl(fileNameOrUrl: any): string {
    const v = fileNameOrUrl == null ? '' : String(fileNameOrUrl).trim();
    if (!v || v.toLowerCase() === 'undefined') return '';
    if (/^https?:\/\//i.test(v)) return v;
    const base = String(this.productImageBaseUrl || '').replace(/\/+$/g, '');
    if (!base) return v;
    return `${base}/${encodeURI(v.replace(/^\/+/, ''))}`;
  }

  private rebuildProductImagesFromCampaignData() {
    try {
      const products = this.campaignForm?.get('product')?.value;
      if (!Array.isArray(products) || products.length === 0) {
        this.productImagesForDisplay = [];
        this.productImagesPageIndex = 0;
        return;
      }

      const tiles: ProductImageTile[] = [];
      products.forEach((prod: any) => {
        const productId = prod?.id ?? prod?.productId ?? null;
        const productLabel = APPCOMMONHELPERS.getProductLabel(prod) || (prod?.name ?? prod?.productName ?? 'Product');
        const images = prod?.image ? [prod.image] : (Array.isArray(prod?.images) ? prod.images : []);
        
        images.forEach((img: any, idx: number) => {
          const fileName = typeof img === 'string' ? img : (img?.image_key ?? img?.fileName ?? '');
          if (fileName) {
            tiles.push({
              productId,
              productLabel,
              fileName,
              url: this.buildProductImageUrl(fileName),
              imageIndex: idx + 1,
              imageTotal: images.length
            });
          }
        });
      });

      this.productImagesForDisplay = tiles;
      this.productImagesPageIndex = 0;
    } catch (e) {
      this.productImagesForDisplay = [];
      this.productImagesPageIndex = 0;
    }
  }

  get showProductImages(): boolean {
    try {
      const type = this.campaignForm?.get('type')?.value;
      const personalizedType = this.campaignForm?.get('audience')?.value;
      
      if (type === 'Interval') {
        return this.productImagesForDisplay.length > 0;
      }
      
      if (type === 'Personalised' && personalizedType === 'Product') {
        return this.productImagesForDisplay.length > 0;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private campaignsApi: CampaignsApiService,
    private commonService: CommonService,
    public toastr: ToastrService
  ) {
    this.campaignForm = this.fb.group({
      prompt: [''],
      campaignDescription: [''],
      name: [''],
      postType: [''],
      type: ['Personalised'],
      audience: ['Product'],
      product: [''],
      status: [''],
      sharingOn: [''],
      startDate: [''],
      endDate: [''],
      publicationTime: [''],
      intervalType: [''],
      intervalValue: [1],
      modify: [false],
    });

    this.applyIntervalEnabledState(this.campaignForm.get('type')?.value);
  }

  public navigateToHistory(): void {
    try {
      const state = {
        campaignName: this.campaignName,
        statusLabel: this.statusLabel,
        campaignPlatformsForDisplay: this.campaignPlatformsForDisplay,
        campaignPublicationDate: this.campaignPublicationDate,
        type: this.campaignForm.get('type')?.value,
        audience: this.campaignForm.get('audience')?.value,
      };
      const parent = this.route.parent ?? this.route;
      this.router.navigate(['history', this.campaignId], { relativeTo: parent, state });
    } catch (e) {
      console.log('Relative navigation to campaign history failed, trying absolute route...', e);
    }
  }

  ngOnInit(): void {
    this.isModified = false;

    const idParam = this.route.snapshot.paramMap.get('id');
    const idNum = Number(idParam);
    this.campaignId = isFinite(idNum) && idNum > 0 ? idNum : null;

    if (!this.campaignId) {
      return;
    }

    this.loadCampaign(this.campaignId);

    try {
      this.todayForInput = this.formatDateForInput(new Date());
    } catch (e) {
      this.todayForInput = '';
    }

    try {
      const endCtl = this.campaignForm.get('endDate');
      const startCtl = this.campaignForm.get('startDate');
      if (startCtl) {
        startCtl.valueChanges.subscribe((v) => {
          const dt = this.toJsDate(v);
          if (dt) {
            this.startSelected = true;
            this.startDateForInput = this.formatDateForInput(dt);
            try { endCtl?.enable({ emitEvent: false }); } catch (e) { }
            const endVal = endCtl?.value;
            const endDt = this.toJsDate(endVal);
            if (endDt && endDt.getTime() < dt.getTime()) {
              try { endCtl?.setValue('', { emitEvent: false }); } catch (e) { }
            }
          } else {
            this.startSelected = false;
            this.startDateForInput = '';
            try { endCtl?.setValue('', { emitEvent: false }); } catch (e) { }
            try { endCtl?.disable({ emitEvent: false }); } catch (e) { }
          }
          try { this.cdr.detectChanges(); } catch (e) { }
        });
      }
    } catch (e) { }

    try {
      const typeCtl = this.campaignForm.get('type');
      if (typeCtl) {
        typeCtl.valueChanges.subscribe((v) => {
          this.applyIntervalEnabledState(v);
          this.updateSharingOnPreview();
          try { this.cdr.detectChanges(); } catch (e) { }
        });
      }
    } catch (e) { }

    try {
      const prodCtl = this.campaignForm.get('product');
      if (prodCtl) {
        prodCtl.valueChanges.subscribe((v) => {
          try {
            if (this.isHydratingFromApi) return;

            const audience = String(this.campaignForm.get('audience')?.value ?? '').toLowerCase();
            if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
              this.purchaseRows = [];
              this.purchaseNameSelection = [];
              this.purchaseWhatsappSelection = [];
              this.purchaseEmailSelection = [];
              this.purchasePdfUrl = null;
              this.contentPdfUrl = null;
              try { this.cdr.detectChanges(); } catch (e) { }
              return;
            }

            if (String(this.campaignForm.get('type')?.value ?? '').toLowerCase() === 'personalised') {
              if (audience === 'product') {
                const id = this.extractSelectedProductId();
                if (id) this.fetchPurchaseHistoryIfNeeded();
              } else if (audience === 'retail') {
                if (v) this.fetchPurchaseHistoryIfNeeded();
              }
            }
          } catch (e) { }
        });
      }
    } catch (e) { }

    try {
      const audienceCtl = this.campaignForm.get('audience');
      if (audienceCtl) {
        audienceCtl.valueChanges.subscribe((v) => {
          try {
            const val = String(v ?? '').trim().toLowerCase();
            try { this.productControl?.setValue('', { emitEvent: false }); } catch (e) { }
            this.purchaseRows = [];
            this.purchaseNameSelection = [];
            this.purchaseWhatsappSelection = [];
            this.purchaseEmailSelection = [];
            this.purchasePdfUrl = null;
            this.contentPdfUrl = null;

            if (val === 'retail') {
              this.loadRetailCategories();
            } else {
              this.loadProducts('');
            }

            try { this.cdr.detectChanges(); } catch (e) { }
          } catch (e) { }
        });
      }
    } catch (e) { }

    try {
      this.snapshotSub = this.campaignForm.valueChanges
        .pipe(debounceTime(150), distinctUntilChanged())
        .subscribe(() => {
          if (!this.isHydratingFromApi) {
            this.markModified();
          }
          this.cdr.detectChanges();
        });
    } catch (e) {
      // ignore
    }

    this.updateSharingOnPreview();
  }

  goBack() {
    this.location.back();
  }

  onEditorReady(editorInstance: any) {
    this.ckEditorInstance = editorInstance;
    if (this.pendingEditorValue !== null) {
      this.suppressModifiedFor(450);
      this.syncEditorWithValue(this.pendingEditorValue);
      this.pendingEditorValue = null;
    }
    this.updateEditorReadOnlyState();
  }

  private syncEditorWithValue(value: any) {
    if (!this.ckEditorInstance) {
      this.pendingEditorValue = value;
      return;
    }
    try {
      if (this.isHydratingFromApi) {
        this.suppressModifiedFor(450);
      }
      this.ckEditorInstance.setData(value || '');
    } catch (e) {
      console.warn('Failed to sync CKEditor value:', e);
      try {
        this.campaignForm.get('campaignDescription')?.setValue(value || '', { emitEvent: false });
      } catch (e2) {
        console.error('Fallback setValue also failed:', e2);
      }
    }
  }

  private setEditorReadOnly(readOnly: boolean) {
    const ed = this.ckEditorInstance;
    if (!ed) return;
    try {
      if (readOnly) {
        if (typeof ed.enableReadOnlyMode === 'function') {
          ed.enableReadOnlyMode(this.ckEditorReadOnlyKey);
          return;
        }
        if (typeof ed.isReadOnly !== 'undefined') {
          ed.isReadOnly = true;
          return;
        }
        if (ed.model && ed.model.document) {
          try { (ed.model.document as any).isReadOnly = true; } catch (e) { }
          return;
        }
        if (ed.editing && ed.editing.view && ed.editing.view.document) {
          try { (ed.editing.view.document as any).isReadOnly = true; } catch (e) { }
          return;
        }
      } else {
        if (typeof ed.disableReadOnlyMode === 'function') {
          ed.disableReadOnlyMode(this.ckEditorReadOnlyKey);
          return;
        }
        if (typeof ed.isReadOnly !== 'undefined') {
          ed.isReadOnly = false;
          return;
        }
        if (ed.model && ed.model.document) {
          try { (ed.model.document as any).isReadOnly = false; } catch (e) { }
          return;
        }
        if (ed.editing && ed.editing.view && ed.editing.view.document) {
          try { (ed.editing.view.document as any).isReadOnly = false; } catch (e) { }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to set CKEditor readonly state:', e);
    }
  }

  updateEditorReadOnlyState() {
    if (!this.ckEditorInstance) return;
    const shouldBeReadOnly = this.isLoading || !this.canEditDescription;
    this.setEditorReadOnly(shouldBeReadOnly);
  }

  private markModified(): void {
    try {
      if (this.isHydratingFromApi) return;
      if (this.suppressModifiedTracking) return;
      if (!this.isModified) {
        this.isModified = true;
      }
      try { this.cdr.markForCheck(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  private loadCampaign(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.campaignsApi.getCampaignById(id).subscribe({
      next: (res: any) => {
        this.isHydratingFromApi = true;
        const campaign = res?.campaign ?? res;

        const name = String(campaign?.campaign_name ?? campaign?.name ?? 'Campaign Details').trim();
        this.campaignName = name || 'Campaign Details';
        const statusRaw = String(campaign?.status ?? 'N/A');
        this.statusLabel = statusRaw;
        this.campaignStatus = statusRaw;
        this.editableFlag = campaign?.editable === true;

        const prompt = String(campaign?.prompt ?? '');
        const postType = String(campaign?.post_type ?? campaign?.postType ?? '').trim();

        const typeRaw = String(campaign?.campaign_type ?? campaign?.type ?? 'personalized').toLowerCase();
        const typeLabel = typeRaw === 'interval' ? 'Interval' : 'Personalised';

        const personalizedTypeRaw = String(campaign?.personalized_type ?? campaign?.personalizedType ?? '').trim().toLowerCase();
        const audienceLabel = typeLabel === 'Personalised' && personalizedTypeRaw === 'retail' ? 'Retail' : 'Product';

        const startDateRaw = campaign?.start_date ?? campaign?.scheduled_date ?? null;
        const endDateRaw = campaign?.end_date ?? null;
        const scheduledTimeRaw = campaign?.scheduled_time ?? null;

        const dtStart = startDateRaw ? new Date(startDateRaw) : null;
        const dateStr = dtStart && !isNaN(dtStart.getTime()) ? this.formatDateForInput(dtStart) : '';
        const endDateDt = endDateRaw ? new Date(endDateRaw) : null;
        const endDateStr = endDateDt && !isNaN(endDateDt.getTime()) ? this.formatDateForInput(endDateDt) : '';

        let timeStr = '';
        if (scheduledTimeRaw) {
          timeStr = this.formatTimeFrom24(scheduledTimeRaw);
        } else if (dtStart && !isNaN(dtStart.getTime())) {
          timeStr = this.formatTime12(dtStart);
        }

        const intervalTypeRaw = String(campaign?.interval_type ?? '').trim();
        const intervalType = this.normalizeIntervalType(intervalTypeRaw);
        const intervalValue = campaign?.interval_value ?? '';

        const campaignDescRaw = campaign?.campaign_description ?? campaign?.campaignDescription ?? '';

        this.campaignForm.patchValue(
          {
            prompt,
            name: this.campaignName,
            postType,
            type: typeLabel,
            audience: audienceLabel,
            status: statusRaw.trim().toLowerCase() || '',
            startDate: dateStr,
            endDate: endDateStr,
            publicationTime: timeStr,
            modify: !!campaign?.modify,
            intervalType: intervalType || '',
            intervalValue: intervalValue === 0 ? 0 : intervalValue || '',
            campaignDescription: campaignDescRaw,
          },
          { emitEvent: false }
        );

        this.hydrateProductsFromResponse(campaign);
        this.hydrateSocialPlatformsFromResponse(campaign);

        const contentObj = campaign?.content ?? campaign?.latest_content ?? campaign?.latestContent ?? null;
        try {
          this.generatedCampaignImages = [];
          this.generatedCampaignImageUrl = null;
          this.generatedCampaignSelectedIndex = 0;
          this.purchasePdfUrl = null;
          this.contentPdfUrl = null;
          this.latestContentId = null;
          this.existingMediaKeyToId = new Map();

          if (contentObj && (contentObj?.content || Array.isArray(contentObj?.media))) {
            const contentIdParsed = Number(contentObj?.id ?? contentObj?.content_id ?? contentObj?.contentId);
            this.latestContentId = isFinite(contentIdParsed) ? contentIdParsed : null;

            const contentText = String(contentObj?.content ?? '').trim();
            if (contentText) {
              this.applyGeneratedContentToDescription(contentText);
            }

            const mediaArr = Array.isArray(contentObj?.media) ? contentObj.media : [];
            for (const m of mediaArr) {
              const mType = String(m?.media_type ?? m?.mediaType ?? '').trim().toLowerCase();
              const mediaKey = String(m?.media_key ?? m?.mediaKey ?? m?.key ?? '').trim();
              if (!mediaKey) continue;

              const mediaIdVal = Number(m?.id);
              const mediaId = isFinite(mediaIdVal) ? mediaIdVal : null;
              const normalizedKey = this.normalizeMediaKey(mediaKey);
              if (normalizedKey && mediaId) {
                this.existingMediaKeyToId.set(normalizedKey, mediaId);
              }

              if (mType === 'pdf') {
                const pdfUrl = mediaKey.startsWith('http') || mediaKey.startsWith('data:')
                  ? mediaKey
                  : `${environment.imgUrl}${mediaKey}`;
                this.contentPdfUrl = pdfUrl;
                this.purchasePdfUrl = pdfUrl;
              } else if (mType === 'image' || mType === 'img') {
                const imgUrl = mediaKey.startsWith('http') || mediaKey.startsWith('data:')
                  ? mediaKey
                  : `${environment.imgUrl}${mediaKey}`;
                this.generatedCampaignImages.push({
                  url: imgUrl,
                  mediaId,
                  mediaKey,
                  mediaType: mType,
                  isNew: false,
                });
              }
            }

            if (this.generatedCampaignImages.length) {
              this.generatedCampaignSelectedIndex = 0;
              this.generatedCampaignImageUrl = this.generatedCampaignImages[0]?.url || null;
            }
          } else {
            if (campaignDescRaw) {
              this.applyGeneratedContentToDescription(campaignDescRaw);
            }
          }
        } catch (e) {
          // ignore mapping errors and keep defaults
        }

        try {
          const apiCustomers = Array.isArray(campaign?.customers) ? campaign.customers : [];
          this.campaignSelectedCustomers = apiCustomers;
          this.purchaseRows = apiCustomers.map((c: any) => {
            return {
              customerId: c?.customer_id ?? c?.customerId ?? c?.id,
              customerName: c?.customer_name ?? c?.customerName ?? c?.name,
              customerEmail: c?.customer_email ?? c?.customerEmail ?? c?.email,
              customerContact: { number: c?.customer_phone ?? c?.customerPhone ?? c?.phone ?? '' },
              whatsapp: !!c?.whatsapp,
              email: !!c?.email,
            };
          }).filter((r: any) => this.hasAnyContact(r));

          this.resetPurchaseSelection();
          this.applySelectionsFromCampaignCustomers();
        } catch (e) {
          // ignore
        }

        this.applyIntervalEnabledState(typeLabel);

        this.initialSnapshot = this.computeSnapshot();
        this.isModified = false;

        this.isLoading = false;
        this.isHydratingFromApi = false;

        this.updateEditorReadOnlyState();

        try { this.fetchPurchaseHistoryIfNeeded(); } catch (e) { }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.isHydratingFromApi = false;
        this.updateEditorReadOnlyState();
        this.cdr.detectChanges();
        try{this.toastr.error('Failed to load campaign details.');} catch(e){}
      },
    });
  }

  private applyIntervalEnabledState(typeValue: any) {
    const type = String(typeValue ?? '').toLowerCase();
    const isInterval = type === 'interval';

    const intervalTypeCtl = this.campaignForm.get('intervalType');
    const intervalValueCtl = this.campaignForm.get('intervalValue');
    const modifyCtl = this.campaignForm.get('modify');

    try { intervalTypeCtl?.enable({ emitEvent: false }); } catch (e) { }

    if (!intervalTypeCtl || !intervalValueCtl) return;

    if (isInterval) {
      try { intervalValueCtl.setValue(1, { emitEvent: false }); } catch (e) { }
      try { intervalValueCtl.disable({ emitEvent: false }); } catch (e) { }
      try { modifyCtl?.setValue(false, { emitEvent: false }); } catch (e) { }
      try { modifyCtl?.disable({ emitEvent: false }); } catch (e) { }
    } else {
      try { intervalValueCtl.setValue(1, { emitEvent: false }); } catch (e) { }
      try { intervalValueCtl.disable({ emitEvent: false }); } catch (e) { }
      try { modifyCtl?.setValue(false, { emitEvent: false }); } catch (e) { }
      try { modifyCtl?.disable({ emitEvent: false }); } catch (e) { }
    }

    try {
      const productCtl = this.campaignForm.get('product');
      if (productCtl) {
        const val = productCtl.value;
        if (isInterval) {
          if (val == null || val === '') {
            productCtl.setValue([], { emitEvent: false });
          } else if (!Array.isArray(val)) {
            productCtl.setValue([val], { emitEvent: false });
          }
        } else {
          if (Array.isArray(val)) {
            productCtl.setValue(val.length ? val[0] : '', { emitEvent: false });
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private computeSnapshot(): string {
    try {
      const raw = typeof this.campaignForm.getRawValue === 'function'
        ? this.campaignForm.getRawValue()
        : this.campaignForm.value;
      const typeLabel = String(raw?.type ?? 'Personalised');
      const isInterval = typeLabel.trim().toLowerCase() === 'interval';

      const snapshotObj: any = {
        campaign_name: String(raw?.name ?? ''),
        prompt: String(raw?.prompt ?? ''),
        postType: String(raw?.postType ?? ''),
        type: typeLabel,
        audience: String(raw?.audience ?? ''),
        status: String(raw?.status ?? ''),
        startDate: String(raw?.startDate ?? ''),
        endDate: String(raw?.endDate ?? ''),
        publicationTime: String(raw?.publicationTime ?? ''),
        interval_type: isInterval ? String(raw?.intervalType ?? '') : '',
        interval_value: isInterval ? String(raw?.intervalValue ?? '') : '',
        modify: isInterval ? !!raw?.modify : false,
        campaignDescription: String(raw?.campaignDescription ?? ''),
        product: this.normalizeSnapshotProduct(isInterval, raw?.product),
      };

      return JSON.stringify(snapshotObj);
    } catch (e) {
      return '';
    }
  }

  private normalizeSnapshotProduct(isInterval: boolean, value: any): string {
    if (isInterval) {
      const arr = Array.isArray(value) ? value : value != null && value !== '' ? [value] : [];
      const normalized = arr
        .map((v) => (v == null ? '' : String(v)))
        .filter((v) => v.length)
        .sort();
      return JSON.stringify(normalized);
    }
    if (Array.isArray(value)) {
      return value.length ? String(value[0] ?? '') : '';
    }
    return value == null ? '' : String(value);
  }

  private toJsDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return null;
      const m = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
      if (m) {
        const y = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10) - 1;
        const d = parseInt(m[3], 10);
        if (isFinite(y) && isFinite(mo) && isFinite(d)) {
          const dt = new Date(y, mo, d);
          dt.setHours(0, 0, 0, 0);
          return dt;
        }
      }
      const parsed = new Date(s);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private parseTimeToHoursMinutes(time: any): { hours: number; minutes: number } | null {
    if (time == null) return null;
    const raw = String(time).trim();
    if (!raw) return null;
    const m = raw.match(/^([0-9]{1,2})\s*:\s*([0-9]{2})(?:\s*([aApP][mM]))?$/);
    if (!m) return null;
    let hours = parseInt(m[1], 10);
    const minutes = parseInt(m[2], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    if (minutes < 0 || minutes > 59) return null;
    if (hours < 0 || hours > 23) {
      if (hours < 1 || hours > 12) return null;
    }
    const ampm = m[3] ? m[3].toUpperCase() : null;
    if (ampm) {
      if (hours === 12) hours = 0;
      if (ampm === 'PM') hours += 12;
    }
    if (hours < 0 || hours > 23) return null;
    return { hours, minutes };
  }

  private isBlobStorageUrl(url: string): boolean {
    return String(url || '')
      .toLowerCase()
      .includes('dadyinstorage.blob.core.windows.net');
  }

  private extractBlobKeyFromUrl(url: string): string | null {
    const s = String(url || '').trim();
    if (!s) return null;
    const m = s.match(/dadyinstorage\.blob\.core\.windows\.net\/[^/]+\/(.+)/i);
    return m ? String(m[1] || '').trim() || null : null;
  }

  private normalizeMediaKey(value: string): string | null {
    const s = String(value || '').trim();
    if (!s) return null;
    if (/^data:/i.test(s)) return null;
    if (/^https?:\/\//i.test(s)) {
      return this.extractBlobKeyFromUrl(s) || s;
    }
    return s;
  }

  private applyGeneratedContentToDescription(content: string | null | undefined) {
    const text = String(content ?? '').trim();
    const html = formatGeneratedContentToHtml(text);
    this.syncEditorWithValue(html);
    try {
      this.campaignForm.get('campaignDescription')?.setValue(html, { emitEvent: false });
    } catch (e) {
      // ignore
    }
  }

  private lookupExistingMediaId(mediaKey: string | null | undefined): number | null {
    const normalized = this.normalizeMediaKey(mediaKey || '');
    if (!normalized) return null;
    const val = this.existingMediaKeyToId.get(normalized);
    const n = Number(val);
    return isFinite(n) && n > 0 ? n : null;
  }

  private async uploadDataUrlAndGetMediaKey(dataUrl: string): Promise<string | null> {
    const file = this.dataUrlToFile(String(dataUrl || '').trim(), 'campaign-image');
    if (!file) return null;
    const res: any = await this.apiService.uploadFiles([file]);
    const uploaded = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.Data) ? res.Data : []);
    const first = Array.isArray(uploaded) && uploaded.length ? uploaded[0] : null;
    const raw = String(first?.media_url ?? first?.mediaUrl ?? first?.key ?? first?.url ?? '').trim();
    if (!raw) return null;
    return this.extractBlobKeyFromUrl(raw) || raw;
  }

  async onGenerate(): Promise<void> {
    if (this.isLoading) return;
    if (!this.canGenerateContent) return;

    const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();
    const postType = String(this.campaignForm.get('postType')?.value ?? '').trim() || 'Product Post';
    const typeLabel = String(this.campaignForm.get('type')?.value ?? 'Personalised');
    const isInterval = typeLabel.trim().toLowerCase() === 'interval';
    const audienceLabel = String(this.campaignForm.get('audience')?.value ?? 'Product');
    const audience = audienceLabel.trim().toLowerCase();

    const productId = this.extractSelectedProductId();
    const productIds = Array.isArray(this.campaignForm.get('product')?.value)
      ? (this.campaignForm.get('product')?.value as any[]).map((p: any) => p?.id ?? p?.product_id ?? p).filter((v) => v != null)
      : productId != null
        ? [productId]
        : [];

    if (!isInterval && audience === 'product' && (!productIds || productIds.length === 0)) {
      try { this.toastr.error('Select a product to generate content.'); } catch (e) {}
      return;
    }

    if (!isInterval && audience === 'retail') {
      const serviceDesc = this.extractServiceDescriptionForRetail();
      if (!serviceDesc) {
        try { this.toastr.error('Select or enter a service description for retail.'); } catch (e) {}
        return;
      }
    }

    const contentIdVal = Number(this.latestContentId);
    const contentIdForPayload = isFinite(contentIdVal) && contentIdVal > 0 ? contentIdVal : 0;

    const formData = new FormData();
    formData.append('campaign_content_id', String(contentIdForPayload));
    formData.append('prompt', prompt);
    try {
      const refs = Array.isArray(this.selectedAttachments) ? this.selectedAttachments : [];
      refs.forEach((att, idx) => {
        if (att?.file) {
          formData.append('files', att.file, att.file.name || `ref-${idx}.png`);
        }
      });
    } catch (e) {
      // ignore reference image errors
    }
    
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      this.campaignsApi.regenerateImages(formData).subscribe({
        next: (resp: any) => {
          try { this.toastr.success('Images regenerated successfully'); } catch (e) {}

          try {
            const returnedCid = Number(resp?.campaign_content_id ?? resp?.data?.campaign_content_id ?? resp?.campaignContentId ?? null);
            if (isFinite(returnedCid) && returnedCid > 0) {
              this.latestContentId = returnedCid;
            }

            const products = Array.isArray(resp?.product)
              ? resp.product
              : Array.isArray(resp?.data?.product)
                ? resp.data.product
                : [];

            const mapped = (products || []).map((p: any) => {
              const key = String(p?.image_key ?? p?.imageKey ?? '').trim();
              const url = key ? this.buildProductImageUrl(key) : null;
              return {
                url: url,
                mediaId: null,
                mediaKey: key || null,
                mediaType: 'image',
                isNew: true,
              };
            }).filter((i: any) => i.url);

            if (mapped.length) {
              this.generatedCampaignImages = mapped;
              this.generatedCampaignSelectedIndex = 0;
              this.generatedCampaignImageUrl = mapped[0].url || null;
            }
          } catch (e) {
            // ignore mapping errors
          }

          try {
            if (this.campaignId) {
              this.loadCampaign(this.campaignId);
            }
          } catch (e) {}

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Regenerate failed', err);
          this.isLoading = false;
          this.cdr.detectChanges();
          try { this.toastr.error('Failed to regenerate images'); } catch (e) {}
        }
      });
    } catch (e) {
      this.isLoading = false;
      this.cdr.detectChanges();
      try { this.toastr.error('Failed to regenerate images'); } catch (e2) {}
    }
  }

  save(): void {
    if (this.isLoading) return;
    if (this.isCompleted) return;
    if (!this.campaignId) return;
    if (!this.isModified) return;

    const missing: string[] = [];
    const campaignName = String(this.campaignForm.get('name')?.value ?? '').trim();
    const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();
    const campaignDesc = htmlToSocialText(this.campaignForm.get('campaignDescription')?.value ?? '');
    const postType = String(this.campaignForm.get('postType')?.value ?? '').trim();

    if (!campaignName) {
      missing.push('Please enter Campaign Name.')
    }

    const typeLabel = String(this.campaignForm.get('type')?.value ?? 'Personalised');
    const isInterval = typeLabel.trim().toLowerCase() === 'interval';

    const intervalType = String(this.campaignForm.get('intervalType')?.value ?? '').trim().toLowerCase();

    const startDateVal = this.campaignForm.get('startDate')?.value;
    const endDateVal = this.campaignForm.get('endDate')?.value;

    if (startDateVal && endDateVal && isInterval) {
      const v = validateEndDate(startDateVal, endDateVal, intervalType);
      if (!v.valid) {
        missing.push(v.error || 'Invalid date range for selected interval.');
      }
    }

    if (missing.length) {
      this.showValidationDialog(missing);
      return;
    }

    const campaignType = isInterval ? 'interval' : 'personalized';
    const pubTimeVal = this.campaignForm.get('publicationTime')?.value;
    const parsedPubTime = this.parseTimeToHoursMinutes(pubTimeVal);

    let scheduledTimeUtc: string | null = null;
    if (parsedPubTime && startDateVal) {
      const dt = this.toJsDate(startDateVal);
      if (dt) {
        dt.setHours(parsedPubTime.hours, parsedPubTime.minutes, 0, 0);
        scheduledTimeUtc = `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;
      }
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    (async () => {
      try {
        const customers = this.buildSelectedCustomersForUpdate();
        const currentImageUrl = String(this.generatedCampaignImageUrl ?? '').trim();
        const mediaItems = Array.isArray(this.generatedCampaignImages) && this.generatedCampaignImages.length
          ? [...this.generatedCampaignImages]
          : currentImageUrl
            ? [{ url: currentImageUrl }]
            : [];

        const mediaPayload: any[] = [];

        for (let i = 0; i < mediaItems.length; i++) {
          const item = { ...(mediaItems[i] || {}) } as any;
          const rawUrl = String(item.url || '').trim();
          const rawKeySource = String(item.mediaKey || rawUrl || '').trim();

          let mediaKeyVal = this.normalizeMediaKey(rawKeySource);
          const isDataUrl = /^data:/i.test(rawUrl || rawKeySource);

          if (isDataUrl) {
            const uploadedKey = await this.uploadDataUrlAndGetMediaKey(rawUrl || rawKeySource);
            if (uploadedKey) {
              mediaKeyVal = uploadedKey;
              const displayUrl = this.isBlobStorageUrl(uploadedKey)
                ? uploadedKey
                : `${environment.imgUrl}${uploadedKey}`;
              item.url = displayUrl;
              item.mediaKey = uploadedKey;
              item.isNew = true;
            }
          }

          if (!mediaKeyVal) continue;

          const mediaEntry: any = { media_key: mediaKeyVal, prompt: prompt };
          const mediaId = this.lookupExistingMediaId(mediaKeyVal) ?? (isFinite(Number(item.mediaId)) ? Number(item.mediaId) : null);
          mediaEntry.media_id = item.isNew === true ? null : (mediaId && mediaId > 0 ? mediaId : null);

          mediaPayload.push(mediaEntry);

          mediaItems[i] = {
            ...item,
            mediaId: mediaId && mediaId > 0 ? mediaId : null,
            mediaKey: mediaKeyVal,
          };
        }

        this.generatedCampaignImages = mediaItems;
        if (this.generatedCampaignImages.length) {
          const idx = Math.max(0, Math.min(this.generatedCampaignSelectedIndex || 0, this.generatedCampaignImages.length - 1));
          this.generatedCampaignImageUrl = this.generatedCampaignImages[idx]?.url || this.generatedCampaignImages[0]?.url || this.generatedCampaignImageUrl;
        }

        const contentIdVal = Number(this.latestContentId);
        const contentIdForPayload = isFinite(contentIdVal) && contentIdVal > 0 ? contentIdVal : 0;

        const contents: any[] = [
          {
            content_id: contentIdForPayload,
            content: campaignDesc,
            media: mediaPayload,
            customers: customers,
          },
        ];

        const payload: any = {
          campaign_name: campaignName,
          post_type: postType || 'Festival Post',
          start_date: this.formatDateForApi(startDateVal),
          end_date: this.formatDateForApi(endDateVal),
          campaign_type: campaignType,
          interval_type: intervalType || 'daily',
          scheduled_time: scheduledTimeUtc || '00:00',
          contents: contents,
        };

        this.campaignsApi.updateCampaign(this.campaignId!, payload).subscribe({
          next: (updated: any) => {
            try {
              const campaign = updated?.campaign ?? updated;
              const name = String(campaign?.campaign_name ?? campaignName).trim();
              this.campaignName = name || this.campaignName;
              const st = String(campaign?.status ?? this.statusLabel);
              this.statusLabel = st;
            } catch (e) {
              // ignore
            }

            this.initialSnapshot = this.computeSnapshot();
            this.isModified = false;
            this.isLoading = false;
            this.updateEditorReadOnlyState();
            this.cdr.detectChanges();
            try {
              this.toastr.success('Campaign updated successfully');
            } catch (e) {}
          },
          error: (err) => {
            this.isLoading = false;
            this.updateEditorReadOnlyState();
            this.cdr.detectChanges();
            try {
              this.toastr.error('Failed to update campaign');
            } catch (e) {}
          },
        });
      } catch (e) {
        console.error('Save error', e);
        this.isLoading = false;
        this.cdr.detectChanges();
        try {
          this.toastr.error('Failed to save campaign');
        } catch (e2) {}
      }
    })();
  }

  private buildSelectedCustomersForUpdate(): any[] {
    const customers: any[] = [];
    const rows = this.purchaseRows || [];
    const whatsappSel = this.purchaseWhatsappSelection || [];
    const emailSel = this.purchaseEmailSelection || [];

    for (let i = 0; i < rows.length; i++) {
      const c = rows[i];
      const useWhatsapp = whatsappSel[i] === true;
      const useEmail = emailSel[i] === true;
      if (!useWhatsapp && !useEmail) continue;

      const ph = this.getCustomerWhatsappValue(c);
      const em = this.getCustomerEmailValue(c);

      customers.push({
        customer_id: c?.customerId ?? c?.id ?? 0,
        customer_name: String(c?.customerName ?? c?.name ?? '').trim(),
        customer_phone: ph || '',
        customer_email: em || '',
        whatsapp: useWhatsapp,
        email: useEmail
      });
    }
    return customers;
  }

  private formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatTimeFrom24(time24: any): string {
    if (!time24) return '';
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

  private formatTime12(d: Date): string {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${minutes} ${ampm}`;
  }

  private resetPurchaseSelection() {
    try {
      const len = Array.isArray(this.purchaseRows) ? this.purchaseRows.length : 0;
      this.purchaseNameSelection = new Array(len).fill(false);
      this.purchaseWhatsappSelection = new Array(len).fill(false);
      this.purchaseEmailSelection = new Array(len).fill(false);
    } catch (e) {
      this.purchaseNameSelection = [];
      this.purchaseWhatsappSelection = [];
      this.purchaseEmailSelection = [];
    }
  }

  private normalizeContactValue(value: any): string | null {
    const str = String(value ?? '').trim();
    if (!str) return null;
    const lower = str.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'na') return null;
    return str;
  }

  private getCustomerWhatsappValue(customer: any): string | null {
    return (
      this.normalizeContactValue(customer?.customerContact?.number) ||
      this.normalizeContactValue(customer?.customer_phone) ||
      this.normalizeContactValue(customer?.phone) ||
      this.normalizeContactValue(customer?.mobile) ||
      this.normalizeContactValue(customer?.mobileNo) ||
      this.normalizeContactValue(customer?.whatsapp)
    );
  }

  private getCustomerEmailValue(customer: any): string | null {
    return (
      this.normalizeContactValue(customer?.customerEmail) ||
      this.normalizeContactValue(customer?.customer_email) ||
      this.normalizeContactValue(customer?.email) ||
      this.normalizeContactValue(customer?.emailId)
    );
  }

  private hasWhatsappContact(customer: any): boolean {
    return !!this.getCustomerWhatsappValue(customer);
  }

  private hasEmailContact(customer: any): boolean {
    return !!this.getCustomerEmailValue(customer);
  }

  private hasAnyContact(customer: any): boolean {
    return this.hasWhatsappContact(customer) || this.hasEmailContact(customer);
  }

  public customerHasWhatsapp(customer: any): boolean {
    return this.hasWhatsappContact(customer);
  }

  public customerHasEmail(customer: any): boolean {
    return this.hasEmailContact(customer);
  }

  public customerWhatsappDisplay(customer: any): string {
    return this.getCustomerWhatsappValue(customer) ?? 'N/A';
  }

  public customerEmailDisplay(customer: any): string {
    return this.getCustomerEmailValue(customer) ?? 'N/A';
  }

  private normalizeEmail(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private normalizeName(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private buildSelectedCustomerLookup(selectedCustomers: any[]): {
    byEmail: Map<string, any>;
    byName: Map<string, any>;
    byId: Map<string, any>;
  } {
    const byEmail = new Map<string, any>();
    const byName = new Map<string, any>();
    const byId = new Map<string, any>();

    const list = Array.isArray(selectedCustomers) ? selectedCustomers : [];
    for (const c of list) {
      const email = this.normalizeEmail(c?.customer_email ?? c?.customerEmail ?? c?.email);
      const name = this.normalizeName(c?.customer_name ?? c?.customerName ?? c?.name);
      const id = String(c?.customer_id ?? c?.customerId ?? c?.id ?? '').trim();
      if (email) byEmail.set(email, c);
      if (name) byName.set(name, c);
      if (id) byId.set(id, c);
    }

    return { byEmail, byName, byId };
  }

  private applySelectionsFromCampaignCustomers(): void {
    try {
      const rows = Array.isArray(this.purchaseRows) ? this.purchaseRows : [];
      const selected = Array.isArray(this.campaignSelectedCustomers) ? this.campaignSelectedCustomers : [];
      const lookup = this.buildSelectedCustomerLookup(selected);

      const nameSel: boolean[] = new Array(rows.length).fill(false);
      const whatsappSel: boolean[] = new Array(rows.length).fill(false);
      const emailSel: boolean[] = new Array(rows.length).fill(false);

      for (let i = 0; i < rows.length; i++) {
        const r: any = rows[i];
        const rowEmail = this.normalizeEmail(r?.customerEmail ?? r?.customer_email ?? r?.email);
        const rowName = this.normalizeName(r?.customerName ?? r?.customer_name ?? r?.name);
        const rowId = String(r?.customerId ?? r?.customer_id ?? r?.id ?? r?.customer_id ?? '').trim();

        const match =
          (rowEmail && lookup.byEmail.get(rowEmail)) ||
          (rowId && lookup.byId.get(rowId)) ||
          (rowName && lookup.byName.get(rowName)) ||
          null;

        if (!match) continue;

        const wantsWhatsapp = !!match?.whatsapp;
        const wantsEmail = !!match?.email;

        whatsappSel[i] = wantsWhatsapp && this.hasWhatsappContact(r);
        emailSel[i] = wantsEmail && this.hasEmailContact(r);
        nameSel[i] = whatsappSel[i] || emailSel[i];
      }

      this.purchaseNameSelection = nameSel;
      this.purchaseWhatsappSelection = whatsappSel;
      this.purchaseEmailSelection = emailSel;
    } catch (e) {
      // ignore
    }
  }

  private ensurePurchaseSelectionLength() {
    try {
      const len = Array.isArray(this.purchaseRows) ? this.purchaseRows.length : 0;
      const ensure = (arr: boolean[]) => {
        const next = Array.isArray(arr) ? arr.slice(0, len) : [];
        while (next.length < len) next.push(false);
        return next;
      };
      this.purchaseNameSelection = ensure(this.purchaseNameSelection);
      this.purchaseWhatsappSelection = ensure(this.purchaseWhatsappSelection);
      this.purchaseEmailSelection = ensure(this.purchaseEmailSelection);
    } catch (e) {
      // ignore
    }
  }

  get purchaseHasRows(): boolean {
    return Array.isArray(this.purchaseRows) && this.purchaseRows.length > 0;
  }

  get purchaseHasAnyWhatsapp(): boolean {
    const rows = Array.isArray(this.purchaseRows) ? this.purchaseRows : [];
    return rows.some((r) => this.hasWhatsappContact(r));
  }

  get purchaseHasAnyEmail(): boolean {
    const rows = Array.isArray(this.purchaseRows) ? this.purchaseRows : [];
    return rows.some((r) => this.hasEmailContact(r));
  }

  get purchaseMasterAllSelected(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    for (let i = 0; i < rows.length; i++) {
      if (!this.purchaseNameSelection[i]) return false;
      if (this.hasWhatsappContact(rows[i]) && !this.purchaseWhatsappSelection[i]) return false;
      if (this.hasEmailContact(rows[i]) && !this.purchaseEmailSelection[i]) return false;
    }
    return true;
  }

  get purchaseMasterSomeSelected(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    for (let i = 0; i < rows.length; i++) {
      if (this.purchaseNameSelection[i]) return true;
      if (this.hasWhatsappContact(rows[i]) && this.purchaseWhatsappSelection[i]) return true;
      if (this.hasEmailContact(rows[i]) && this.purchaseEmailSelection[i]) return true;
    }
    return false;
  }

  get purchaseMasterIndeterminate(): boolean {
    return this.purchaseMasterSomeSelected && !this.purchaseMasterAllSelected;
  }

  get purchaseWhatsappAllSelected(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    let anyEligible = false;
    for (let i = 0; i < rows.length; i++) {
      if (!this.hasWhatsappContact(rows[i])) continue;
      anyEligible = true;
      if (!this.purchaseWhatsappSelection[i]) return false;
    }
    return anyEligible;
  }

  get purchaseWhatsappIndeterminate(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    let anyEligible = false;
    let anyChecked = false;
    let anyUnchecked = false;
    for (let i = 0; i < rows.length; i++) {
      if (!this.hasWhatsappContact(rows[i])) continue;
      anyEligible = true;
      if (this.purchaseWhatsappSelection[i]) anyChecked = true;
      else anyUnchecked = true;
    }
    return anyEligible && anyChecked && anyUnchecked;
  }

  get purchaseEmailAllSelected(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    let anyEligible = false;
    for (let i = 0; i < rows.length; i++) {
      if (!this.hasEmailContact(rows[i])) continue;
      anyEligible = true;
      if (!this.purchaseEmailSelection[i]) return false;
    }
    return anyEligible;
  }

  get purchaseEmailIndeterminate(): boolean {
    if (!this.purchaseHasRows) return false;
    this.ensurePurchaseSelectionLength();
    const rows = this.purchaseRows;
    let anyEligible = false;
    let anyChecked = false;
    let anyUnchecked = false;
    for (let i = 0; i < rows.length; i++) {
      if (!this.hasEmailContact(rows[i])) continue;
      anyEligible = true;
      if (this.purchaseEmailSelection[i]) anyChecked = true;
      else anyUnchecked = true;
    }
    return anyEligible && anyChecked && anyUnchecked;
  }

  togglePurchaseMasterAll(checked: boolean) {
    try {
      const len = Array.isArray(this.purchaseRows) ? this.purchaseRows.length : 0;
      this.purchaseNameSelection = new Array(len).fill(!!checked);
      this.purchaseWhatsappSelection = new Array(len).fill(false);
      this.purchaseEmailSelection = new Array(len).fill(false);
      for (let i = 0; i < len; i++) {
        const row = this.purchaseRows[i];
        if (checked) {
          if (this.hasWhatsappContact(row)) this.purchaseWhatsappSelection[i] = true;
          if (this.hasEmailContact(row)) this.purchaseEmailSelection[i] = true;
          this.purchaseNameSelection[i] = this.purchaseWhatsappSelection[i] || this.purchaseEmailSelection[i];
        }
      }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  togglePurchaseWhatsappAll(checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      const len = this.purchaseRows.length;
      for (let i = 0; i < len; i++) {
        if (!this.hasWhatsappContact(this.purchaseRows[i])) {
          this.purchaseWhatsappSelection[i] = false;
          continue;
        }
        this.purchaseWhatsappSelection[i] = !!checked;
        if (checked) {
          this.purchaseNameSelection[i] = true;
        } else {
          if (!this.purchaseEmailSelection[i]) this.purchaseNameSelection[i] = false;
        }
      }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  togglePurchaseEmailAll(checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      const len = this.purchaseRows.length;
      for (let i = 0; i < len; i++) {
        if (!this.hasEmailContact(this.purchaseRows[i])) {
          this.purchaseEmailSelection[i] = false;
          continue;
        }
        this.purchaseEmailSelection[i] = !!checked;
        if (checked) {
          this.purchaseNameSelection[i] = true;
        } else {
          if (!this.purchaseWhatsappSelection[i]) this.purchaseNameSelection[i] = false;
        }
      }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  togglePurchaseNameRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      this.purchaseNameSelection[index] = !!checked;
      this.purchaseWhatsappSelection[index] = !!checked && this.hasWhatsappContact(this.purchaseRows[index]);
      this.purchaseEmailSelection[index] = !!checked && this.hasEmailContact(this.purchaseRows[index]);
      this.purchaseNameSelection[index] = this.purchaseWhatsappSelection[index] || this.purchaseEmailSelection[index];
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  togglePurchaseWhatsappRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      if (!this.hasWhatsappContact(this.purchaseRows[index])) {
        this.purchaseWhatsappSelection[index] = false;
        return;
      }
      this.purchaseWhatsappSelection[index] = !!checked;
      if (checked) {
        this.purchaseNameSelection[index] = true;
      } else {
        if (!this.purchaseEmailSelection[index]) this.purchaseNameSelection[index] = false;
      }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  togglePurchaseEmailRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      if (!this.hasEmailContact(this.purchaseRows[index])) {
        this.purchaseEmailSelection[index] = false;
        return;
      }
      this.purchaseEmailSelection[index] = !!checked;
      if (checked) {
        this.purchaseNameSelection[index] = true;
      } else {
        if (!this.purchaseWhatsappSelection[index]) this.purchaseNameSelection[index] = false;
      }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  private showInfoDialog(content: string, heading: string = 'Alert') {
    try {
      this.commonService.showAlertDialog({
        heading,
        content,
        showCancel: false,
        actionBtnName: 'Ok',
      });
    } catch (e) {
      // ignore
    }
  }

  private showValidationDialog(messages: string[] | string, heading: string = 'Alert') {
    try {
      const content = Array.isArray(messages) ? messages.join('<br/>') : String(messages || '');
      if (!content) return;
      this.showInfoDialog(content, heading);
    } catch (e) {
      // ignore
    }
  }

  private formatDateForApi(value: any): string | null {
    const dt = this.toJsDate(value);
    if (!dt) return null;
    const y = dt.getFullYear();
    const mo = dt.getMonth() + 1;
    const d = dt.getDate();
    const moStr = String(mo).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    return `${y}-${moStr}-${dayStr}`;
  }

  private dataUrlToFile(dataUrl: string, filename: string): File | null {
    try {
      const m = /^data:([^;]+);base64,(.*)$/.exec(String(dataUrl || ''));
      if (!m) return null;
      const mime = m[1] || 'image/png';
      const b64 = m[2] || '';
      const binary = atob(b64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      const ext = (mime.split('/')[1] || 'png').toLowerCase();
      const finalName = filename.includes('.') ? filename : `${filename}.${ext}`;
      return new File([bytes], finalName, { type: mime });
    } catch (e) {
      return null;
    }
  }

  openFilePicker() {
    try {
      if (this.isLoading) return;
      if (this.isCompleted) return;
      this.refFileInputRef?.nativeElement?.click();
    } catch (e) {
      // ignore
    }
  }

  onReferenceFilesSelected(event: any) {
    try {
      if (this.isLoading) return;
      if (this.isCompleted) return;
      const input = event?.target as HTMLInputElement;
      const files = input?.files;
      if (!files || files.length === 0) return;
      this.addSelectedFiles(files);
      try {
        input.value = '';
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }

  private addSelectedFiles(files: FileList) {
    try {
      const current = Array.isArray(this.selectedAttachments) ? this.selectedAttachments : [];
      const remaining = Math.max(0, this.maxAttachments - current.length);
      if (remaining <= 0) return;

      const toTake = Math.min(files.length, remaining);

      for (let i = 0; i < toTake; i++) {
        const f = files.item(i);
        if (!f) continue;
        if (this.allowedImageTypes.length && !this.allowedImageTypes.includes(f.type)) {
          continue;
        }

        const reader = new FileReader();
        reader.onload = (ev: any) => {
          try {
            const dataUrl = String(ev?.target?.result ?? '');
            this.selectedAttachments = [...this.selectedAttachments, { file: f, url: dataUrl, name: f.name }];
            try { this.cdr.detectChanges(); } catch (e) { }
            try { this.markModified(); } catch (e) { }
          } catch (e) {
            // ignore
          }
        };
        reader.readAsDataURL(f);
      }
    } catch (e) {
      // ignore
    }
  }

  removeAttachment(index: number) {
    try {
      if (this.isLoading) return;
      if (this.isCompleted) return;
      if (!Array.isArray(this.selectedAttachments)) return;
      this.selectedAttachments = this.selectedAttachments.filter((_, i) => i !== index);
      try { this.cdr.detectChanges(); } catch (e) { }
      try { this.markModified(); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  private getSocialPlatformIcon(platformName: string): string {
    const raw = String(platformName ?? '').trim().toLowerCase();
    if (!raw) return 'assets/nicons/share.png';

    if (raw.includes('facebook')) return 'assets/nicons/facebook.png';
    if (raw.includes('instagram')) return 'assets/nicons/instagram.png';
    if (raw.includes('linkedin')) return 'assets/nicons/linkedin.png';
    if (raw.includes('youtube')) return 'assets/nicons/youtube.png';
    if (raw.includes('whatsapp')) return 'assets/nicons/whatsapp%201.png';

    return 'assets/nicons/share.png';
  }

  private updateSharingOnPreview() {
    try {
      const type = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase();
      if (type !== 'interval') {
        try { this.campaignForm.get('sharingOn')?.setValue('', { emitEvent: false }); } catch (e) { }
        return;
      }

      const next = Array.isArray(this.connectedPlatformNames) && this.connectedPlatformNames.length
        ? this.connectedPlatformNames.join(', ')
        : '';
      try { this.campaignForm.get('sharingOn')?.setValue(next, { emitEvent: false }); } catch (e) { }
    } catch (e) {
      // ignore
    }
  }

  private hydrateSocialPlatformsFromResponse(campaign: any): void {
    try {
      const platforms = Array.isArray(campaign?.publication_platforms)
        ? campaign.publication_platforms
        : Array.isArray(campaign?.publicationPlatforms)
        ? campaign.publicationPlatforms
        : [];

      const seen = new Set<string>();
      const names: string[] = [];
      const ids: number[] = [];

      for (const platform of platforms) {
        const label = String(platform?.platform_name ?? '').trim();
        if (!label) continue;
        const key = label.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          names.push(label);
        }
        const pid = Number(platform?.platform_id ?? platform?.id);
        if (isFinite(pid)) ids.push(pid);
      }

      this.connectedPlatformNames = names;
      this.connectedPlatformIdsCsv = Array.from(new Set(ids)).map((n) => String(n)).join(',');
      this.connectedSocialPlatforms = names.map((name) => ({
        name,
        icon: this.getSocialPlatformIcon(name),
      }));

      this.updateSharingOnPreview();

      try {
        const status = (campaign?.status || '').toString().toLowerCase();
        if (status === 'completed') {
          const rawType = (campaign?.campaign_type || '').toString().toLowerCase();
          if (rawType === 'personalized' || rawType === 'personalised') {
            this.campaignPlatformsForDisplay = ['WhatsApp', 'Email'];
          } else if (names.length) {
            this.campaignPlatformsForDisplay = names.map((n) => (n && n.length) ? (n.charAt(0).toUpperCase() + n.slice(1)) : 'N/A');
          } else if (Array.isArray(platforms) && platforms.length) {
            this.campaignPlatformsForDisplay = platforms.map((p: any) => {
              const raw = (p?.platform_name || p?.name || '').toString();
              return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'N/A';
            });
          } else {
            this.campaignPlatformsForDisplay = [];
          }

          this.campaignPublicationDate = campaign?.last_run_time || null;
        } else {
          this.campaignPlatformsForDisplay = [];
          this.campaignPublicationDate = null;
        }
      } catch (e) {
        this.campaignPlatformsForDisplay = [];
        this.campaignPublicationDate = null;
      }
    } catch (e) {
      this.connectedPlatformNames = [];
      this.connectedPlatformIdsCsv = '';
      this.connectedSocialPlatforms = [];
      this.updateSharingOnPreview();
    }
  }

  private hydrateProductsFromResponse(campaign: any): void {
    try {
      const ids = Array.isArray(campaign?.product_ids)
        ? campaign.product_ids
        : Array.isArray(campaign?.productIds)
        ? campaign.productIds
        : [];
      const names = Array.isArray(campaign?.product_names)
        ? campaign.product_names
        : Array.isArray(campaign?.productNames)
        ? campaign.productNames
        : [];

      const productsFromApi = Array.isArray(campaign?.product) ? campaign.product : [];
      
      const optionCount = Math.max(ids.length, names.length, productsFromApi.length);
      const options: any[] = [];

      if (optionCount > 0) {
        for (let i = 0; i < optionCount; i++) {
          const productObj = productsFromApi[i] || null;
          const id = productObj?.id ?? ids[i] ?? ids[0] ?? names[i] ?? names[0] ?? i + 1;
          const label = productObj?.name ?? names[i] ?? names[0] ?? `Product ${id}`;
          const imageKey = productObj?.image ?? null;
          
          options.push({
            id,
            value: id,
            description: label,
            name: label,
            product_id: id,
            product_name: label,
            image: imageKey,
          });
        }
      } else {
        const fallbackName = String(campaign?.product_name ?? campaign?.product ?? '').trim();
        if (fallbackName) {
          const fallbackId = ids[0] ?? campaign?.product_id ?? fallbackName;
          options.push({
            id: fallbackId,
            value: fallbackId,
            description: fallbackName,
            name: fallbackName,
            product_id: fallbackId,
            product_name: fallbackName,
          });
        }
      }

      this.productsForDropdown = options;
      this.pendingSelectedProductIds = ids.slice();
      this.pendingSelectedProductNames = names.map((n: any) => String(n ?? ''));

      const productCtl = this.campaignForm.get('product');
      const typeRaw = String(campaign?.campaign_type ?? campaign?.type ?? '').trim().toLowerCase();
      const isInterval = typeRaw === 'interval';

      if (!productCtl) return;

      if (isInterval) {
        const selected: any[] = [];
        const targetIds = ids.length ? ids : options.map((opt) => opt?.id);
        targetIds.forEach((pid, idx) => {
          if (pid == null) return;
          const option = options.find((opt) => String(opt?.id) === String(pid)) || options[idx] || null;
          if (option) selected.push(option);
        });
        productCtl.setValue(selected, { emitEvent: false });
      } else {
        const singleId = ids.length ? ids[0] : options[0]?.id ?? '';
        productCtl.setValue(singleId ?? '', { emitEvent: false });
      }
      
      this.rebuildProductImagesFromCampaignData();
    } catch (e) {
      this.productsForDropdown = [];
      this.pendingSelectedProductIds = null;
      this.pendingSelectedProductNames = null;
    }
  }

  private extractSelectedProductId(): number | null {
    const raw = this.campaignForm.get('product')?.value;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const first = arr.length ? arr[0] : null;
    let id = first?.id ?? first?.productId ?? first?.product_id ?? first;
    if ((typeof id === 'string' || typeof id === 'number') && String(id).trim() && isNaN(Number(id))) {
      const desc = String(id).trim();
      const found = (this.productsForDropdown || []).find((p: any) => String(p?.description ?? '').trim() === desc);
      if (found) id = found.id;
    }
    const n = Number(id);
    return isFinite(n) && n > 0 ? n : null;
  }

  get productControl() {
    return this.campaignForm.get('product');
  }

  get campaignPostPreviewUrl(): string | null {
    try {
      if (Array.isArray(this.generatedCampaignImages) && this.generatedCampaignImages.length > 0) {
        const idx = Math.max(0, Math.min(this.generatedCampaignSelectedIndex || 0, this.generatedCampaignImages.length - 1));
        return this.generatedCampaignImages[idx]?.url || null;
      }
      return this.generatedCampaignImageUrl || null;
    } catch (e) {
      return null;
    }
  }

  get hasMultipleGeneratedCampaignImages(): boolean {
    return Array.isArray(this.generatedCampaignImages) && this.generatedCampaignImages.length > 1;
  }

  prevCampaignPostImage() {
    try {
      if (!Array.isArray(this.generatedCampaignImages) || this.generatedCampaignImages.length <= 1) return;
      const len = this.generatedCampaignImages.length;
      const next = (Number(this.generatedCampaignSelectedIndex) || 0) - 1;
      this.generatedCampaignSelectedIndex = (next + len) % len;
      this.generatedCampaignImageUrl = this.generatedCampaignImages[this.generatedCampaignSelectedIndex]?.url || null;
      this.cdr.detectChanges();
    } catch (e) {
      // ignore
    }
  }

  nextCampaignPostImage() {
    try {
      if (!Array.isArray(this.generatedCampaignImages) || this.generatedCampaignImages.length <= 1) return;
      const len = this.generatedCampaignImages.length;
      const next = (Number(this.generatedCampaignSelectedIndex) || 0) + 1;
      this.generatedCampaignSelectedIndex = next % len;
      this.generatedCampaignImageUrl = this.generatedCampaignImages[this.generatedCampaignSelectedIndex]?.url || null;
      this.cdr.detectChanges();
    } catch (e) {
      // ignore
    }
  }

  openCampaignPdf(): void {
    try {
      const url = String(this.purchasePdfUrl ?? '').trim();
      if (!url) return;
      window.open(url, '_blank');
    } catch (e) {
      // ignore
    }
  }

  onProductEdit(event: Event) {
    if (this.isLoading) return;
    if (this.isCompleted) return;
    if (!this.canEditProduct) return;
    try {
      this.productControl?.setValue('');

      try {
        const type = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase();
        const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();
        if (type === 'personalised' && audience === 'retail') {
          this.loadRetailCategories();
        } else {
          this.loadProducts('');
        }
      } catch (e) {
        this.loadProducts('');
      }
      this.cdr.detectChanges();

      const btn = (event.currentTarget || event.target) as HTMLElement;
      const wrap = btn.closest('.product-select-wrapper') || btn.closest('.col-md-12') || btn.closest('.col-12');
      if (wrap) {
        const ngSelect = wrap.querySelector('ng-select');
        const container = ngSelect?.querySelector('.ng-select-container') as HTMLElement | null;
        if (container) {
          const searchInput = container.querySelector('input[type="text"], input') as HTMLInputElement | null;
          if (searchInput) {
            try {
              searchInput.value = '';
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (e) {
              // ignore
            }
          }

          setTimeout(() => {
            try {
              container.click();
              const focused = container.querySelector('input') as HTMLElement | null;
              if (focused) focused.focus();
            } catch (e) {
              // ignore
            }
          }, 50);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  onProductSearch(term: any) {
    if (!this.canEditProduct) return;
    this.loadProducts(term);
  }

  private loadRetailCategories() {
    if (!this.allowProductApiCalls) {
      return;
    }
    try {
      this.apiService.Get_Customer_Categories('').then(() => {
        this.productsForDropdown = Array.isArray(this.apiService.productCategoriesList)
          ? this.apiService.productCategoriesList
          : [];
        try { this.cdr.detectChanges(); } catch (e) { }
      }).catch(() => {
        this.productsForDropdown = [];
        try { this.cdr.detectChanges(); } catch (e) { }
      });
    } catch (e) {
      this.productsForDropdown = [];
    }
  }

  private fetchPurchaseHistoryIfNeeded() {
    try {
      if (String(this.campaignForm.get('type')?.value ?? '').toLowerCase() !== 'personalised') {
        this.purchaseRows = [];
        this.purchasePdfUrl = null;
        this.contentPdfUrl = null;
        return;
      }

      const audience = String(this.campaignForm.get('audience')?.value ?? '').toLowerCase();
      const raw = this.campaignForm.get('product')?.value;

      let body: any = null;
      if (audience === 'product') {
        const id = this.extractSelectedProductId();
        if (!id) {
          this.purchaseRows = [];
          this.purchasePdfUrl = null;
          this.contentPdfUrl = null;
          return;
        }
        body = { productIdList: [id], sendPDF: false };
      } else if (audience === 'retail') {
        const catId = raw ?? null;
        if (!catId) {
          this.purchaseRows = [];
          this.purchasePdfUrl = null;
          this.contentPdfUrl = null;
          return;
        }
        body = { productCategory: Number(catId), sendPDF: true };
      } else {
        this.purchaseRows = [];
        this.purchasePdfUrl = null;
        this.contentPdfUrl = null;
        return;
      }

      if (this.purchaseHistorySub) {
        this.purchaseHistorySub.unsubscribe();
        this.purchaseHistorySub = null;
      }

      this.purchaseHistorySub = this.apiService.Get_Purchase_History(body).subscribe({
        next: (res: any) => {
          this.purchaseHistorySub = null;
          try {
            const products = Array.isArray(res?.products) ? res.products : [];
            const allCustomers: any[] = [];
            for (const p of products) {
              const purchasedBy = Array.isArray(p?.purchasedBy) ? p.purchasedBy : [];
              for (const c of purchasedBy) allCustomers.push(c);
            }

            const seenKeys = new Set<string>();
            const deduped: any[] = [];
            for (const c of allCustomers) {
              const emailRaw = c?.customerEmail ?? c?.customerEmail ?? c?.email ?? '';
              const email = String(emailRaw ?? '').trim().toLowerCase();
              let key = email;
              if (!key) {
                const id = String(c?.customerId ?? c?.id ?? '').trim();
                const phone = String(c?.customerContact?.number ?? c?.whatsapp ?? '').trim();
                const name = String(c?.customerName ?? c?.name ?? '').trim();
                key = `noemail:${id || phone || name}`;
              }
              if (!key) continue;
              if (seenKeys.has(key)) continue;
              seenKeys.add(key);
              if (this.hasAnyContact(c)) deduped.push(c);
            }

            this.purchaseRows = deduped;
            this.resetPurchaseSelection();
            if (!this.contentPdfUrl) {
              this.purchasePdfUrl = res?.pdfURL ?? null;
            }
            this.applySelectionsFromCampaignCustomers();
            this.cdr.detectChanges();
          } catch (e) {
            this.purchaseRows = [];
            this.purchaseNameSelection = [];
            this.purchaseWhatsappSelection = [];
            this.purchaseEmailSelection = [];
            this.purchasePdfUrl = null;
            this.contentPdfUrl = null;
          }
        },
        error: (err) => {
          this.purchaseHistorySub = null;
          console.error('Failed fetching purchase history', err);
          this.purchaseRows = [];
          this.purchaseNameSelection = [];
          this.purchaseWhatsappSelection = [];
          this.purchaseEmailSelection = [];
          this.purchasePdfUrl = null;
          this.contentPdfUrl = null;
          try { this.toastr.error('Failed to load purchase history'); } catch (e) { }
          this.cdr.detectChanges();
        }
      });
    } catch (e) {
      this.purchaseRows = [];
      this.purchaseNameSelection = [];
      this.purchaseWhatsappSelection = [];
      this.purchaseEmailSelection = [];
      this.purchasePdfUrl = null;
      this.contentPdfUrl = null;
    }
  }

  get isPersonalisedRetail(): boolean {
    const type = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase();
    const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();
    return type === 'personalised' && audience === 'retail';
  }

  private loadProducts(term: any) {
    if (!this.allowProductApiCalls) {
      return;
    }
    const searchTerm = (term ?? '').toString();
    try {
      this.apiService
        .Get_Product_List_By_Search(0, '', '', '', searchTerm, this.productsFilter)
        .subscribe((res: any) => {
          this.productsForDropdown = Array.isArray(res?.content) ? res.content : [];

          try {
            if (Array.isArray(this.pendingSelectedProductIds) && this.pendingSelectedProductIds.length) {
              const isInterval = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase() === 'interval';
              const mapped: any[] = [];
              for (let i = 0; i < this.pendingSelectedProductIds.length; i++) {
                const pid = this.pendingSelectedProductIds[i];
                let found = (this.productsForDropdown || []).find((p: any) => {
                  const pidVal = p?.id ?? p?.product_id ?? p?.productId ?? p?.value ?? p;
                  return String(pidVal) === String(pid);
                });
                if (!found) {
                  const pname = (this.pendingSelectedProductNames && this.pendingSelectedProductNames[i]) || null;
                  if (pname) {
                    found = (this.productsForDropdown || []).find((p: any) => String(p?.name ?? p?.product_name ?? p?.description ?? '').trim() === String(pname).trim());
                  }
                }
                if (found) mapped.push(found);
                else mapped.push(pid);
              }

              const productCtl = this.campaignForm.get('product');
              if (productCtl) {
                try {
                  if (isInterval) {
                    productCtl.setValue(mapped, { emitEvent: false });
                  } else {
                    const first = mapped.length ? mapped[0] : '';
                    const idVal = first && typeof first === 'object'
                      ? (first?.id ?? first?.product_id ?? first?.productId ?? first?.value ?? '')
                      : first;
                    productCtl.setValue(idVal ?? '', { emitEvent: false });
                  }
                } catch (e) {
                  // ignore
                }
              }
            }
          } catch (e) {
            // ignore mapping errors
          }

          this.cdr.detectChanges();
        });
    } catch (e) {
      this.productsForDropdown = [];
    }
  }

  private normalizeIntervalType(raw: any): string {
    try {
      if (!raw && raw !== 0) return '';
      const s = String(raw ?? '').trim().toLowerCase();
      if (!s) return '';
      if (s.includes('day')) return 'daily';
      if (s.includes('week')) return 'weekly';
      if (s.includes('month')) return 'monthly';
      if (s.includes('year')) return 'yearly';
      if (s.includes('weekel') || s.includes('weekely') || s.includes('wekly')) return 'weekly';
      if (s.includes('montly') || s.includes('mnth')) return 'monthly';
      if (s.includes('yr') || s.includes('yrly')) return 'yearly';
      if (s === 'w' || s === 'm' || s === 'y' || s === 'd') {
        if (s === 'w') return 'weekly';
        if (s === 'm') return 'monthly';
        if (s === 'y') return 'yearly';
        if (s === 'd') return 'daily';
      }
      return s;
    } catch (e) {
      return String(raw ?? '').trim().toLowerCase();
    }
  }

  private extractServiceDescriptionForRetail(): string | null {
    try {
      const raw = this.campaignForm.get('product')?.value;
      const arr = Array.isArray(raw) ? raw : raw != null && raw !== '' ? [raw] : [];
      if (!arr.length) return null;
      const first = arr[0];
      const label = first?.description ?? first?.name ?? first?.product_name ?? first;
      const s = String(label ?? '').trim();
      return s || null;
    } catch (e) {
      return null;
    }
  }
}