import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Location, NgIf, NgFor, NgClass } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { CampaignsApiService } from './service/campaigns-api.service';
import { CommonService } from 'src/app/service/common.service';
import { ToastrService } from 'ngx-toastr';
import { APPCOMMONHELPERS } from 'src/app/helpers/appcommonhelpers';
import { environment } from 'src/environments/environment';
import validateEndDate from 'src/app/helpers/date-validators';
import {
  SocialProfileConnection,
  SocialProfilesApiService,
} from '../social-broadcast-management/service/social-profiles-api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { formatGeneratedContentToHtml, htmlToSocialText } from 'src/app/helpers/content-utils';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinSearchSelectNewComponent } from '../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinSearchableSelectComponent } from '../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { TimePickerComponent } from '../../../shared/widgets/time-picker/time-picker.component';
import { DadyinSelectComponent } from '../../../shared/widgets/dadyin-select/dadyin-select.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DadyinInputComponent } from '../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionModule } from '@angular/material/expansion';
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
    selector: 'app-create-campaign',
    templateUrl: './create-campaign.component.html',
    styleUrls: ['./create-campaign.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        SpinnerOverlayComponent,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        DadyinInputComponent,
        MatTooltipModule,
        DadyinSelectComponent,
        TimePickerComponent,
        DadyinSearchableSelectComponent,
        DadyinSearchSelectNewComponent,
        NgFor,
        NgClass,
        ExtendedModule,
        CKEditorModule,
    ],
})
export class CreateCampaignComponent implements OnInit {
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
  private productsById = new Map<number, any>();
  purchaseRows: any[] = [];
  purchaseNameSelection: boolean[] = [];
  purchaseWhatsappSelection: boolean[] = [];
  purchaseEmailSelection: boolean[] = [];
  purchasePdfUrl: string | null = null;

  connectedSocialPlatforms: Array<{ name: string; icon: string }> = [];
  private connectedPlatformNames: string[] = [];
  private connectedPlatformIdsCsv: string = '';

  @ViewChild('refFileInput') refFileInputRef!: ElementRef<HTMLInputElement>;
  selectedAttachments: Array<{ file: File; url: string; name: string }> = [];
  maxAttachments = 3;
  allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  productImageBaseUrl: string = environment?.imgUrl || '';
  productImagesForDisplay: ProductImageTile[] = [];
  productImagesPageIndex: number = 0;
  productImagesPageSize: number = 4;
  private selectedProductImageKeys = new Set<string>();

  generatedCampaignImageUrl: string | null = null;
  generatedPersonalizedImagePrompt: string | null = null;
  generatedCampaignImages: Array<{
    url: string;
    productId?: number;
    productName?: string;
  }> = [];
  generatedCampaignSelectedIndex: number = 0;

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

  get selectedProductImagesCount(): number {
    try {
      return this.selectedProductImageKeys.size;
    } catch (e) {
      return 0;
    }
  }

  get hasProductImagesSlider(): boolean {
    return Array.isArray(this.productImagesForDisplay) && this.productImagesForDisplay.length > this.productImagesPageSize;
  }

  get canNextProductImagesPage(): boolean {
    try {
      const nextStart = (this.productImagesPageIndex + 1) * this.productImagesPageSize;
      return nextStart < (this.productImagesForDisplay?.length || 0);
    } catch (e) {
      return false;
    }
  }

  get pagedProductImages(): ProductImageTile[] {
    try {
      const list = Array.isArray(this.productImagesForDisplay) ? this.productImagesForDisplay : [];
      const start = this.productImagesPageIndex * this.productImagesPageSize;
      return list.slice(start, start + this.productImagesPageSize);
    } catch (e) {
      return [];
    }
  }

  prevProductImagesPage() {
    try {
      this.productImagesPageIndex = Math.max(0, this.productImagesPageIndex - 1);
    } catch (e) {}
  }

  nextProductImagesPage() {
    try {
      if (!this.canNextProductImagesPage) return;
      this.productImagesPageIndex = this.productImagesPageIndex + 1;
    } catch (e) {}
  }

  isProductImageSelected(img: ProductImageTile): boolean {
    try {
      return this.selectedProductImageKeys.has(this.makeProductImageKey(img));
    } catch (e) {
      return false;
    }
  }

  toggleProductImageSelection(img: ProductImageTile) {
    try {
      if (!img) return;

      const key = this.makeProductImageKey(img);
      if (!key) return;

      if (this.selectedProductImageKeys.has(key)) {
        this.selectedProductImageKeys.delete(key);
        this.cdr.detectChanges();
        return;
      }

      const prodId = String(img?.productId ?? '');
      for (const existingKey of Array.from(this.selectedProductImageKeys)) {
        const existingProdId = String((existingKey || '').split('::')[0] || '');
        if (existingProdId === prodId) {
          this.selectedProductImageKeys.delete(existingKey);
        }
      }

      const maxAllowed = this.productSelectionCount || 0;
      if (maxAllowed <= 0) {
        try { (this.toastr as any)?.info?.('Select product(s) first to choose images'); } catch (e) { }
        return;
      }

      this.selectedProductImageKeys.add(key);

      while (this.selectedProductImageKeys.size > maxAllowed) {
        const it = this.selectedProductImageKeys.values();
        const first = it.next().value;
        if (first) this.selectedProductImageKeys.delete(first);
        else break;
      }

      this.cdr.detectChanges();
    } catch (e) {}
  }

  constructor(
    private fb: UntypedFormBuilder,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private campaignsApi: CampaignsApiService,
    private socialProfilesApi: SocialProfilesApiService,
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

  private resetForm() {
    try {
      this.campaignForm.reset(
        {
          prompt: '',
          campaignDescription: '',
          name: '',
          postType: '',
          type: 'Personalised',
          audience: 'Product',
          product: '',
          sharingOn: '',
          startDate: '',
          endDate: '',
          publicationTime: '',
          intervalType: '',
          intervalValue: 1,
          modify: false,
        },
        { emitEvent: false }
      );
    } catch (e) {}
    try {
      this.applyIntervalEnabledState(this.campaignForm.get('type')?.value);
    } catch (e) {}
  }

  private resetPurchaseSelection() {
    try {
      const len = Array.isArray(this.purchaseRows) ? this.purchaseRows.length : 0;
      this.purchaseNameSelection = new Array(len).fill(true);
      this.purchaseWhatsappSelection = new Array(len).fill(false);
      this.purchaseEmailSelection = new Array(len).fill(false);

      for (let i = 0; i < len; i++) {
        const r = this.purchaseRows[i];
        if (this.hasWhatsappContact(r)) this.purchaseWhatsappSelection[i] = true;
        if (this.hasEmailContact(r)) this.purchaseEmailSelection[i] = true;
      }
    } catch (e) {
      this.purchaseNameSelection = [];
      this.purchaseWhatsappSelection = [];
      this.purchaseEmailSelection = [];
    }
  }

  get purchaseSelectedCount(): number {
    try {
      this.ensurePurchaseSelectionLength();
      return (this.purchaseNameSelection || []).filter(Boolean).length;
    } catch (e) {
      return 0;
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

  private clearPurchaseTableState() {
    this.purchaseRows = [];
    this.purchaseNameSelection = [];
    this.purchaseWhatsappSelection = [];
    this.purchaseEmailSelection = [];
    this.purchasePdfUrl = null;
  }

  get isPersonalisedRetail(): boolean {
    const type = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase();
    const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();
    return type === 'personalised' && audience === 'retail';
  }

  private syncPromptAndReferenceDisabledState() {
    try {
      const promptCtl = this.campaignForm.get('prompt');
      if (!promptCtl) return;

      if (this.isPersonalisedRetail) {
        if (promptCtl.enabled) {
          try { promptCtl.disable({ emitEvent: false }); } catch (e) { }
        }
      } else {
        if (promptCtl.disabled) {
          try { promptCtl.enable({ emitEvent: false }); } catch (e) { }
        }
      }
    } catch (e) {}
  }

  private hasValue(value: any): boolean {
    if (value == null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
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
    } catch (e) {}
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
        const r = this.purchaseRows[i];
        if (this.hasWhatsappContact(r)) this.purchaseWhatsappSelection[i] = !!checked;
        if (this.hasEmailContact(r)) this.purchaseEmailSelection[i] = !!checked;
      }
    } catch (e) {}
  }

  togglePurchaseWhatsappAll(checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      const len = this.purchaseRows.length;
      for (let i = 0; i < len; i++) {
        const r = this.purchaseRows[i];
        if (!this.hasWhatsappContact(r)) {
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
    } catch (e) {}
  }

  togglePurchaseEmailAll(checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      const len = this.purchaseRows.length;
      for (let i = 0; i < len; i++) {
        const r = this.purchaseRows[i];
        if (!this.hasEmailContact(r)) {
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
    } catch (e) {}
  }

  togglePurchaseNameRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      this.purchaseNameSelection[index] = !!checked;
      const r = this.purchaseRows[index];
      this.purchaseWhatsappSelection[index] = this.hasWhatsappContact(r) ? !!checked : false;
      this.purchaseEmailSelection[index] = this.hasEmailContact(r) ? !!checked : false;
    } catch (e) {}
  }

  private clearSharedDraftFieldsForModeSwitch(): void {
    try { this.campaignForm.get('prompt')?.setValue('', { emitEvent: false }); } catch (e) { }
    try { this.campaignForm.get('campaignDescription')?.setValue('', { emitEvent: false }); } catch (e) { }
    try { this.campaignForm.get('sharingOn')?.setValue('', { emitEvent: false }); } catch (e) { }

    try { this.selectedAttachments = []; } catch (e) { }
    try {
      const el = this.refFileInputRef?.nativeElement;
      if (el) el.value = '';
    } catch (e) { }

    try { this.generatedCampaignImages = []; } catch (e) { }
    try { this.generatedCampaignImageUrl = null; } catch (e) { }
    try { this.generatedPersonalizedImagePrompt = null; } catch (e) { }
    try { this.generatedCampaignSelectedIndex = 0; } catch (e) { }

    try { this.clearPurchaseTableState(); } catch (e) { }
  }

  public onCampaignTypeChange(nextType: 'Personalised' | 'Interval'): void {
    try {
      const current = String(this.campaignForm.get('type')?.value ?? 'Personalised');
      if (current === nextType) return;

      try { this.campaignForm.get('type')?.setValue(nextType, { emitEvent: false }); } catch (e) { }

      this.clearSharedDraftFieldsForModeSwitch();

      if (nextType === 'Interval') {
        try { this.campaignForm.get('audience')?.setValue('Product', { emitEvent: false }); } catch (e) { }
        try {
          const productCtl = this.campaignForm.get('product');
          productCtl?.enable({ emitEvent: false });
          productCtl?.setValue([], { emitEvent: false });
          productCtl?.markAsPristine();
          productCtl?.markAsUntouched();
          productCtl?.updateValueAndValidity({ emitEvent: false });
        } catch (e) { }
        try { this.loadProducts(''); } catch (e) { }
      } else {
        try { this.campaignForm.get('audience')?.setValue('Product', { emitEvent: false }); } catch (e) { }
        try {
          const productCtl = this.campaignForm.get('product');
          productCtl?.enable({ emitEvent: false });
          productCtl?.setValue('', { emitEvent: false });
          productCtl?.markAsPristine();
          productCtl?.markAsUntouched();
          productCtl?.updateValueAndValidity({ emitEvent: false });
        } catch (e) { }
        try { this.loadProducts(''); } catch (e) { }
      }

      this.applyIntervalEnabledState(nextType);
      this.updateSharingOnPreview();
      this.syncPromptAndReferenceDisabledState();

      try { this.cdr.detectChanges(); } catch (e) { }
    } catch (e) {}
  }

  togglePurchaseWhatsappRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      if (!this.hasWhatsappContact(this.purchaseRows[index])) return;
      this.purchaseWhatsappSelection[index] = !!checked;
      if (checked) {
        this.purchaseNameSelection[index] = true;
      } else {
        if (!this.purchaseEmailSelection[index]) this.purchaseNameSelection[index] = false;
      }
    } catch (e) {}
  }

  togglePurchaseEmailRow(index: number, checked: boolean) {
    try {
      this.ensurePurchaseSelectionLength();
      if (index < 0 || index >= this.purchaseRows.length) return;
      if (!this.hasEmailContact(this.purchaseRows[index])) return;
      this.purchaseEmailSelection[index] = !!checked;
      if (checked) {
        this.purchaseNameSelection[index] = true;
      } else {
        if (!this.purchaseWhatsappSelection[index]) this.purchaseNameSelection[index] = false;
      }
    } catch (e) {}
  }

  private applyIntervalEnabledState(typeValue: any) {
    const type = String(typeValue ?? '').toLowerCase();
    const isInterval = type === 'interval';

    const intervalTypeCtl = this.campaignForm.get('intervalType');
    const intervalValueCtl = this.campaignForm.get('intervalValue');
    const modifyCtl = this.campaignForm.get('modify');

    try { intervalTypeCtl?.enable({ emitEvent: false }); } catch (e) { }

    if (!intervalTypeCtl || !intervalValueCtl) return;

    try { this.campaignForm.get('product')?.enable({ emitEvent: false }); } catch (e) { }

    if (isInterval) {
      try { intervalValueCtl.setValue(1, { emitEvent: false }); } catch (e) { }
      try { intervalValueCtl.disable({ emitEvent: false }); } catch (e) { }
      try { modifyCtl?.setValue(false, { emitEvent: false }); } catch (e) { }
      try { modifyCtl?.disable({ emitEvent: false }); } catch (e) { }
      try { this.campaignForm.get('audience')?.setValue('Product', { emitEvent: false }); } catch (e) { }
      try { this.campaignForm.get('product')?.setValue([], { emitEvent: false }); } catch (e) { }
      try { this.loadProducts(''); } catch (e) { }
      try { this.clearPurchaseTableState(); } catch (e) { }
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
            productCtl.setValue('', { emitEvent: false });
          }
        }
      }
    } catch (e) {}
  }

  private showInfoDialog(content: string, heading: string = 'Alert') {
    try {
      this.commonService.showAlertDialog({
        heading,
        content,
        showCancel: false,
        actionBtnName: 'Ok',
      });
    } catch (e) {}
  }

  private showValidationDialog(messages: string[] | string, heading: string = 'Alert') {
    try {
      const content = Array.isArray(messages) ? messages.join('<br/>') : String(messages || '');
      if (!content) return;
      this.showInfoDialog(content, heading);
    } catch (e) {}
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

  private formatDateForInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

  private formatScheduledUtcTimeForInterval(dateVal: any, timeVal: any): string | null {
    try {
      const dateOnly = this.toJsDate(dateVal);
      if (!dateOnly) return null;

      const parsed = this.parseTimeToHoursMinutes(timeVal);
      if (!parsed) return null;

      const local = new Date(dateOnly.getTime());
      local.setHours(parsed.hours, parsed.minutes, 0, 0);

      const utcHours = local.getUTCHours();
      const utcMinutes = local.getUTCMinutes();

      return `${utcHours}:${String(utcMinutes).padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  }

  private formatScheduledUtcTimeHHmm(dateVal: any, timeVal: any): string | null {
    try {
      const raw = this.formatScheduledUtcTimeForInterval(dateVal, timeVal);
      const s = String(raw ?? '').trim();
      if (!s) return null;
      const m = s.match(/^([0-9]{1,2})\s*:\s*([0-9]{1,2})$/);
      if (!m) return null;
      const hh = String(Number(m[1])).padStart(2, '0');
      const mm = String(Number(m[2])).padStart(2, '0');
      return `${hh}:${mm}`;
    } catch (e) {
      return null;
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

  private normalizeImageFileName(value: any): string {
    const s = String(value ?? '').trim();
    if (!s) return '';
    return s;
  }

  private getProductLabelFromItem(item: any): string {
    try {
      const lbl = APPCOMMONHELPERS.getProductLabel(item);
      return lbl && String(lbl).trim() ? String(lbl).trim() : 'Product';
    } catch (e) {
      return 'Product';
    }
  }

  private extractProductImageFileNames(item: any): string[] {
    try {
      const raw = item?.productImageFileNames ?? item?.product_image_file_names ?? item?.productImages ?? item?.images;
      if (Array.isArray(raw)) {
        return raw.map((x) => this.normalizeImageFileName(x)).filter(Boolean);
      }
      if (typeof raw === 'string') {
        const s = raw.trim();
        if (!s) return [];
        if (s.startsWith('[') && s.endsWith(']')) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
              return parsed.map((x) => this.normalizeImageFileName(x)).filter(Boolean);
            }
          } catch (e) { }
        }
        return s.split(/\s*,\s*/g).map((x) => this.normalizeImageFileName(x)).filter(Boolean);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  private findProductInDropdownById(sel: any): any | null {
    try {
      const id = sel?.id ?? sel?.productId ?? sel?.product_id ?? sel;
      const n = Number(id);
      if (isFinite(n) && n > 0) {
        const cached = this.productsById.get(n);
        if (cached) return cached;
        const found = (this.productsForDropdown || []).find((p: any) => Number(p?.id) === n);
        if (found) return found;
      }

      const desc = String(id ?? '').trim();
      if (desc) {
        const foundByDesc = (this.productsForDropdown || []).find((p: any) => String(p?.description ?? '').trim() === desc);
        if (foundByDesc) return foundByDesc;
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  private buildProductImageTiles(selection: any): ProductImageTile[] {
    const arr = Array.isArray(selection) ? selection : selection ? [selection] : [];
    const tiles: ProductImageTile[] = [];

    for (const sel of arr) {
      const item = (sel && typeof sel === 'object') ? sel : this.findProductInDropdownById(sel);
      if (!item) continue;

      const productId = item?.id ?? item?.productId ?? item?.product_id ?? null;
      const productLabel = this.getProductLabelFromItem(item);
      const fileNames = this.extractProductImageFileNames(item);
      const total = fileNames.length;

      for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        const raw = String(fileName ?? '').trim();
        const isAbsolute = /^https?:\/\//i.test(raw) || /^data:/i.test(raw);
        const url = isAbsolute ? raw : `${this.productImageBaseUrl || ''}${raw}`;
        tiles.push({
          productId,
          productLabel,
          fileName,
          url,
          imageIndex: i + 1,
          imageTotal: total,
        });
      }
    }

    return tiles;
  }

  private makeProductImageKey(img: ProductImageTile): string {
    return `${String(img?.productId ?? '')}::${String(img?.fileName ?? '')}`;
  }

  private rebuildProductImagesFromSelection(v: any) {
    try {
      this.productImagesForDisplay = this.buildProductImageTiles(v);
      this.productImagesPageIndex = 0;

      const allowedKeys = new Set(this.productImagesForDisplay.map((x) => this.makeProductImageKey(x)));
      const next = new Set<string>();
      for (const k of Array.from(this.selectedProductImageKeys)) {
        if (allowedKeys.has(k)) next.add(k);
      }
      this.selectedProductImageKeys = next;
    } catch (e) {
      this.productImagesForDisplay = [];
      this.productImagesPageIndex = 0;
      this.selectedProductImageKeys = new Set<string>();
    }
    try { this.cdr.detectChanges(); } catch (e) { }
  }

  private setupProductImagesSync() {
    try {
      const ctl = this.campaignForm.get('product') as UntypedFormControl;
      if (!ctl) return;

      this.rebuildProductImagesFromSelection(ctl.value);
      ctl.valueChanges.pipe(debounceTime(0)).subscribe((v: any) => {
        this.rebuildProductImagesFromSelection(v);
      });
    } catch (e) {}
  }

  private normalizeCampaignType(typeValue: any): 'personalized' | 'interval' {
    const t = String(typeValue ?? '').trim().toLowerCase();
    if (t === 'interval') return 'interval';
    return 'personalized';
  }

  get productControl() {
    return this.campaignForm.get('product');
  }

  get hasSelectedProduct(): boolean {
    try {
      return this.hasValue(this.productControl?.value);
    } catch (e) {
      return false;
    }
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
    } catch (e) {}
  }

  nextCampaignPostImage() {
    try {
      if (!Array.isArray(this.generatedCampaignImages) || this.generatedCampaignImages.length <= 1) return;
      const len = this.generatedCampaignImages.length;
      const next = (Number(this.generatedCampaignSelectedIndex) || 0) + 1;
      this.generatedCampaignSelectedIndex = next % len;
      this.generatedCampaignImageUrl = this.generatedCampaignImages[this.generatedCampaignSelectedIndex]?.url || null;
    } catch (e) {}
  }


  openCampaignPdf(): void {
    try {
      const url = this.purchasePdfUrl;
      if (!url) return;
      window.open(url, '_blank');
    } catch (e) {}
  }

  private mapFirstImageUrlFromPersonalizedGenerateResponse(res: any): string | null {
    try {
      const mime = String(res?.mime_type ?? res?.mimeType ?? 'image/png').trim() || 'image/png';

      const url = res?.image_url ?? res?.imageUrl ?? res?.url ?? null;
      if (url) return String(url).trim();

      const base64 = res?.image_data ?? res?.imageData ?? res?.data ?? res?.image ?? null;
      if (base64 && String(base64).trim()) {
        const b64 = String(base64).trim();
        if (b64.startsWith('data:')) return b64;
        return `data:${mime};base64,${b64}`;
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  private getSelectedRetailService(): { id: number | null; name: string | null } {
    try {
      const raw = this.campaignForm.get('product')?.value;
      const idNum = Number(raw);
      const id = isFinite(idNum) && idNum > 0 ? idNum : null;
      const found = id
        ? (this.productsForDropdown || []).find((x: any) => Number(x?.id) === id)
        : null;
      const name = found ? String(found?.description ?? found?.name ?? '').trim() : null;
      return { id, name: name || null };
    } catch (e) {
      return { id: null, name: null };
    }
  }

  private getSelectedProduct(): { id: number | null; name: string | null } {
    try {
      const id = this.extractSelectedProductId();
      const found = id
        ? (this.productsForDropdown || []).find((x: any) => Number(x?.id) === Number(id))
        : null;
      const name = found ? String(found?.description ?? found?.name ?? '').trim() : null;
      return { id, name: name || null };
    } catch (e) {
      return { id: null, name: null };
    }
  }

  private buildSelectedCustomersForPublish(): any[] {
    try {
      const rows = Array.isArray(this.purchaseRows) ? this.purchaseRows : [];
      this.ensurePurchaseSelectionLength();

      const out: any[] = [];
      for (let i = 0; i < rows.length; i++) {
        const r: any = rows[i];
        const whatsapp = this.hasWhatsappContact(r) ? !!this.purchaseWhatsappSelection[i] : false;
        const email = this.hasEmailContact(r) ? !!this.purchaseEmailSelection[i] : false;
        const selected = !!this.purchaseNameSelection[i] || whatsapp || email;
        if (!selected) continue;

        const customerId = Number(r?.customerId ?? r?.customer_id ?? r?.id) || 0;
        const customerName = String(r?.customerName ?? r?.customer_name ?? r?.name ?? '').trim();
        const customerPhone = this.getCustomerWhatsappValue(r) ?? '';
        const customerEmail = this.getCustomerEmailValue(r) ?? '';

        out.push({
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          whatsapp,
          email,
        });
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  private async uploadPersonalizedPublishImage(): Promise<string | null> {
    try {
      const url = String(this.generatedCampaignImageUrl ?? '').trim();
      if (!url) return null;

      const file = await this.urlToFile(url, 'campaign-personalized');
      if (!file) return null;

      const res: any = await this.apiService.uploadFiles([file]);
      const uploaded = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.Data) ? res.Data : []);
      const first = Array.isArray(uploaded) && uploaded.length ? uploaded[0] : null;
      const key = String(first?.media_url ?? first?.mediaUrl ?? first?.key ?? first?.url ?? '').trim();
      return key || null;
    } catch (e) {
      return null;
    }
  }

  private generatePersonalizedCampaign() {
    if (this.isLoading) return;

    const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();
    const personalizedType = audience === 'retail' ? 'retail' : 'product';
    const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();

    const missing: string[] = [];
    if (personalizedType === 'product' && prompt.length < 10) missing.push('Prompt must be at least 10 characters.');

    let productId: number | null = null;
    let serviceDescription: string | null = null;

    if (personalizedType === 'product') {
      const p = this.getSelectedProduct();
      productId = p.id;
      if (!productId) missing.push('Please select Existing Product.');
    } else {
      const s = this.getSelectedRetailService();
      serviceDescription = s.name;
      if (!serviceDescription) missing.push('Please select Existing Retailer service.');
    }

    if (missing.length) {
      this.showValidationDialog(missing);
      return;
    }

    let productsData: Array<{ product_id: number; images: string[] }> = [];
    if (personalizedType === 'product') {
      productsData = this.buildProductsDataForPersonalized(productId);
      const hasImages = Array.isArray(productsData) && productsData.length && Array.isArray(productsData[0].images) && productsData[0].images.length > 0;
      if (!hasImages) {
        let label = '';
        try {
          const rawSel = this.campaignForm.get('product')?.value;
          const selItem = Array.isArray(rawSel) ? (rawSel[0] || null) : rawSel;
          const found = selItem && typeof selItem === 'object' ? selItem : this.findProductInDropdownById(selItem ?? productId);
          label = this.getProductLabelFromItem(found) || String(productId ?? 'Product');
        } catch (e) {
          label = String(productId ?? 'Product');
        }

        const msg = `Please select one image for the product '${label}'. If no image is available for this product, please select another product to proceed.`;
        this.showValidationDialog([msg]);
        return;
      }
    }

    const formData = new FormData();
    formData.append('personalized_type', personalizedType);
    formData.append('prompt', prompt);
    formData.append('service_description', personalizedType === 'retail' && serviceDescription ? serviceDescription : '');
    if (Array.isArray(productsData) && productsData.length) {
      formData.append('products_data', JSON.stringify(productsData[0]));
    }

    try {
      const files = Array.isArray(this.selectedAttachments)
        ? this.selectedAttachments.slice(0, this.maxAttachments)
        : [];
      files.forEach((att: any) => {
        const f: File | undefined = att?.file;
        if (f) formData.append('uploaded_images', f, f.name);
      });
    } catch (e) {}

    this.isLoading = true;
    try { this.cdr.detectChanges(); } catch (e) { }

    this.campaignsApi.generatePersonalizedCampaign(formData).subscribe({
      next: (res: any) => {
        try {
          const content = String(res?.content ?? res?.caption ?? res?.text ?? '').trim();
          if (content) {
            const html = formatGeneratedContentToHtml(content);
            try { this.campaignForm.get('campaignDescription')?.setValue(html, { emitEvent: false }); } catch (e) { }
          }

          this.generatedPersonalizedImagePrompt = String(res?.image_prompt ?? res?.imagePrompt ?? res?.prompt ?? '').trim() || null;
          const imgUrl = this.mapFirstImageUrlFromPersonalizedGenerateResponse(res);
          this.generatedCampaignImages = [];
          this.generatedCampaignSelectedIndex = 0;
          this.generatedCampaignImageUrl = imgUrl;

          if (!this.generatedCampaignImageUrl) {
            if (personalizedType !== 'retail') {
              try { this.toastr.warning('No image returned from personalized generate'); } catch (e) { }
            }
          }
        } catch (e) {}
        this.isLoading = false;
        try { this.cdr.detectChanges(); } catch (e) { }
      },
      error: (err: any) => {
        console.error('Personalized generate failed', err);
        this.isLoading = false;
        try { this.toastr.error('Failed to generate personalized campaign'); } catch (e) { }
        try { this.cdr.detectChanges(); } catch (e) { }
      },
    });
  }

  private publishPersonalizedCampaign() {
    if (this.isLoading) return;

    const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();
    const personalizedType = audience === 'retail' ? 'retail' : 'product';

    const campaignName = String(this.campaignForm.get('name')?.value ?? '').trim();
    const postType = String(this.campaignForm.get('postType')?.value ?? '').trim();
    const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();
    const startDateVal = this.campaignForm.get('startDate')?.value;
    const endDateVal = this.campaignForm.get('endDate')?.value;
    const timeVal = this.campaignForm.get('publicationTime')?.value;
    const intervalType = String(this.campaignForm.get('intervalType')?.value ?? '').trim();
    const content = htmlToSocialText(this.campaignForm.get('campaignDescription')?.value ?? '');

    const missing: string[] = [];
    if (!campaignName) missing.push('Please enter Campaign Name.');
    if (!postType) missing.push('Please select Post type.');
    if (personalizedType === 'product' && !prompt) missing.push('Please enter Prompt.');
    if (!startDateVal) missing.push('Please select Start Date.');
    if (!timeVal) missing.push('Please select Campaign Time.');
    if (!intervalType) missing.push('Please select Interval Type.');
    if (personalizedType === 'product' && !String(this.generatedCampaignImageUrl ?? '').trim()) missing.push('Please generate an image before publishing.');

    const scheduledTimeUtc = this.formatScheduledUtcTimeHHmm(startDateVal, timeVal);
    if (!scheduledTimeUtc) missing.push('Please select a valid Campaign Time.');

    const selectedCustomers = this.buildSelectedCustomersForPublish();
    if (selectedCustomers.length === 0) {
      missing.push('Please select at least one customer (WhatsApp or Email) before publishing.');
    }

    if (startDateVal && endDateVal && intervalType) {
      const v = validateEndDate(startDateVal, endDateVal, intervalType);
      if (!v.valid) missing.push(v.error || 'Invalid date range for selected interval');
    }

    const product = personalizedType === 'product' ? this.getSelectedProduct() : { id: null, name: null };
    const service = personalizedType === 'retail' ? this.getSelectedRetailService() : { id: null, name: null };
    if (personalizedType === 'product' && !product.id) missing.push('Please select Existing Product.');
    if (personalizedType === 'retail' && !service.name) missing.push('Please select Existing Retailer service.');

    if (missing.length) {
      this.showValidationDialog(missing);
      return;
    }

    this.isLoading = true;
    try { this.cdr.detectChanges(); } catch (e) { }

    (async () => {
      let imageKey: string | null = null;
      if (personalizedType === 'product') {
        const uploadedKey = await this.uploadPersonalizedPublishImage();
        if (!uploadedKey) {
          this.isLoading = false;
          try { this.toastr.error('Failed to upload image for publish'); } catch (e) { }
          try { this.cdr.detectChanges(); } catch (e) { }
          return;
        }
        imageKey = uploadedKey;
      }

      const products = this.buildProductsArrayForPublish();
      const payload: any = {
        personalized_type: personalizedType,
        campaign_name: campaignName,
        post_type: postType,
        prompt,
        content,
        start_date: this.formatDateForApi(startDateVal),
        end_date: this.formatDateForApi(endDateVal),
        scheduled_time: scheduledTimeUtc,
        interval_type: intervalType || null,
        product: personalizedType === 'product' ? products : undefined,
        service_id: personalizedType === 'retail' ? service.id : null,
        service_name: personalizedType === 'retail' ? service.name : null,
        image_data: imageKey,
        image_prompt: this.generatedPersonalizedImagePrompt || prompt,
        pdf_url: this.purchasePdfUrl,
        customers: selectedCustomers,
      };

      this.campaignsApi.publishPersonalizedCampaign(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.resetForm();
          this.selectedAttachments = [];
          this.generatedCampaignImageUrl = null;
          this.generatedPersonalizedImagePrompt = null;
          this.generatedCampaignImages = [];
          this.generatedCampaignSelectedIndex = 0;
          this.clearPurchaseTableState();

          try { this.cdr.detectChanges(); } catch (e) { }
          try { this.toastr.success('Campaign published successfully'); } catch (e) {
            this.showInfoDialog('Campaign published successfully.', 'Success');
          }

          try {
            this.router.navigate(['../'], { relativeTo: this.route });
          } catch (e) {
            this.goBack();
          }
        },
        error: (err: any) => {
          console.error('Personalized publish failed', err);
          this.isLoading = false;
          try { this.toastr.error('Failed to publish personalized campaign'); } catch (e) { }
          try { this.cdr.detectChanges(); } catch (e) { }
        },
      });
    })().finally(() => {});
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

  private async urlToFile(url: string, filename: string): Promise<File | null> {
    try {
      const asStr = String(url || '').trim();
      if (!asStr) return null;
      if (asStr.startsWith('data:')) {
        return this.dataUrlToFile(asStr, filename);
      }

      const res = await fetch(asStr);
      const blob = await res.blob();
      const mime = blob.type || 'image/png';
      const ext = (mime.split('/')[1] || 'png').toLowerCase();
      const finalName = filename.includes('.') ? filename : `${filename}.${ext}`;
      return new File([blob], finalName, { type: mime });
    } catch (e) {
      return null;
    }
  }

  private mapGeneratedImagesFromIntervalResponse(res: any): Array<{ url: string; productId?: number; productName?: string }> {
    try {
      const products = Array.isArray(res?.products) ? res.products : [];
      const out: Array<{ url: string; productId?: number; productName?: string }> = [];
      for (const p of products) {
        const img = p?.image_data ?? p?.imageData ?? '';
        const mime = p?.mime_type ?? p?.mimeType ?? 'image/png';
        const s = String(img ?? '').trim();
        if (!s) continue;
        out.push({
          url: `data:${mime};base64,${s}`,
          productId: Number(p?.product_id ?? p?.productId ?? p?.id) || undefined,
          productName: p?.product_name ?? p?.productName ?? undefined,
        });
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  private buildProductsArrayForPublish(): Array<{ id: number; image: string }> {
    try {
      const selection = this.productControl?.value;
      if (!selection) return [];

      const ids: number[] = [];
      if (Array.isArray(selection)) {
        for (const item of selection) {
          const pid = Number(item?.id ?? item);
          if (isFinite(pid) && pid > 0) ids.push(pid);
        }
      } else {
        const pid = Number((selection as any)?.id ?? selection);
        if (isFinite(pid) && pid > 0) ids.push(pid);
      }

      const result: Array<{ id: number; image: string }> = [];
      for (const productId of ids) {
        let selectedImageKey: string | null = null;
        for (const img of this.productImagesForDisplay) {
          if (Number(img.productId) === productId) {
            const key = this.makeProductImageKey(img);
            if (this.selectedProductImageKeys.has(key)) {
              selectedImageKey = img.fileName;
              break;
            }
          }
        }

        if (selectedImageKey) {
          result.push({ id: productId, image: selectedImageKey });
        }
      }

      return result;
    } catch (e) {
      return [];
    }
  }

  private buildProductsDataFromProductSelections(): Array<{ product_id: number; images: string[] }> {
    try {
      const map = new Map<any, string[]>();

      for (const img of this.productImagesForDisplay || []) {
        const key = this.makeProductImageKey(img);
        if (!this.selectedProductImageKeys.has(key)) continue;
        const pid = img.productId;
        if (pid == null) continue;
        const arr = map.get(pid) || [];
        if (img.fileName) arr.push(img.fileName);
        map.set(pid, arr);
      }

      const rawSelected = this.campaignForm?.get('product')?.value;
      const selectedIds: any[] = [];
      if (Array.isArray(rawSelected)) {
        for (const p of rawSelected) {
          selectedIds.push(p?.id ?? p?.productId ?? p?.product_id ?? p);
        }
      } else if (rawSelected != null) {
        const p = rawSelected;
        selectedIds.push(p?.id ?? p?.productId ?? p?.product_id ?? p);
      }

      for (const pid of selectedIds) {
        if (pid == null) continue;
        if (!map.has(pid)) map.set(pid, []);
      }

      const out: Array<{ product_id: number; images: string[] }> = [];
      for (const [pid, images] of map.entries()) {
        out.push({ product_id: Number(pid), images: images.slice() });
      }

      return out;
    } catch (e) {
      return [];
    }
  }

  private buildProductsDataForPersonalized(productId: number | null): Array<{ product_id: number; images: string[] }> {
    try {
      const out: Array<{ product_id: number; images: string[] }> = [];
      const pid = Number(productId);
      if (!isFinite(pid) || pid <= 0) return out;
      const attachments = Array.isArray(this.selectedAttachments) ? this.selectedAttachments : [];
      if (attachments.length > 0) {
        out.push({ product_id: pid, images: attachments.map((a) => String(a?.name || '')) });
        return out;
      }

      const images: string[] = [];
      for (const img of this.productImagesForDisplay || []) {
        if (Number(img?.productId) !== pid) continue;
        const key = this.makeProductImageKey(img);
        if (!this.selectedProductImageKeys.has(key)) continue;
        if (img.fileName) images.push(img.fileName);
      }
      out.push({ product_id: pid, images });
      return out;
    } catch (e) {
      return [];
    }
  }

  openFilePicker() {
    try {
      if (this.isLoading) return;
      if (this.isPersonalisedRetail) return;
      this.refFileInputRef?.nativeElement?.click();
    } catch (e) {}
  }

  private extractSelectedProductIdsCsv(): string {
    try {
      const raw = this.campaignForm.get('product')?.value;
      const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const ids = arr
        .map((x: any) => x?.id ?? x?.product_id ?? x?.productId ?? x)
        .filter((v: any) => v !== undefined && v !== null && String(v).trim() !== '')
        .map((v: any) => String(v).trim());
      return ids.join(',');
    } catch (e) {
      return '';
    }
  }

  onReferenceFilesSelected(event: any) {
    try {
      if (this.isPersonalisedRetail) {
        try {
          const input = event?.target as HTMLInputElement;
          if (input) input.value = '';
        } catch (e) {}
        return;
      }
      const input = event?.target as HTMLInputElement;
      const files = input?.files;
      if (!files || files.length === 0) return;
      this.addSelectedFiles(files);
      try {
        input.value = '';
      } catch (e) {}
    } catch (e) {}
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
          } catch (e) {}
        };
        reader.readAsDataURL(f);
      }
    } catch (e) {}
  }

  removeAttachment(index: number) {
    try {
      if (!Array.isArray(this.selectedAttachments)) return;
      this.selectedAttachments = this.selectedAttachments.filter((_, i) => i !== index);

      try { this.cdr.detectChanges(); } catch (e) { }
    } catch (e) {}
  }

  ngOnInit(): void {
    this.loadProducts('');
    this.setupProductImagesSync();
    this.syncPromptAndReferenceDisabledState();
    this.loadConnectedSocialPlatforms();

    try {
      this.todayForInput = this.formatDateForInput(new Date());
    } catch (e) {
      this.todayForInput = '';
    }

    try {
      const endCtl = this.campaignForm.get('endDate');
      if (endCtl) endCtl.disable({ emitEvent: false });
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
          this.syncPromptAndReferenceDisabledState();
          try { this.cdr.detectChanges(); } catch (e) { }
        });
      }
    } catch (e) { }
    try {
      const prodCtl = this.campaignForm.get('product');
      if (prodCtl) {
        prodCtl.valueChanges.pipe(
          debounceTime(150),
          distinctUntilChanged((a: any, b: any) => {
            try {
              return JSON.stringify(a) === JSON.stringify(b);
            } catch (e) {
              return a === b;
            }
          })
        ).subscribe((v) => {
          try {
            const audience = String(this.campaignForm.get('audience')?.value ?? '').toLowerCase();
            if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
              this.purchaseRows = [];
              this.purchaseNameSelection = [];
              this.purchaseWhatsappSelection = [];
              this.purchaseEmailSelection = [];
              this.purchasePdfUrl = null;
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

              if (val === 'retail') {
                this.selectedAttachments = [];
                try {
                  const el = this.refFileInputRef?.nativeElement;
                  if (el) el.value = '';
                } catch (e) { }

                this.loadRetailCategories();
              } else {
                this.loadProducts('');
              }

              this.syncPromptAndReferenceDisabledState();

              try { this.cdr.detectChanges(); } catch (e) { }
            } catch (e) { }
          });
        }
    } catch (e) { }

    this.updateSharingOnPreview();
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

  private loadConnectedSocialPlatforms() {
    try {
      this.socialProfilesApi.getSocialProfiles().subscribe({
        next: (profiles: SocialProfileConnection[]) => {
          const connected = (profiles || []).filter((p: any) => {
            const status = `${p?.connection_status ?? ''}`.toLowerCase();
            const hasStatusKey = Object.prototype.hasOwnProperty.call(p ?? {}, 'connection_status');
            return hasStatusKey && status === 'connected' && !!p?.platform_name;
          });

          const seen = new Set<string>();
          const uniquePlatforms: string[] = [];
          const uniquePlatformIds: number[] = [];
          for (const p of connected) {
            const name = String(p?.platform_name ?? '').trim();
            const key = name.toLowerCase();
            if (!name || seen.has(key)) continue;
            seen.add(key);
            uniquePlatforms.push(name);

            const pid = Number((p as any)?.platform_id);
            if (isFinite(pid)) uniquePlatformIds.push(pid);
          }

          this.connectedPlatformNames = uniquePlatforms;
          this.connectedPlatformIdsCsv = Array.from(new Set(uniquePlatformIds))
            .filter((n) => isFinite(n))
            .map((n) => String(n))
            .join(',');
          this.connectedSocialPlatforms = uniquePlatforms.map((name) => ({
            name,
            icon: this.getSocialPlatformIcon(name),
          }));

          this.updateSharingOnPreview();
          try { this.cdr.detectChanges(); } catch (e) { }
        },
        error: () => {
          this.connectedPlatformNames = [];
          this.connectedSocialPlatforms = [];
          this.connectedPlatformIdsCsv = '';
          this.updateSharingOnPreview();
          try { this.cdr.detectChanges(); } catch (e) { }
        },
      });
    } catch (e) {
      this.connectedPlatformNames = [];
      this.connectedSocialPlatforms = [];
      this.connectedPlatformIdsCsv = '';
    }
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
    } catch (e) {}
  }

  private async uploadIntervalPublishImages(): Promise<any[] | null> {
    try {
      const imgs = Array.isArray(this.generatedCampaignImages) ? this.generatedCampaignImages : [];
      const urls = imgs.map((x: any) => String(x?.url ?? '')).filter(Boolean).slice(0, 3);
      if (!urls.length) return null;

      const files: File[] = [];
      for (let i = 0; i < urls.length; i++) {
        const f = await this.urlToFile(urls[i], `campaign-interval-${i + 1}`);
        if (!f) return null;
        files.push(f);
      }

      const res: any = await this.apiService.uploadFiles(files);
      const uploaded = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.Data) ? res.Data : []);
      return Array.isArray(uploaded) ? uploaded : [];
    } catch (e) {
      return null;
    }
  }

  private buildIntervalImagesObject(uploaded: any[], fallbackPrompt: string): any {
    const out: any = {};
    const imgs = Array.isArray(this.generatedCampaignImages) ? this.generatedCampaignImages : [];
    const max = Math.min(3, imgs.length, Array.isArray(uploaded) ? uploaded.length : 0);

    for (let i = 0; i < max; i++) {
      const key = `image${i + 1}`;
      const mediaKey = String(uploaded[i]?.media_url ?? uploaded[i]?.mediaUrl ?? uploaded[i]?.key ?? uploaded[i]?.url ?? '').trim();
      if (!mediaKey) continue;
      out[key] = {
        media_key: mediaKey,
        media_type: 'image',
        prompt: String(fallbackPrompt ?? '').trim(),
      };
    }
    return out;
  }

  private publishIntervalCampaign() {
    if (this.isLoading) return;

    const campaignName = String(this.campaignForm.get('name')?.value ?? '').trim();
    const postType = String(this.campaignForm.get('postType')?.value ?? '').trim();
    const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();
    const products = this.buildProductsArrayForPublish();
    const intervalType = String(this.campaignForm.get('intervalType')?.value ?? '').trim();
    const startDateVal = this.campaignForm.get('startDate')?.value;
    const endDateVal = this.campaignForm.get('endDate')?.value;
    const timeVal = this.campaignForm.get('publicationTime')?.value;
    const content = htmlToSocialText(this.campaignForm.get('campaignDescription')?.value ?? '');

    const startDt = this.toJsDate(startDateVal);
    const endDt = this.toJsDate(endDateVal);
    const scheduledTimeUtc = this.formatScheduledUtcTimeForInterval(startDt, timeVal);

    const missing: string[] = [];
    if (!campaignName) missing.push('Please enter Campaign Name.');
    if (!postType) missing.push('Please select Post type.');
    if (!products || products.length === 0) missing.push('Please select Product(s) with at least one image selected.');
    if (!prompt) missing.push('Please enter Prompt.');
    if (!intervalType) missing.push('Please select Interval Type.');
    if (!startDt) missing.push('Please select Start Date.');
    if (!scheduledTimeUtc) missing.push('Please select Campaign Time.');
    if (!this.connectedPlatformIdsCsv) missing.push('No connected platforms found.');
    if (!Array.isArray(this.generatedCampaignImages) || this.generatedCampaignImages.length === 0) {
      missing.push('Please generate at least one campaign image before publishing.');
    }

    if (startDt && endDt && intervalType) {
      const v = validateEndDate(startDt, endDt, intervalType);
      if (!v.valid) missing.push(v.error || 'Invalid date range for selected interval');
    }

    if (missing.length) {
      this.showValidationDialog(missing);
      return;
    }

    this.isLoading = true;
    try { this.cdr.detectChanges(); } catch (e) { }

    (async () => {
      try {
        const uploaded = await this.uploadIntervalPublishImages();
        if (!uploaded || !uploaded.length) {
          try { this.toastr.error('Failed to upload images'); } catch (e) { }
          this.isLoading = false;
          try { this.cdr.detectChanges(); } catch (e) { }
          return;
        }

        const payload: any = {
          campaign_name: campaignName,
          post_type: postType,
          start_date: this.formatDateForApi(startDt),
          end_date: endDt ? this.formatDateForApi(endDt) : null,
          prompt,
          scheduled_time: scheduledTimeUtc,
          interval_type: intervalType,
          content,
          product: products,
          publication_platform_id: this.connectedPlatformIdsCsv,
          images: this.buildIntervalImagesObject(uploaded, prompt),
        };

        this.campaignsApi.publishIntervalCampaign(payload).subscribe({
          next: () => {
            this.isLoading = false;
            try { this.toastr.success('Interval campaign published successfully'); } catch (e) { }
            try { this.router.navigate(['../'], { relativeTo: this.route }); } catch (e) { this.goBack(); }
            try { this.cdr.detectChanges(); } catch (e) { }
          },
          error: (err: any) => {
            console.error('Interval publish failed', err);
            this.isLoading = false;
            try { this.toastr.error('Failed to publish interval campaign'); } catch (e) { }
            try { this.cdr.detectChanges(); } catch (e) { }
          },
        });
      } catch (e) {
        this.isLoading = false;
        try { this.toastr.error('Failed to publish interval campaign'); } catch (e2) { }
        try { this.cdr.detectChanges(); } catch (e3) { }
      }
    })().finally(() => {});
  }

  onDiscard() {
    try {
      this.selectedAttachments = [];
      this.generatedCampaignImageUrl = null;
      this.generatedPersonalizedImagePrompt = null;
      this.generatedCampaignImages = [];
      this.generatedCampaignSelectedIndex = 0;
      this.purchaseRows = [];
      this.purchaseNameSelection = [];
      this.purchaseWhatsappSelection = [];
      this.purchaseEmailSelection = [];
      this.purchasePdfUrl = null;
    } catch (e) { }
    this.resetForm();
    try { this.cdr.detectChanges(); } catch (e) { }
  }

  onPublish() {
    const campaignType = this.normalizeCampaignType(this.campaignForm.get('type')?.value);
    if (campaignType === 'interval') {
      this.publishIntervalCampaign();
      return;
    }

    this.publishPersonalizedCampaign();
  }

  onProductEdit(event: Event) {
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
            } catch (e) {}
          }

          setTimeout(() => {
            try {
              container.click();
              const focused = container.querySelector('input') as HTMLElement | null;
              if (focused) focused.focus();
            } catch (e) {}
          }, 50);
        }
      }
    } catch (e) {}
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.isLoading) return;

    const campaignType = this.normalizeCampaignType(this.campaignForm.get('type')?.value);
    if (campaignType === 'interval') {
      const prompt = String(this.campaignForm.get('prompt')?.value ?? '').trim();
      const postCategory = String(this.campaignForm.get('postType')?.value ?? '').trim();
      const productIds = this.extractSelectedProductIdsCsv();

      const missing: string[] = [];
      if (!productIds) missing.push('Please select Product(s).');
      if (!postCategory) missing.push('Please select Post type.');
      if (prompt.length < 10) missing.push('Prompt must be at least 10 characters.');
      if (missing.length > 0) {
        this.showValidationDialog(missing);
        return;
      }

      const productsData = this.buildProductsDataFromProductSelections();
      if (!Array.isArray(productsData) || productsData.length === 0) {
        missing.push('Please select Product(s).');
      } else {
        const perProductMessages: string[] = [];
        for (const p of productsData) {
          const imagesArr = Array.isArray(p.images) ? p.images : [];
          if (imagesArr.length === 0) {
            let label = String(p.product_id ?? 'Product');
            try {
              const found = this.findProductInDropdownById(p.product_id);
              label = this.getProductLabelFromItem(found) || String(p.product_id ?? 'Product');
            } catch (e) {
              label = String(p.product_id ?? 'Product');
            }
            perProductMessages.push(
              `Please select one image for the product '${label}'. If no image is available for this product, please select another product to proceed.`
            );
          }
        }

        if (perProductMessages.length) {
          this.showValidationDialog(perProductMessages);
          return;
        }
      }

      const formData = new FormData();
      formData.append('products_data', JSON.stringify(productsData));
      formData.append('prompt', prompt);
      formData.append('post_type', postCategory);

      try {
        const files = Array.isArray(this.selectedAttachments)
          ? this.selectedAttachments.slice(0, this.maxAttachments)
          : [];
        files.forEach((att: any) => {
          const f: File | undefined = att?.file;
          if (f) formData.append('uploaded_images', f, f.name);
        });
      } catch (e) {}

      this.isLoading = true;
      this.cdr.detectChanges();
      this.campaignsApi.generateIntervalCampaign(formData).subscribe({
        next: (res: any) => {
          try {
            const content = String(res?.content ?? '').trim();
            if (content) {
              const html = formatGeneratedContentToHtml(content);
              try { this.campaignForm.get('campaignDescription')?.setValue(html, { emitEvent: false }); } catch (e) { }
            }

            const imgs = this.mapGeneratedImagesFromIntervalResponse(res);
            this.generatedCampaignImages = imgs;
            this.generatedCampaignSelectedIndex = 0;
            this.generatedCampaignImageUrl = imgs.length ? (imgs[0]?.url || null) : null;

            if (!this.generatedCampaignImageUrl) {
              try { this.toastr.warning('No image returned from interval generate'); } catch (e) { }
            }
          } catch (e) {}
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Interval generate failed', err);
          this.isLoading = false;
          try { this.toastr.error('Failed to generate interval campaign'); } catch (e) { }
          this.cdr.detectChanges();
        },
      });
      return;
    }

    this.generatePersonalizedCampaign();
  }

  onProductSearch(term: any) {
    const type = String(this.campaignForm.get('type')?.value ?? '').trim().toLowerCase();
    const audience = String(this.campaignForm.get('audience')?.value ?? '').trim().toLowerCase();

    if (type === 'personalised' && audience === 'retail') {
      this.loadRetailCategories(term);
      return;
    }

    this.loadProducts(term);
  }

  private loadRetailCategories(term: any = '') {
    try {
      const searchTerm = (term ?? '').toString();
      this.apiService.Get_Customer_Categories(searchTerm).then(() => {
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
          return;
        }
        body = { productIdList: [id], sendPDF: false };
      } else if (audience === 'retail') {
        const catId = raw ?? null;
        if (!catId) {
          this.purchaseRows = [];
          this.purchasePdfUrl = null;
          return;
        }
        body = { productCategory: Number(catId), sendPDF: true };
      } else {
        this.purchaseRows = [];
        this.purchasePdfUrl = null;
        return;
      }

      this.apiService.Get_Purchase_History(body).subscribe({
        next: (res: any) => {
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
              const email = (this.getCustomerEmailValue(c) ?? '').toLowerCase();
              let key = email;
              if (!key) {
                const id = String(c?.customerId ?? c?.id ?? '').trim();
                const phone = this.getCustomerWhatsappValue(c) ?? '';
                const name = String(c?.customerName ?? c?.name ?? '').trim();
                key = `noemail:${id || phone || name}`;
              }
              if (!key) continue;
              if (seenKeys.has(key)) continue;
              seenKeys.add(key);
              deduped.push(c);
            }

            this.purchaseRows = deduped.filter((c) => this.hasAnyContact(c));
            this.resetPurchaseSelection();
            this.purchasePdfUrl = res?.pdfURL ?? null;
            this.cdr.detectChanges();
          } catch (e) {
            this.purchaseRows = [];
            this.purchaseNameSelection = [];
            this.purchaseWhatsappSelection = [];
            this.purchaseEmailSelection = [];
            this.purchasePdfUrl = null;
          }
        },
        error: (err) => {
          console.error('Failed fetching purchase history', err);
          this.purchaseRows = [];
          this.purchaseNameSelection = [];
          this.purchaseWhatsappSelection = [];
          this.purchaseEmailSelection = [];
          this.purchasePdfUrl = null;
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
    }
  }

  private loadProducts(term: any) {
    const searchTerm = (term ?? '').toString();
    try {
      this.apiService
        .Get_Product_List_By_Search(0, '', '', '', searchTerm, this.productsFilter)
        .subscribe((res: any) => {
          const mapped = Array.isArray(res?.content)
            ? res.content.map((p: any) => {
                const id = p?.id ?? null;
                const code = p?.productCode ?? '';
                const desc = p?.description ?? '';
                const combined = (code ? String(code).trim() + ' - ' : '') + String(desc ?? '').trim();
                return { ...p, id: id, description: combined };
              })
            : [];

          this.productsForDropdown = mapped;
          try {
            for (const p of mapped) {
              const n = Number(p?.id);
              if (isFinite(n) && n > 0) this.productsById.set(n, p);
            }
          } catch (e) { }
          try { this.rebuildProductImagesFromSelection(this.productControl?.value); } catch (e) { }
          this.cdr.detectChanges();
        });
    } catch (e) {
      this.productsForDropdown = [];
    }
  }
}