import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { first, Observable, of } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialPostsDetailsService } from '../service/social-posts-details.service';
import { SocialProfilesApiService, SocialProfileConnection } from '../service/social-profiles-api.service';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { formatGeneratedContentToHtml, htmlToSocialText } from 'src/app/helpers/content-utils';
import { APPCOMMONHELPERS } from 'src/app/helpers/appcommonhelpers';
import { TimePickerComponent } from '../../../../shared/widgets/time-picker/time-picker.component';
import { DadyinSelectComponent } from '../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { MatIcon } from '@angular/material/icon';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DadyinSearchSelectNewComponent } from '../../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinInputComponent } from '../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { SpinnerOverlayComponent } from '../../../../shared/component/spinner-overlay/spinner-overlay.component';
import { NgClass, NgTemplateOutlet, TitleCasePipe, DatePipe } from '@angular/common';

type ProductImageTile = {
    productId: any;
    productLabel: string;
    fileName: string;
    url: string;
    imageIndex: number;
    imageTotal: number;
};

@Component({
    selector: 'app-social-post-detail',
    templateUrl: './social-post-detail.component.html',
    styleUrls: ['./social-post-detail.component.scss'],
    imports: [SpinnerOverlayComponent, NgClass, ExtendedModule, DadyinButtonComponent, MatTabGroup, MatTab, MatTabLabel, MatTabContent, FormsModule, ReactiveFormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, DadyinInputComponent, MatTooltip, DadyinSearchSelectNewComponent, CKEditorModule, MatIcon, DadyinSelectComponent, TimePickerComponent, NgTemplateOutlet, TitleCasePipe, DatePipe]
})
export class SocialPostDetailComponent implements OnInit, OnDestroy {
    public Editor = ClassicEditor;
    public editorConfig = {
        toolbar: [
            'bulletedList', 'numberedList', '|', 'undo', 'redo'
        ]
    };
    @ViewChild('generatedImagesFileInput') generatedImagesFileInputRef!: ElementRef<HTMLInputElement>;
    postForm: UntypedFormGroup;
    isLoading = false;
    postDetails: any = null;
    isApproved: boolean = false;
    isRejected: boolean = false;
    isPublished: boolean = false;
    isScheduled: boolean = false;
    isDraft: boolean = false;
    generatedResults: any[] = [];
    selectedPrompt: string = '';
    selectedIndicesMap: { [key: string]: Set<number> } = {};
    maxGeneratedImages = 10;
    finalPostViewIndex: number = 0;
    socialTabs: string[] = ['All'];
    selectedTabIndex: number = 0;
    publicationPlatformsWithIcons: Array<{ name: string; icon: string }> = [];
    finalDescriptionHtml: SafeHtml = '';
    platformContentsMap: { [key: string]: any[] } = {};
    platformContentsTextMap: { [key: string]: string } = {};
    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
    @ViewChild('publicationTimePickerInput') publicationTimePickerInputRef!: ElementRef<HTMLInputElement>;
    selectedAttachments: Array<{ file: File; url: string; name: string }> = [];
    hoveredImageUrl: string | null = null;
    maxAttachments = 3;
    allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    maxProductSelection = 3;
    productImageBaseUrl: string = environment?.imgUrl || '';
    productImagesForDisplay: ProductImageTile[] = [];
    productImagesPageIndex: number = 0;
    productImagesPageSize: number = 4;
    private selectedProductImageKeys = new Set<string>();
    productsForDropdown: any[] = [];
    private platformConnectionsMap = new Map<string, number>();

    get productControl() {
        return this.postForm.get('product');
    }

    get productSelectionCount(): number {
        try {
            const v = this.postForm.get('product')?.value;
            if (v == null || v === '') return 0;
            if (Array.isArray(v)) return v.length;
            return 0;
        } catch (e) {
            return 0;
        }
    }

    get selectedProductImagesCount(): number {
        try { return this.selectedProductImageKeys.size; } catch (e) { return 0; }
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
        try { this.productImagesPageIndex = Math.max(0, this.productImagesPageIndex - 1); } catch (e) { }
    }

    nextProductImagesPage() {
        try {
            if (!this.canNextProductImagesPage) return;
            this.productImagesPageIndex = this.productImagesPageIndex + 1;
        } catch (e) { }
    }

    private makeProductImageKey(img: ProductImageTile): string {
        return `${String(img?.productId ?? '')}::${String(img?.fileName ?? '')}`;
    }

    private buildProductImageUrl(fileNameOrUrl: any): string {
        const v = fileNameOrUrl == null ? '' : String(fileNameOrUrl).trim();
        if (!v) return '';
        if (/^https?:\/\//i.test(v)) return v;
        const base = String(this.productImageBaseUrl || '').replace(/\/+$/g, '');
        if (!base) return v;
        return `${base}/${v.replace(/^\/+/, '')}`;
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
            if (this.isRejected || this.isPublished) return;
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
                try { this.toastr.info('Select product(s) first to choose images'); } catch (e) { }
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
        } catch (e) { }
    }

    private normalizeLinkValue(value: any): string {
        const v = value == null ? '' : String(value).trim();
        return v;
    }

    private findProductInDropdownById(id: any): any | null {
        const needle = id == null ? '' : String(id).trim();
        if (!needle) return null;
        const list = Array.isArray(this.productsForDropdown) ? this.productsForDropdown : [];
        return (
            list.find((p: any) => String(p?.id ?? p?.productId ?? p?.product_id ?? '').trim() === needle) || null
        );
    }
    private getProductLabelFromItem(item: any): string {
        try {
            if (typeof item === 'string' || typeof item === 'number') {
                const found = this.findProductInDropdownById(item);
                if (found) item = found;
            }
            const lbl = APPCOMMONHELPERS.getProductLabel(item);
            return lbl || '';
        } catch (e) {
            return '';
        }
    }

    private rebuildProductImagesFromPostDetails() {
        try {
            const prodArr = Array.isArray(this.postDetails?.product) ? this.postDetails.product : [];
            const tiles: ProductImageTile[] = [];

            for (const p of prodArr) {
                const productId = p?.product_id ?? p?.productId ?? p?.id ?? null;
                const productLabel = this.getProductLabelFromItem(p);
                const images = Array.isArray(p?.product_images) ? p.product_images : (Array.isArray(p?.productImages) ? p.productImages : []);

                const total = images.length;
                for (let i = 0; i < total; i++) {
                    const fileName = String(images[i] ?? '').trim();
                    if (!fileName) continue;
                    tiles.push({
                        productId,
                        productLabel,
                        fileName,
                        url: this.buildProductImageUrl(fileName),
                        imageIndex: i + 1,
                        imageTotal: total,
                    });
                }
            }

            this.productImagesForDisplay = tiles;
            this.productImagesPageIndex = 0;
            this.selectedProductImageKeys = new Set<string>();
            this.cdr.detectChanges();
        } catch (e) { }
    }
    goesLiveOptions = [
        { label: 'Now', value: 'now' },
        { label: 'Schedule Later', value: 'later' }
    ];
    private postDescriptionSubscribed = false;
    private ckEditorInstance: any = null;
    showTimePicker: boolean = false;
    private formChangesSub: any = null;
    private platformInitialSnapshot: { [tab: string]: string } = {};
    saveEnabledMap: { [tab: string]: boolean } = {};
    private pendingEditorValue: string | null = null;
    private initialAllPostName: string | null = null;
    private initialAllPostDescription: string | null = null;
    private initialScheduledTime: string | null = null;
    private initialGoesLive: string | null = null;
    private isSwitchingTabs: boolean = false;
    minPublicationDate: Date = (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    })();

    private publicationDateTimeSub: any = null;
    private publicationTimeSub: any = null;
    automateTooltip: string = '';

    // Tracks newly added manual images per tab (not from API response)
    newManualImagesByTab: { [tab: string]: Array<{ dataUrl: string; file: File }> } = {};
    // Snapshot of selectedIndicesMap at bind time (to detect selection changes)
    private initialSelectedIndicesSnapshot: { [tab: string]: string } = {};

    private showValidationDialog(messages: string[] | string, heading: string = 'Alert') {
        try {
            const content = Array.isArray(messages) ? messages.join('<br/>') : String(messages || '');
            if (!content) return;
            this.commonService.showAlertDialog({
                heading,
                content,
                showCancel: false,
                actionBtnName: 'Ok'
            });
        } catch (e) {}
    }

    private validatePublishRequiredFields(platformIds: string): boolean {
        const missing: string[] = [];
        if (!platformIds || String(platformIds).trim().length === 0) {
            missing.push('Please select at least one publication platform');
        }

        try {
            const goesLive = String(this.postForm.get('goesLive')?.value || 'now').toLowerCase();
            if (goesLive !== 'now') {
                const scheduledDt = this.getScheduledDateTimeForPublish();
                if (!scheduledDt) {
                    const dateVal = this.postForm.get('publicationDateTime')?.value;
                    const timeVal = this.postForm.get('publicationTime')?.value;
                    if (!dateVal) missing.push('Please select Publication Date');
                    if (!timeVal) missing.push('Please select Publication Time');
                    if (dateVal && timeVal) missing.push('Please select both Publication Date and Time');
                    try { this.postForm.get('publicationDateTime')?.markAsTouched(); } catch (e) { }
                    try { this.postForm.get('publicationTime')?.markAsTouched(); } catch (e) { }
                }
            }
        } catch (e) { }

        if (missing.length > 0) {
            this.showValidationDialog(missing);
            return false;
        }

        return true;
    }

    get platformsForDisplay(): any[] {
        try {
            const raw = this.postForm.getRawValue() as any;
            return Array.isArray(raw?.platforms) ? raw.platforms : [];
        } catch (e) {
            return [];
        }
    }

    get platformsSelectedForDisplay(): any[] {
        try {
            const raw = this.postForm.getRawValue() as any;
            return Array.isArray(raw?.platformsSelected) ? raw.platformsSelected : [];
        } catch (e) {
            return [];
        }
    }

    constructor(
        private fb: UntypedFormBuilder,
        private route: ActivatedRoute,
        private detailsService: SocialPostsDetailsService,
        private socialProfilesApi: SocialProfilesApiService,
        private apiService: ApiService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        public toastr: ToastrService,
        private commonService: CommonService
    ) {
        this.postForm = this.fb.group({
            postName: [''],
            postCategory: [''],
            product: [[]],
            creationType: [''],
            productLink: [''],
            postDescription: [''],
            platforms: [[]],
            platformsSelected: [[]],
            publicationDateTime: [this.formatDateForInput(this.minPublicationDate)],
            publicationTime: [''],
            goesLive: ['now'],
            goalLine: ['']
        });

            this.automateTooltip =
                'Automated posts run on a schedule without manual publishing. To use automation, choose scheduling options and ensure the post content and platforms are configured correctly.';

        this.ensureAlwaysDisabledFields();
        this.setupGoesLiveBehavior();

    }

    openTimePicker() {
        try {
            if (this.isRejected || this.isPublished) return;
            const goesLive = String(this.postForm.get('goesLive')?.value || '').toLowerCase();
            if (goesLive === 'now') return;
            if (this.postForm.get('publicationTime')?.disabled) return;

            const input = this.publicationTimePickerInputRef?.nativeElement;
            if (!input) return;
            try { input.click(); } catch (e) { }
            try { input.focus(); } catch (e) { }
        } catch (e) { }
    }

    onPublicationTimeClick() {
        try {
            if (this.isRejected || this.isPublished) return;
            const goesLiveCtl = this.postForm.get('goesLive');
            if (goesLiveCtl && String(goesLiveCtl.value || '').toLowerCase() === 'now') {
                goesLiveCtl.setValue('later', { emitEvent: true });
            }
        } catch (e) { }
    }

    private setupGoesLiveBehavior() {
        try {
            const ctl = this.postForm.get('goesLive');
            if (!ctl) return;
            if (ctl.value == null || String(ctl.value || '').trim() === '') {
                try { ctl.setValue('now', { emitEvent: false }); } catch (e) { }
            }
            this.applyGoesLiveLogic(ctl.value);
            try { ctl.valueChanges.pipe(distinctUntilChanged()).subscribe(v => this.applyGoesLiveLogic(v)); } catch (e) { }
        } catch (e) { }
    }

    private applyGoesLiveLogic(v: any) {
    try {
        const isNow = String(v || '').toLowerCase() === 'now';
        const dtCtl = this.postForm.get('publicationDateTime');
        const timeCtl = this.postForm.get('publicationTime');
        try {
            if (dtCtl && (dtCtl.value == null || String(dtCtl.value || '').trim() === '')) {
                dtCtl.patchValue(this.formatDateForInput(this.minPublicationDate), { emitEvent: false });
            }
        } catch (e) { }

        const allowTimeEdit = this.isApproved || this.isScheduled || this.isDraft;

        if (isNow && !allowTimeEdit) {
            try { dtCtl?.disable({ emitEvent: false }); } catch (e) { }
            try { timeCtl?.disable({ emitEvent: false }); } catch (e) { }
        } else {
            try { dtCtl?.enable({ emitEvent: false }); } catch (e) { }
            try { timeCtl?.enable({ emitEvent: false }); } catch (e) { }
        }
    } catch (e) { }
    try { this.cdr.detectChanges(); } catch (e) { }
}



    computeSanitizedHtml(desc: any): SafeHtml {
        const value = desc || '';
            if (!value) return this.sanitizer.bypassSecurityTrustHtml('');
        const asStr = String(value);
        const containsHtml = /<[^>]+>/.test(asStr);
        if (containsHtml) {
            return this.sanitizer.bypassSecurityTrustHtml(asStr);
        }
            const html = formatGeneratedContentToHtml(asStr);
            return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private toJsDate(value: any): Date | null {
        if (!value) return null;
        if (value instanceof Date) return new Date(value.getTime());
        if (value && typeof value.toDate === 'function') {
            try { return value.toDate(); } catch (e) { }
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            const m = trimmed.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
            if (m) {
                const y = parseInt(m[1], 10);
                const mon = parseInt(m[2], 10);
                const d = parseInt(m[3], 10);
                if (!isNaN(y) && !isNaN(mon) && !isNaN(d)) {
                    return new Date(y, mon - 1, d, 0, 0, 0, 0);
                }
            }
            const dt = new Date(trimmed);
            if (!isNaN(dt.getTime())) return dt;
        }
        return null;
    }

    private formatTime12(date: Date | null): string {
        if (!date) return '';
        try {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const mm = String(minutes).padStart(2, '0');
            return `${hours}:${mm} ${ampm}`;
        } catch (e) {
            return '';
        }
    }

    private parseTimeToHoursMinutes(time: any): { hours: number; minutes: number } | null {
        if (time == null) return null;
        const raw = String(time).trim();
        if (!raw) return null;

        const m = raw.match(/^(\d{1,2})\s*:\s*(\d{2})(?:\s*([aApP][mM]))?$/);
        if (!m) return null;
        let hours = parseInt(m[1], 10);
        const minutes = parseInt(m[2], 10);
        if (isNaN(hours) || isNaN(minutes)) return null;
        if (minutes < 0 || minutes > 59) return null;

        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm) {
            if (hours < 1 || hours > 12) return null;
            if (ampm === 'PM' && hours !== 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
        } else {
            if (hours < 0 || hours > 23) return null;
        }
        return { hours, minutes };
    }

    private setTimePortion(baseDate: Date, timeStr: any): Date {
        const next = new Date(baseDate.getTime());
        const parsed = this.parseTimeToHoursMinutes(timeStr);
        if (!parsed) return next;
        next.setHours(parsed.hours, parsed.minutes, 0, 0);
        return next;
    }

    private setupPublicationDateTimeSync() {
        try {
            if (this.publicationDateTimeSub && typeof this.publicationDateTimeSub.unsubscribe === 'function') {
                this.publicationDateTimeSub.unsubscribe();
            }
            if (this.publicationTimeSub && typeof this.publicationTimeSub.unsubscribe === 'function') {
                this.publicationTimeSub.unsubscribe();
            }
        } catch (e) { }

        const dtCtl = this.postForm.get('publicationDateTime');
        const timeCtl = this.postForm.get('publicationTime');
        if (!dtCtl || !timeCtl) return;

        this.publicationDateTimeSub = dtCtl.valueChanges.pipe(debounceTime(0)).subscribe((v: any) => {
            try {
                const picked = this.toJsDate(v);
                if (!picked) return;
                const currentTime = timeCtl.value || this.formatTime12(picked);
                const combined = this.setTimePortion(picked, currentTime);
                dtCtl.setValue(this.formatDateForInput(combined), { emitEvent: false });
                if (!timeCtl.value) {
                    timeCtl.setValue(this.formatTime12(combined), { emitEvent: false });
                }
                this.cdr.detectChanges();
            } catch (e) { }
        });

        this.publicationTimeSub = timeCtl.valueChanges.pipe(debounceTime(0), distinctUntilChanged()).subscribe((t: any) => {
            try {
                const cur = this.toJsDate(dtCtl.value) || new Date();
                const combined = this.setTimePortion(cur, t);
                dtCtl.setValue(this.formatDateForInput(combined), { emitEvent: false });

                const goesLiveCtl = this.postForm.get('goesLive');
                if (goesLiveCtl && String(goesLiveCtl.value || '').toLowerCase() === 'now') {
                    goesLiveCtl.setValue('later', { emitEvent: true });
                }

                this.cdr.detectChanges();
            } catch (e) { }
        });
    }

    private formatDateForInput(d: Date | null): string | null {
        try {
            if (!d) return null;
            const dt = new Date(d.getTime());
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        } catch (e) {
            return null;
        }
    }
    
    get isAutomateCreation(): boolean {
        try {
            return String(this.postForm.get('creationType')?.value ?? '').trim().toLowerCase() === 'automate';
        } catch (e) {
            return false;
        }
    }

    getStatusChipClass(status: string | null | undefined): string {
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'draft':
                return 'chip-draft';
            case 'published':
            case 'active':
                return 'chip-published';
            case 'approved':
                return 'chip-approved';
            case 'rejected':
            case 'inactive':
                return 'chip-rejected';
            case 'scheduled':
                return 'chip-scheduled';
            default:
                return 'chip-default';
        }
    }

    get uniquePlatformsForDisplay(): string[] {
        try {
            const arr = Array.isArray(this.platformsForDisplay) ? this.platformsForDisplay : [];
            return Array.from(new Set(arr.map((p: any) => (p || '').toString()))).filter(s => s);
        } catch (e) {
            return [];
        }
    }
    onEditorReady(editorInstance: any) {
        this.ckEditorInstance = editorInstance;
        try {
            const val = this.pendingEditorValue !== null
                ? this.pendingEditorValue
                : (this.postForm.get('postDescription')?.value ?? '');
            this.pendingEditorValue = null;
            this.syncEditorWithValue(val);
        } catch (e) {}
    }

    private syncEditorWithValue(value: any) {
        const ed = this.ckEditorInstance;
        if (!ed || typeof ed.setData !== 'function') return;
        try {
            ed.setData(value == null ? '' : String(value));
        } catch (e) {}
    }

    private ensureAlwaysDisabledFields() {
        try {
            this.postForm.get('postCategory')?.disable({ emitEvent: false });
            this.postForm.get('product')?.disable({ emitEvent: false });
            this.postForm.get('creationType')?.disable({ emitEvent: false });
            this.postForm.get('productLink')?.disable({ emitEvent: false });
        } catch (e) {}
    }

    openFilePicker() {
        if (this.isRejected || this.isPublished) return;
        try {
            if (this.fileInputRef && this.fileInputRef.nativeElement) {
                try { this.fileInputRef.nativeElement.click(); return; } catch (e) { }
            }
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = this.allowedImageTypes.join(',');
            input.multiple = true;
            input.addEventListener('change', (ev: any) => {
                try {
                    const files = ev?.target?.files as FileList;
                    if (files && files.length) {
                        this.addSelectedFiles(files);
                    }
                } catch (e) { }
            });
            input.click();
        } catch (e) { }
    }

    onFilesSelected(event: any) {
        try {
            const files = event?.target?.files as FileList;
            if (!files || files.length === 0) return;
            this.addSelectedFiles(files);
            try { event.target.value = ''; } catch (e) { }
        } catch (e) { }
    }

    private addSelectedFiles(files: FileList) {
        if (!files) return;
        for (let i = 0; i < files.length; i++) {
            if (this.selectedAttachments.length >= this.maxAttachments) {
                window.alert(`You can select up to ${this.maxAttachments} images.`);
                break;
            }
            const f = files.item(i);
            if (!f) continue;
            if (this.allowedImageTypes.indexOf(f.type.toLowerCase()) === -1) {
                window.alert('Only image files (jpg, jpeg, png, webp) are allowed.');
                continue;
            }
            try {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    try {
                        const dataUrl = e?.target?.result as string;
                        if (this.selectedAttachments.length >= this.maxAttachments) return;
                        this.selectedAttachments.push({ file: f, url: dataUrl, name: f.name });
                        this.cdr.detectChanges();
                    } catch (e) { }
                };
                reader.readAsDataURL(f);
            } catch (e) { }
        }
    }

    removeAttachment(index: number) {
        try {
            const att = this.selectedAttachments[index];
            if (att && att.url) {
                try {
                    if (typeof att.url === 'string' && att.url.startsWith && att.url.startsWith('blob:')) {
                        URL.revokeObjectURL(att.url);
                    }
                } catch (e) { }
            }
            this.selectedAttachments.splice(index, 1);
        } catch (e) { }
        this.cdr.detectChanges();
    }

    openGeneratedImagesFilePicker() {
        if (this.isRejected || this.isPublished) return;
        if (!this.canAddMoreGeneratedImages) return;
        try {
            if (this.generatedImagesFileInputRef && this.generatedImagesFileInputRef.nativeElement) {
                this.generatedImagesFileInputRef.nativeElement.value = '';
                this.generatedImagesFileInputRef.nativeElement.click();
            }
        } catch (e) { }
    }

    onGeneratedImagesSelected(event: any) {
        try {
            const files = event?.target?.files;
            if (files && files.length > 0) {
                this.addManualImagesToGenerated(files);
            }
        } catch (e) { }
    }

    private addManualImagesToGenerated(files: FileList) {
        try {
            const tabLabel = this.currentTabLabel;
            const currentImages = this.getImagesForTab(tabLabel);
            const availableSlots = this.maxGeneratedImages - currentImages.length;
            if (availableSlots <= 0) {
                return;
            }
            const toAdd = Math.min(files.length, availableSlots);
            const readers: Array<{ reader: FileReader; file: File; index: number }> = [];
            for (let i = 0; i < toAdd; i++) {
                const file = files[i];
                if (!this.allowedImageTypes.includes(file.type)) {
                    continue;
                }
                const reader = new FileReader();
                readers.push({ reader, file, index: i });
                reader.onload = (e: any) => {
                    const dataUrl = e.target?.result;
                    if (dataUrl) {
                        const newImage = {
                            image: dataUrl,
                            prompt: 'Manually Uploaded',
                            isManual: true
                        };

                        // Track for upload on save/publish
                        if (!this.newManualImagesByTab[tabLabel]) {
                            this.newManualImagesByTab[tabLabel] = [];
                        }
                        this.newManualImagesByTab[tabLabel].push({ dataUrl, file });
                        
                        if (tabLabel === 'All') {
                            // Add to generatedResults
                            this.generatedResults.push(newImage);
                            const newIndex = this.generatedResults.length - 1;
                            if (!this.selectedIndicesMap['All']) {
                                this.selectedIndicesMap['All'] = new Set();
                            }
                            this.selectedIndicesMap['All'].add(newIndex);
                            this.syncAllTabImagesToOtherTabs();
                            this.syncSelectionToOtherTabs(this.selectedIndicesMap['All']);
                        } else {
                            // Add to specific tab only
                            if (!this.platformContentsMap[tabLabel]) {
                                this.platformContentsMap[tabLabel] = [];
                            }
                            this.platformContentsMap[tabLabel].push(newImage);
                            const newIndex = this.platformContentsMap[tabLabel].length - 1;
                            
                            // Add to this tab's selection
                            if (!this.selectedIndicesMap[tabLabel]) {
                                this.selectedIndicesMap[tabLabel] = new Set();
                            }
                            this.selectedIndicesMap[tabLabel].add(newIndex);
                        }
                        this.cdr.detectChanges();
                    }
                };
                reader.readAsDataURL(file);
            }
        } catch (e) { }
    }

    isGeneratedResultSelected(index: number): boolean {
        return this.currentTabSelectedIndices.has(index);
    }

    showImagePreview(imageUrl: string) {
        this.hoveredImageUrl = imageUrl;
    }

    get canAddMoreGeneratedImages(): boolean {
        return this.getImagesForTab(this.currentTabLabel).length < this.maxGeneratedImages;
    }

    get canShowAddImagesBox(): boolean {
        return (this.isDraft || this.isScheduled || this.isApproved) && this.canAddMoreGeneratedImages;
    }

    get currentTabImages(): any[] {
        const tabLabel = this.socialTabs && this.socialTabs.length > this.selectedTabIndex ? this.socialTabs[this.selectedTabIndex] : 'All';
        if (tabLabel === 'All') {
            return this.generatedResults;
        }
        return this.platformContentsMap[tabLabel] || [];
    }

    get currentTabLabel(): string {
        return this.socialTabs && this.socialTabs.length > this.selectedTabIndex ? this.socialTabs[this.selectedTabIndex] : 'All';
    }

    get currentTabSelectedIndices(): Set<number> {
        const tabLabel = this.currentTabLabel;
        if (!this.selectedIndicesMap[tabLabel]) {
            this.selectedIndicesMap[tabLabel] = new Set();
        }
        return this.selectedIndicesMap[tabLabel];
    }

    goBack() {
        this.router.navigate(['/home/social-broadcast-management/social-posts']);
    }

    navigateToBusinessRegistration() {
        this.router.navigate(['/home/business-registration'], { queryParams: { currentMainIndex: 3 } });
    }

    private splitLinks(raw: any): string[] {
        const s = raw == null ? '' : String(raw);
        if (!s.trim()) return [];
        const parts = s
            .split(/\r?\n|\s*,\s*/g)
            .map((x) => String(x || '').trim())
            .filter(Boolean);
        const seen = new Set<string>();
        const out: string[] = [];
        for (const p of parts) {
            const key = p.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(p);
        }
        return out;
    }

    get productLinksForDisplay(): string[] {
        try {
            const prodArr = (this.postDetails as any)?.product;
            if (Array.isArray(prodArr) && prodArr.length) {
                const links = prodArr.map((p: any) => {
                    const link = String(p?.product_link ?? p?.productLink ?? '').trim();
                    return link || 'N/A';
                });
                return links;
            }

            const arr = (this.postDetails as any)?.productLinks;
            if (Array.isArray(arr)) return this.splitLinks(arr.join('\n'));
        } catch (e) { }
        return [];
    }

    copySingleProductLink(link: string) {
        const value = this.normalizeLinkValue(link);
        if (!value) return;
        try {
            if (navigator && navigator.clipboard) {
                navigator.clipboard.writeText(value);
                return;
            }
        } catch (e) { }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } catch (e) { }
    }

    private bindPostDetails(data: any, preferredTabLabel: string = 'All') {
        const normalized: any = data || {};
        try {
            if (normalized.post_name != null && normalized.postName == null) normalized.postName = normalized.post_name;
            if (normalized.post_category != null && normalized.postCategory == null) normalized.postCategory = normalized.post_category;
            if (normalized.post_type != null && normalized.postType == null) normalized.postType = normalized.post_type;
            if (normalized.publication_date != null && normalized.publicationDate == null) normalized.publicationDate = normalized.publication_date;
            if (normalized.publication_platforms != null && normalized.publishAccounts == null) normalized.publishAccounts = normalized.publication_platforms;
            if (normalized.platform_contents != null && normalized.platformContents == null) normalized.platformContents = normalized.platform_contents;

            if (Array.isArray(normalized.product)) {
                const prodArr = normalized.product;
                normalized.productNames = prodArr.map((p: any) => {
                    const name = String(p?.product_name ?? p?.productName ?? '').trim();
                    return name || 'N/A';
                });
                normalized.productLinks = prodArr.map((p: any) => {
                    const link = String(p?.product_link ?? p?.productLink ?? '').trim();
                    return link || 'N/A';
                });
                normalized.productIds = prodArr
                    .map((p: any) => p?.product_id ?? p?.productId ?? null)
                    .filter((x: any) => x !== null && x !== undefined);
            }
        } catch (e) { }

        this.postDetails = normalized;

        try { this.rebuildProductImagesFromPostDetails(); } catch (e) { }
        this.generatedResults = (normalized.generatedImages || []).map((img: any) => ({
            image: this.buildProductImageUrl(img.image_key ?? ''),
            alt: img.image_key ?? 'N/A',
            prompt: img.prompt ?? '',
            id: img.id ?? null,
            is_selected: img.is_selected ?? true,
            isManual: false
        }));

        // Reset new manual images tracking on each bind
        this.newManualImagesByTab = {};
        this.initialSelectedIndicesSnapshot = {};

        const pcs = normalized.platformContents || [];
        this.platformContentsMap = {};
        this.platformContentsTextMap = {};
        if (Array.isArray(pcs) && pcs.length > 0) {
            pcs.forEach((pc: any) => {
                const tabKey = pc.platform_name ? this.platformLabel(pc.platform_name) : 'All';
                const imgs = Array.isArray(pc.images) ? pc.images.map((img: any) => ({
                    image: this.buildProductImageUrl(img.image_key ?? ''),
                    alt: img.image_key ?? 'N/A',
                    prompt: img.prompt ?? '',
                    id: img.id ?? null,
                    is_selected: img.is_selected ?? true,
                    isManual: false
                })) : [];
                this.platformContentsMap[tabKey] = imgs;
                try { 
                    const formattedContent = formatGeneratedContentToHtml(pc.content ?? '');
                    this.platformContentsTextMap[tabKey] = formattedContent;
                } catch (e) { 
                    this.platformContentsTextMap[tabKey] = String(pc.content ?? '');
                }
            });
        }

        const pcsArr = Array.isArray(pcs) ? pcs : [];
        const primaryPc = pcsArr.find((p: any) => !p.platform_name) || pcsArr[0] || null;
        const firstContentRaw = primaryPc
            ? (primaryPc.content ?? '')
            : (Array.isArray(normalized.contents) && normalized.contents.length > 0 ? normalized.contents[0].content : '');
        const firstContent = formatGeneratedContentToHtml(firstContentRaw);

        const platformsArr = Array.isArray(normalized.publishAccounts) ? Array.from(new Set(normalized.publishAccounts)) : [];

        const statusValInitial = String(normalized.status || normalized.stage || '').toLowerCase();
        const serverGoesLive = (normalized && (normalized.goesLive === 'now' || normalized.goesLive === 'later')) ? normalized.goesLive : (statusValInitial === 'scheduled' ? 'later' : 'now');

        const productLinks = Array.isArray(normalized?.productLinks) ? normalized.productLinks : [];
        const productArr = Array.isArray(normalized?.product) ? normalized.product : [];
        this.productsForDropdown = productArr.map((p: any) => ({
            id: p?.product_id ?? p?.productId ?? null,
            description: String(p?.product_name ?? p?.productName ?? '').trim() || 'N/A'
        }));
        
        const productIds = productArr
            .map((p: any) => p?.product_id ?? p?.productId ?? null)
            .filter((id: any) => id !== null && id !== undefined);
        
        this.postForm.patchValue({
            postName: normalized.postName ?? 'N/A',
            postCategory: normalized.postCategory ?? 'N/A',
            product: productIds,
            creationType: normalized.postType ?? 'N/A',
            productLink: productLinks.length ? productLinks.join('\n') : 'N/A',
            goesLive: serverGoesLive,
            goalLine: 'N/A'
        }, { emitEvent: false });

        try {
            const pubDt = this.toJsDate(normalized.publicationDate);
            if (pubDt) {
                this.postForm.get('publicationDateTime')?.setValue(this.formatDateForInput(pubDt), { emitEvent: false });
                this.postForm.get('publicationTime')?.setValue(this.formatTime12(pubDt), { emitEvent: false });
            } else {
                this.postForm.get('publicationDateTime')?.setValue(this.formatDateForInput(this.minPublicationDate), { emitEvent: false });
            }
        } catch (e) { }

        const statusVal = String(normalized.status || normalized.stage || '').toLowerCase();
        this.isApproved = statusVal === 'approved';
        this.isRejected = statusVal === 'rejected';
        this.isPublished = statusVal === 'published';
        this.isDraft = statusVal === 'draft';
        this.isScheduled = statusVal === 'scheduled';
        const isDraftStatus = this.isDraft;

        if (isDraftStatus) {
            // For draft posts, fetch connected social profiles
            this.socialProfilesApi.getSocialProfiles().subscribe({
                next: (profiles: SocialProfileConnection[]) => {
                    const connected = (profiles || []).filter((p: any) => {
                        const status = `${p?.connection_status ?? ''}`.toLowerCase();
                        const hasStatusKey = Object.prototype.hasOwnProperty.call(p ?? {}, 'connection_status');
                        return hasStatusKey && status === 'connected' && !!p?.platform_name;
                    });

                    this.platformConnectionsMap.clear();
                    connected.forEach((profile: SocialProfileConnection) => {
                        if (profile.platform_name && profile.platform_id) {
                            this.platformConnectionsMap.set(profile.platform_name.toLowerCase(), profile.platform_id);
                        }
                    });

                    const connectedPlatformNames = connected.map((p: any) => p.platform_name).filter(Boolean);
                    const platformsArrForDraft = Array.from(new Set(connectedPlatformNames));

                    this.postForm.get('platforms')?.setValue(platformsArrForDraft, { emitEvent: false });
                    this.postForm.get('platformsSelected')?.setValue(platformsArrForDraft, { emitEvent: false });

                    if (Array.isArray(this.postDetails?.platformContents)) {
                        this.postDetails.platformContents.forEach((pc: any) => {
                            if (pc.platform_name) {
                                const platformId = this.platformConnectionsMap.get(pc.platform_name.toLowerCase());
                                if (platformId) {
                                    pc.platform_id = platformId;
                                }
                            }
                        });
                    }

                    const platformSetForDraft = platformsArrForDraft;
                    this.publicationPlatformsWithIcons = platformSetForDraft.map(platform => ({
                        name: this.platformLabel(platform as string),
                        icon: this.platformIcon(platform as string)
                    }));

                    this.setupTabsFromPlatformSet(platformSetForDraft as any[], firstContent);

                    const normalizedPreferredForDraft = preferredTabLabel || 'All';
                    const resolvedTabForDraft = this.socialTabs.includes(normalizedPreferredForDraft) ? normalizedPreferredForDraft : 'All';
                    this.selectedTabIndex = Math.max(0, this.socialTabs.indexOf(resolvedTabForDraft));

                    this.initializeTabSelections();
                    this.snapshotInitialSelections();
                    this.finalPostViewIndex = 0;
                    this.selectedPrompt = this.generatedResults.length > 0 ? (this.generatedResults[0]?.prompt || '') : '';

                    const resolvedContentForDraft = this.platformContentsTextMap[resolvedTabForDraft] ?? this.platformContentsTextMap['All'] ?? firstContent;
                    this.postForm.get('postDescription')?.setValue(resolvedContentForDraft, { emitEvent: false });
                    this.finalDescriptionHtml = this.computeSanitizedHtml(resolvedContentForDraft);

                    try {
                        const pcsArrLocal = Array.isArray(this.postDetails?.platformContents) ? this.postDetails.platformContents : [];
                        pcsArrLocal.forEach((pc: any) => {
                            const tabKey = pc.platform_name ? this.platformLabel(pc.platform_name) : 'All';
                            this.platformInitialSnapshot[tabKey] = pc.content ?? '';
                            this.saveEnabledMap[tabKey] = false;
                        });
                        this.fillMissingPlatformSnapshots(platformSetForDraft as any[], firstContent);
                    } catch (e) { }

                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Failed to fetch social profiles for draft:', err);
                    // Fallback to using existing platformsArr
                    this.postForm.get('platforms')?.setValue(platformsArr, { emitEvent: false });
                    this.postForm.get('platformsSelected')?.setValue(platformsArr, { emitEvent: false });
                }
            });
        } else {
            // For non-draft posts, use the existing platform logic
            this.postForm.get('platforms')?.setValue(platformsArr, { emitEvent: false });
            this.postForm.get('platformsSelected')?.setValue(platformsArr, { emitEvent: false });
        }

        try { this.setupPublicationDateTimeSync(); } catch (e) { }

        let platformSet = Array.isArray(data.publishAccounts) ? Array.from(new Set(data.publishAccounts)) : [];
        if (!isDraftStatus) {
            this.publicationPlatformsWithIcons = platformSet.map(platform => ({
                name: this.platformLabel(platform as string),
                icon: this.platformIcon(platform as string)
            }));

            this.setupTabsFromPlatformSet(platformSet as any[], firstContent);

            const normalizedPreferred = preferredTabLabel || 'All';
            const resolvedTab = this.socialTabs.includes(normalizedPreferred) ? normalizedPreferred : 'All';
            this.selectedTabIndex = Math.max(0, this.socialTabs.indexOf(resolvedTab));

            this.initializeTabSelections();
            this.snapshotInitialSelections();
            this.finalPostViewIndex = 0;
            this.selectedPrompt = this.generatedResults.length > 0 ? (this.generatedResults[0]?.prompt || '') : '';

            const resolvedContent = this.platformContentsTextMap[resolvedTab] ?? firstContent;
            this.postForm.get('postDescription')?.setValue(resolvedContent, { emitEvent: false });
            this.finalDescriptionHtml = this.computeSanitizedHtml(resolvedContent);
        } else {
            this.socialTabs = ['All'];
            this.selectedTabIndex = 0;

            this.initializeTabSelections();
            this.snapshotInitialSelections();
            this.finalPostViewIndex = 0;
            this.selectedPrompt = this.generatedResults.length > 0 ? (this.generatedResults[0]?.prompt || '') : '';

            const initialContent = this.platformContentsTextMap['All'] ?? firstContent;
            this.postForm.get('postDescription')?.setValue(initialContent, { emitEvent: false });
            this.finalDescriptionHtml = this.computeSanitizedHtml(initialContent);
        }

        try {
            const pn = this.postForm.get('postName')?.value;
            const pd = this.postForm.get('postDescription')?.value;
            this.initialAllPostName = pn == null ? '' : String(pn);
            this.initialAllPostDescription = pd == null ? '' : String(pd);
            const scheduledDt = this.getScheduledDateTimeForPublish();
            this.initialScheduledTime = scheduledDt ? this.formatScheduledTimeForApi(scheduledDt) : null;
            this.initialGoesLive = this.postForm.get('goesLive')?.value || 'now';
        } catch (e) {
            this.initialAllPostName = null;
            this.initialAllPostDescription = null;
            this.initialScheduledTime = null;
        }


        if (!isDraftStatus) {
            try {
                pcsArr.forEach((pc: any) => {
                    const tabKey = pc.platform_name ? this.platformLabel(pc.platform_name) : 'All';
                    this.platformInitialSnapshot[tabKey] = pc.content ?? '';
                    this.saveEnabledMap[tabKey] = false;
                });
                this.fillMissingPlatformSnapshots(platformSet as any[], firstContent);
            } catch (e) { }
        }

        try {
            if (this.formChangesSub) {
                this.formChangesSub.unsubscribe();
            }
            this.formChangesSub = this.postForm.valueChanges.pipe(debounceTime(250)).subscribe(() => {
                try {
                    const currentTab = this.currentTabLabel;
                    if (currentTab && currentTab !== 'All') {
                        const currentVal = this.postForm.get('postDescription')?.value ?? '';
                        const original = this.platformInitialSnapshot[currentTab] ?? '';
                        this.saveEnabledMap[currentTab] = String(currentVal) !== String(original);
                    }
                } catch (e) { }
                this.cdr.detectChanges();
            });
        } catch (e) {}

        this.ensurePostNameEditableForTab(this.socialTabs[this.selectedTabIndex] || 'All');

        const pdControl = this.postForm.get('postDescription');
        if (!this.postDescriptionSubscribed && pdControl && pdControl.valueChanges) {
            this.postDescriptionSubscribed = true;
            pdControl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe((val: any) => {
                this.finalDescriptionHtml = this.computeSanitizedHtml(val);
                const currentTab = this.currentTabLabel;
                
                if (!this.isSwitchingTabs) {
                    // Always update the current tab's content in platformContentsTextMap
                    this.platformContentsTextMap[currentTab] = val;
                    // Update postDetails.platformContents for the current tab
                    if (this.postDetails && Array.isArray(this.postDetails.platformContents)) {
                        if (currentTab === 'All') {
                            // For All tab, update all platform contents
                            this.postDetails.platformContents.forEach((pc: any) => {
                                pc.content = val;
                            });
                        } else {
                            // For specific platform tab, update only that platform's content
                            const pc = this.postDetails.platformContents.find((p: any) => {
                                const pcLabel = p.platform_name ? this.platformLabel(p.platform_name) : 'All';
                                return pcLabel === currentTab;
                            });
                            if (pc) {
                                pc.content = val;
                            } else {
                                console.log('   Could not find platform content for', currentTab);
                            }
                        }
                    }

                    // If editing in All tab, propagate to other platform tabs
                    if (currentTab === 'All') {
                        Object.keys(this.platformContentsTextMap).forEach(k => {
                            if (k !== 'All') {
                                this.platformContentsTextMap[k] = val;
                            }
                        });
                    }
                } else {
                    console.log('   isSwitchingTabs = true, skipping update');
                }
                this.cdr.detectChanges();
            });
        }

        setTimeout(() => {
            this.cdr.detectChanges();
        });

        try {
            if (this.isRejected || this.isPublished) {
                this.disableFormForReadOnly();
            } else {
                const activeTab = this.socialTabs[this.selectedTabIndex] || 'All';
                try { this.ensureAlwaysDisabledFields(); } catch (e) { }
                try { this.ensurePostNameEditableForTab(activeTab); } catch (e) { }
            }
        } catch (e) { }

        this.isLoading = false;
        try {
            const currentGoesLive = this.postForm.get('goesLive')?.value;
            this.applyGoesLiveLogic(currentGoesLive);
        } catch (e) { }
        setTimeout(() => {
            this.cdr.detectChanges();
        });
    }

    private reloadPostDetails(preferredTabLabel?: string) {
        const id = this.postDetails?.id;
        if (!id) return;
        const tab = preferredTabLabel || (this.socialTabs && this.socialTabs.length > this.selectedTabIndex ? this.socialTabs[this.selectedTabIndex] : 'All');
        this.detailsService.getSocialPostDetails(id).subscribe({
            next: (data: any) => {
                this.bindPostDetails(data, tab);
            },
            error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.error('Failed to refresh post details'); } catch (e) { }
            }
        });
    }

    private disableFormForReadOnly(): void {
        const fields = [
            'postName', 'postCategory', 'product', 'creationType', 'productLink',
            'platforms', 'platformsSelected', 'publicationDateTime', 'publicationTime',
            'goesLive', 'goalLine'
        ];
        fields.forEach(f => {
            try { this.postForm.get(f)?.disable({ emitEvent: false }); } catch (e) { }
        });
    }

    private getImagesForTab(tabLabel: string): any[] {
        return tabLabel === 'All' ? this.generatedResults : (this.platformContentsMap[tabLabel] || []);
    }

    private syncAllTabImagesToOtherTabs(): void {
        this.socialTabs.forEach(tab => {
            if (tab !== 'All') {
                this.platformContentsMap[tab] = [...this.generatedResults];
            }
        });
    }

    private syncSelectionToOtherTabs(selectionSet: Set<number>): void {
        this.socialTabs.forEach(tab => {
            if (tab !== 'All') {
                this.selectedIndicesMap[tab] = new Set(selectionSet);
            }
        });
    }

    private initializeTabSelections(): void {
        const allImgs = this.platformContentsMap['All'] || this.generatedResults;
        this.socialTabs.forEach(tab => {
            const imgs = tab === 'All' ? allImgs : (this.platformContentsMap[tab] || allImgs);
            this.selectedIndicesMap[tab] = new Set();
            for (let i = 0; i < imgs.length; i++) {
                if (imgs[i]?.is_selected !== false) {
                    this.selectedIndicesMap[tab].add(i);
                }
            }
        });
    }

    private snapshotInitialSelections(): void {
        this.socialTabs.forEach(tab => {
            this.initialSelectedIndicesSnapshot[tab] = JSON.stringify(
                Array.from(this.selectedIndicesMap[tab] || []).sort((a, b) => a - b)
            );
        });
    }

    private setupTabsFromPlatformSet(platformSet: any[], fallbackContent: string): void {
        if (platformSet.length > 0) {
            const allImgsForClone = this.platformContentsMap['All'] || [];
            const allTextForClone = this.platformContentsTextMap['All'] ?? fallbackContent;
            platformSet.forEach((p: any) => {
                const tabKey = this.platformLabel(String(p));
                if (tabKey && tabKey !== 'All') {
                    if (this.platformContentsMap[tabKey] === undefined) {
                        this.platformContentsMap[tabKey] = [...allImgsForClone];
                    }
                    if (this.platformContentsTextMap[tabKey] === undefined) {
                        this.platformContentsTextMap[tabKey] = allTextForClone;
                    }
                }
            });
        }
        this.socialTabs = ['All', ...platformSet.map(p => this.platformLabel(String(p)))];
    }

    private fillMissingPlatformSnapshots(platformSet: any[], fallbackContent: string): void {
        if (!platformSet.length) return;
        const fallback = this.platformContentsTextMap['All'] ?? fallbackContent;
        platformSet.forEach((p: any) => {
            const tabKey = this.platformLabel(String(p));
            if (tabKey && tabKey !== 'All') {
                if (this.platformInitialSnapshot[tabKey] === undefined) {
                    this.platformInitialSnapshot[tabKey] = fallback;
                }
                if (this.saveEnabledMap[tabKey] === undefined) {
                    this.saveEnabledMap[tabKey] = false;
                }
            }
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.isLoading = true;
                this.detailsService.getSocialPostDetails(id).subscribe({
                    next: (data) => {
                        this.bindPostDetails(data, 'All');
                    },
                    error: () => {
                        this.isLoading = false;
                        setTimeout(() => {
                            this.cdr.detectChanges();
                        });
                    }
                });
            }
        });
    }

    onPlatformToggle(platform: string, checked: boolean) {
        const selected = this.postForm.value.platformsSelected ? [...this.postForm.value.platformsSelected] : [];
        if (checked) {
            if (!selected.includes(platform)) {
                selected.push(platform);
            }
        } else {
            const idx = selected.indexOf(platform);
            if (idx > -1) {
                selected.splice(idx, 1);
            }
        }
        this.postForm.patchValue({ platformsSelected: selected });
    }

    platformIcon(platform: string): string {
        switch (platform.toLowerCase()) {
            case 'instagram':
                return 'assets/nicons/instagram.png';
            case 'facebook':
                return 'assets/nicons/facebook.png';
            case 'linkedin':
                return 'assets/nicons/linkedin.png';
            default:
                return '';
        }
    }

    platformLabel(platform: string): string {
        switch (platform.toLowerCase()) {
            case 'instagram':
                return 'Instagram';
            case 'facebook':
                return 'Facebook';
            case 'linkedin':
                return 'LinkedIn';
            default:
                return platform;
        }
    }

    get selectedResult() {
        const currentSelection = this.currentTabSelectedIndices;
        if (currentSelection.size === 0) return null;
        const currentImages = this.currentTabImages;
        const selectedArray = Array.from(currentSelection).sort((a, b) => a - b);
        const viewIndex = Math.min(this.finalPostViewIndex, selectedArray.length - 1);
        const actualIndex = selectedArray[viewIndex >= 0 ? viewIndex : 0];
        return currentImages && currentImages[actualIndex]
            ? currentImages[actualIndex]
            : null;
    }
    selectResult(index: number) {
        const tabLabel = this.currentTabLabel;
        const currentSelection = this.currentTabSelectedIndices;
        
        if (currentSelection.has(index)) {
            currentSelection.delete(index);
        } else {
            currentSelection.add(index);
        }
        
        if (tabLabel === 'All') {
            this.syncAllTabImagesToOtherTabs();
            this.syncSelectionToOtherTabs(currentSelection);
        }
        
        this.finalPostViewIndex = 0;
        const item = this.currentTabImages[index];
        this.selectedPrompt = item ? (item.prompt || '') : '';
    }

    get hasMultipleDisplayedResults(): boolean {
        try {
            return this.currentTabSelectedIndices.size > 1;
        } catch (e) {
            return false;
        }
    }

    prevFinalPostImage() {
        try {
            const currentSelection = this.currentTabSelectedIndices;
            if (currentSelection.size <= 1) return;
            this.finalPostViewIndex = this.finalPostViewIndex - 1 < 0 
                ? currentSelection.size - 1 
                : this.finalPostViewIndex - 1;
            this.cdr.detectChanges();
        } catch (e) {}
    }

    nextFinalPostImage() {
        try {
            const currentSelection = this.currentTabSelectedIndices;
            if (currentSelection.size <= 1) return;
            this.finalPostViewIndex = (this.finalPostViewIndex + 1) % currentSelection.size;
            this.cdr.detectChanges();
        } catch (e) {}
    }
    deleteResult(index: number) {
        const tabLabel = this.currentTabLabel;
        const currentImages = this.getImagesForTab(tabLabel);
        
        if (!currentImages || currentImages.length === 0 || index < 0 || index >= currentImages.length) {
            return;
        }
        
        const imageToDelete = currentImages[index];
        const currentSelection = this.currentTabSelectedIndices;
        
        if (imageToDelete && imageToDelete.isManual === true) {
            // Actually remove the image from the array
            currentImages.splice(index, 1);
            
            if (tabLabel === 'All') {
                this.generatedResults = currentImages;
                this.syncAllTabImagesToOtherTabs();
            } else {
                this.platformContentsMap[tabLabel] = currentImages;
            }
            
            // Rebuild selection indices, shifting down any index above the deleted one
            const newSelectedIndices = new Set<number>();
            currentSelection.forEach(i => {
                if (i < index) newSelectedIndices.add(i);
                else if (i > index) newSelectedIndices.add(i - 1);
            });
            this.selectedIndicesMap[tabLabel] = newSelectedIndices;
            
            if (tabLabel === 'All') {
                this.syncSelectionToOtherTabs(newSelectedIndices);
            }
            
            // Ensure at least one image stays selected
            if (newSelectedIndices.size === 0 && currentImages.length > 0) {
                newSelectedIndices.add(0);
                this.selectedIndicesMap[tabLabel] = newSelectedIndices;
                if (tabLabel === 'All') {
                    this.syncSelectionToOtherTabs(newSelectedIndices);
                }
            }
        } else {
            // For API-generated images just deselect
            currentSelection.delete(index);
            
            if (tabLabel === 'All') {
                this.socialTabs.forEach(tab => {
                    if (tab !== 'All' && this.selectedIndicesMap[tab]) {
                        this.selectedIndicesMap[tab].delete(index);
                    }
                });
            }
            
            // Ensure at least one image stays selected
            if (currentSelection.size === 0 && currentImages.length > 0) {
                currentSelection.add(0);
                if (tabLabel === 'All') {
                    this.socialTabs.forEach(tab => {
                        if (tab !== 'All' && this.selectedIndicesMap[tab]) {
                            this.selectedIndicesMap[tab].add(0);
                        }
                    });
                }
            }
        }
        
        this.finalPostViewIndex = 0;
        this.selectedPrompt = currentImages.length > 0 ? (currentImages[0]?.prompt || '') : '';
        this.cdr.detectChanges();
    }
    generate() {
        if (this.isRejected || this.isPublished || this.isLoading) return;
        try {
            const prompt = String(this.selectedPrompt ?? '').trim();
            if (!prompt) {
                this.showValidationDialog(['Please enter a prompt.']);
                return;
            }
        } catch (e) { }

        const tabLabel = this.currentTabLabel;
        if (!this.postDetails || !Array.isArray(this.postDetails.platformContents)) {
            console.warn('No platformContents available to regenerate');
            return;
        }
        const pcs = this.postDetails.platformContents as any[];
        const pc = pcs.find((p: any) => {
            const key = p.platform_name ? this.platformLabel(p.platform_name) : 'All';
            return key === tabLabel;
        }) || null;
        if (!pc) {
            console.warn('No platform content entry found for', tabLabel);
            return;
        }

        const contentId = pc.id ?? pc.content_id ?? pc.contentId ?? null;
        if (!contentId) {
            console.warn('No content id for platform content', pc);
            return;
        }

        const formData = new FormData();
        formData.append('prompt', String(this.selectedPrompt ?? ''));
        formData.append('aspect_ratio', '1:1');
        try {
            const files = Array.isArray(this.selectedAttachments) ? this.selectedAttachments.slice(0, 3) : [];
            files.forEach((att: any) => {
                const f: File | undefined = att?.file;
                if (f) formData.append('files', f, f.name);
            });
        } catch (e) { }

        this.isLoading = true;
        this.detailsService.regenerateImage(contentId, formData).subscribe({
            next: (res: any) => {
                try {
                    const imageKeys: string[] = Array.isArray(res?.image_keys)
                        ? res.image_keys
                        : Array.isArray(res?.data?.image_keys) ? res.data.image_keys : [];

                    const mapped = imageKeys.map((key: string) => ({
                        image: this.buildProductImageUrl(key),
                        alt: key || 'N/A',
                        prompt: this.selectedPrompt || ''
                    }));
                    const content = res?.content ?? res?.data?.content ?? res?.description ?? res?.data?.description ?? null;
                    if (content) {
                        try {
                            const html = formatGeneratedContentToHtml(content);
                            try { this.platformContentsTextMap[tabLabel] = html; } catch (e) {}
                            if (tabLabel === 'All') {
                                try { this.postForm.get('postDescription')?.setValue(html, { emitEvent: false }); } catch (e) { }
                                try { this.finalDescriptionHtml = this.computeSanitizedHtml(html); } catch (e) {}
                            }
                        } catch (e) { }
                    }
                    this.platformContentsMap[tabLabel] = mapped;
                    if (tabLabel === 'All') {
                        this.generatedResults = mapped.slice();
                        this.syncAllTabImagesToOtherTabs();
                    }

                    // Select all newly generated images
                    this.selectedIndicesMap[tabLabel] = new Set(mapped.map((_, i) => i));
                    if (tabLabel === 'All') {
                        this.syncSelectionToOtherTabs(this.selectedIndicesMap['All']);
                    }

                    this.finalPostViewIndex = 0;
                    const activeImgs = this.getImagesForTab(tabLabel);
                    this.selectedPrompt = activeImgs.length > 0 ? (activeImgs[0]?.prompt || this.selectedPrompt) : this.selectedPrompt;
                } catch (e) {
                    console.warn('Failed to process regenerate response', e);
                }

                // Refresh post details from server
                try {
                    const postId = this.postDetails?.id ?? this.postDetails?.postId ?? null;
                    if (postId) {
                        this.detailsService.getSocialPostDetails(postId).subscribe({
                            next: (data: any) => {
                                try {
                                    this.postDetails = data;
                                    this.generatedResults = (data.generatedImages || []).map((img: any) => ({
                                        image: this.buildProductImageUrl(img.image_key ?? ''),
                                        alt: img.image_key ?? 'N/A',
                                        prompt: img.prompt ?? ''
                                    }));
                                    const pcsNew = data.platformContents || [];
                                    this.platformContentsMap = {};
                                    this.platformContentsTextMap = {};
                                    if (Array.isArray(pcsNew) && pcsNew.length > 0) {
                                        pcsNew.forEach((pcItem: any) => {
                                            const tabKey = pcItem.platform_name ? this.platformLabel(pcItem.platform_name) : 'All';
                                            this.platformContentsMap[tabKey] = Array.isArray(pcItem.images)
                                                ? pcItem.images.map((img: any) => ({
                                                    image: this.buildProductImageUrl(img.image_key ?? ''),
                                                    alt: img.image_key ?? 'N/A',
                                                    prompt: img.prompt ?? ''
                                                }))
                                                : [];
                                            try { this.platformContentsTextMap[tabKey] = formatGeneratedContentToHtml(pcItem.content ?? ''); }
                                            catch (e) { this.platformContentsTextMap[tabKey] = String(pcItem.content ?? ''); }
                                        });
                                    }

                                    const platformSet = Array.isArray(data.publishAccounts)
                                        ? Array.from(new Set(data.publishAccounts)) : [];
                                    const primaryPc = (Array.isArray(pcsNew) ? pcsNew : []).find((p: any) => !p.platform_name) || (pcsNew[0] ?? null);
                                    const fallbackContent = this.platformContentsTextMap['All'] ?? formatGeneratedContentToHtml(primaryPc?.content ?? '');

                                    this.setupTabsFromPlatformSet(platformSet as any[], fallbackContent);
                                    const desiredIdx = this.socialTabs.indexOf(tabLabel);
                                    this.selectedTabIndex = desiredIdx >= 0 ? desiredIdx : 0;

                                    // Initialise selection: select all generated images
                                    this.selectedIndicesMap['All'] = new Set(this.generatedResults.map((_, i) => i));
                                    this.syncSelectionToOtherTabs(this.selectedIndicesMap['All']);
                                    this.finalPostViewIndex = 0;
                                    this.selectedPrompt = this.generatedResults.length > 0 ? (this.generatedResults[0]?.prompt || '') : '';

                                    // Update form
                                    try {
                                        const productNames = Array.isArray(data?.productNames) ? data.productNames : [];
                                        const productLinks = Array.isArray(data?.productLinks) ? data.productLinks : [];
                                        this.postForm.patchValue({
                                            postName: data.postName ?? 'N/A',
                                            postCategory: data.postCategory ?? 'N/A',
                                            product: productNames.length ? productNames.join(', ') : 'N/A',
                                            creationType: data.postType ?? 'N/A',
                                            productLink: productLinks.length ? productLinks.join('\n') : 'N/A'
                                        }, { emitEvent: false });
                                        const platArr = Array.isArray(data.publishAccounts) ? Array.from(new Set(data.publishAccounts)) : [];
                                        this.postForm.get('platforms')?.setValue(platArr, { emitEvent: false });
                                        this.postForm.get('platformsSelected')?.setValue(platArr, { emitEvent: false });

                                        const activeTabLabel = this.socialTabs[this.selectedTabIndex] || tabLabel;
                                        const activeContent = this.platformContentsTextMap[activeTabLabel] ?? fallbackContent;
                                        this.postForm.get('postDescription')?.setValue(activeContent, { emitEvent: false });
                                        this.finalDescriptionHtml = this.computeSanitizedHtml(activeContent);
                                    } catch (e) { }

                                    const statusVal = String(data.status || data.stage || '').toLowerCase();
                                    this.isApproved = statusVal === 'approved';
                                    this.isRejected = statusVal === 'rejected';
                                    this.isPublished = statusVal === 'published';

                                    try {
                                        if (this.isRejected || this.isPublished) {
                                            this.disableFormForReadOnly();
                                        } else {
                                            try { this.ensureAlwaysDisabledFields(); } catch (e) { }
                                            try { this.ensurePostNameEditableForTab(this.socialTabs[this.selectedTabIndex] || tabLabel); } catch (e) { }
                                        }
                                    } catch (e) { }

                                    // Reset snapshots
                                    try {
                                        this.platformInitialSnapshot = {};
                                        this.saveEnabledMap = {};
                                        (Array.isArray(pcsNew) ? pcsNew : []).forEach((pcItem: any) => {
                                            const key = pcItem.platform_name ? this.platformLabel(pcItem.platform_name) : 'All';
                                            this.platformInitialSnapshot[key] = pcItem.content ?? '';
                                            this.saveEnabledMap[key] = false;
                                        });
                                        this.fillMissingPlatformSnapshots(platformSet as any[], fallbackContent);
                                    } catch (e) { }
                                } catch (e) { }
                                this.cdr.detectChanges();
                            },
                            error: () => { this.cdr.detectChanges(); }
                        });
                    }
                } catch (e) { }
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.success('Images regenerated successfully'); } catch (e) { }
            },
            error: (err: any) => {
                console.error('Regenerate failed', err);
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.error('Failed to regenerate images'); } catch (e) { }
            }
        });
    }
    onPromptChange(val: string) {
        try {
            this.selectedPrompt = val;
            const currentTab = this.currentTabLabel;
            const currentImages = this.currentTabImages;
            
            // Update prompt for all currently selected images in this tab
            this.currentTabSelectedIndices.forEach(index => {
                if (currentImages[index]) {
                    currentImages[index].prompt = val;
                }
            });

            // If on "All" tab, propagate to other tabs
            if (currentTab === 'All') {
                try {
                    Object.keys(this.platformContentsMap || {}).forEach((tabKey) => {
                        if (tabKey === 'All') return;
                        (this.platformContentsMap[tabKey] || []).forEach((img: any) => {
                            if (!img.isManual) img.prompt = val;
                        });
                    });
                } catch (e) { }
            }
            this.cdr.detectChanges();
        } catch (e) {}
    }
    async savePlatform(tabLabel: string) {
        if (!this.postDetails || !Array.isArray(this.postDetails.platformContents)) return;
        const pcs = this.postDetails.platformContents as any[];
        const pc = pcs.find((p: any) => {
            const key = p.platform_name ? this.platformLabel(p.platform_name) : 'All';
            return key === tabLabel;
        });
        if (!pc) {
            console.warn('No platform content entry found for', tabLabel);
            return;
        }
        const contentId = pc.id ?? pc.content_id ?? pc.contentId ?? null;
        if (!contentId) {
            console.warn('No content id for platform content', pc);
            return;
        }
        const newContent = this.postForm.get('postDescription')?.value ?? '';
        const newContentPlain = htmlToSocialText(newContent);
        const body: any = { content: newContentPlain, post_name: null };

        // Image changes for this platform tab
        if (this.hasImageChangesForTab(tabLabel)) {
            const uploadedMedia = await this.uploadNewManualImages(tabLabel);
            body.selected_images = this.buildSelectedImagesIds(tabLabel);
            body.new_images = this.buildNewImagesArray(uploadedMedia);
        }

        this.isLoading = true;
        this.detailsService.updatePostContent(contentId, body).subscribe({
            next: (res) => {
                try {
                    const formattedHtml = ((): string => {
                        try {
                            return formatGeneratedContentToHtml(newContentPlain);
                        } catch (e) {
                            return String(newContent || '');
                        }
                    })();

                    this.platformInitialSnapshot[tabLabel] = formattedHtml;
                    this.saveEnabledMap[tabLabel] = false;
                    this.platformContentsTextMap[tabLabel] = formattedHtml;

                    try { (pc as any).content = newContentPlain; } catch (e) { }

                    if (body.selected_images !== undefined || body.new_images !== undefined) {
                        this.newManualImagesByTab[tabLabel] = [];
                        this.initialSelectedIndicesSnapshot[tabLabel] = JSON.stringify(
                            Array.from(this.selectedIndicesMap[tabLabel] || []).sort((a: number, b: number) => a - b)
                        );
                    }

                    const activeTab = this.socialTabs && this.socialTabs.length > this.selectedTabIndex
                        ? this.socialTabs[this.selectedTabIndex]
                        : 'All';
                    if (activeTab === tabLabel) {
                        try { this.postForm.get('postDescription')?.setValue(formattedHtml, { emitEvent: false }); } catch (e) { }
                        try { this.finalDescriptionHtml = this.computeSanitizedHtml(formattedHtml); } catch (e) { }
                        try { this.pendingEditorValue = formattedHtml; this.syncEditorWithValue(formattedHtml); this.pendingEditorValue = null; } catch (e) { }
                    }
                } catch (e) {}
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.success('Saved platform content successfully'); } catch (e) { }
            },
            error: () => {
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.error('Failed to save platform content'); } catch (e) { }
            }
        });
    }

    private async buildPreApproveFlow(params: any): Promise<Observable<any>> {
        const currentPostNameVal = this.postForm.get('postName')?.value;
        const currentDescVal = this.postForm.get('postDescription')?.value;
        const currentPostName = currentPostNameVal == null ? '' : String(currentPostNameVal);
        const currentDesc = currentDescVal == null ? '' : String(currentDescVal);
        const baseName = this.initialAllPostName == null ? '' : String(this.initialAllPostName);
        const baseDesc = this.initialAllPostDescription == null ? '' : String(this.initialAllPostDescription);
        const nameChanged = currentPostName !== baseName;
        const descChanged = htmlToSocialText(currentDesc) !== htmlToSocialText(baseDesc);
        const imgChanged = this.hasImageChangesForTab('All');
        const needsEdit = nameChanged || descChanged || imgChanged;

        if (!needsEdit) return of(null);

        const pcs = Array.isArray(this.postDetails?.platformContents) ? this.postDetails.platformContents : [];
        const allPc = pcs.find((pc: any) => !pc?.platform_name) || null;
        const contentId = allPc?.id ?? allPc?.content_id ?? allPc?.contentId ?? null;

        if (!contentId) {
            console.warn('All-tab platform_content id not found; skipping pre-approve save');
            return of(null);
        }

        const currentDescPlain = htmlToSocialText(currentDesc);
        const body: any = {
            content: descChanged ? currentDescPlain : null,
            post_name: nameChanged ? currentPostName : null,
            publish_now: params.publish_now
        };

        if (imgChanged) {
            const uploadedMedia = await this.uploadNewManualImages('All');
            body.selected_images = this.buildSelectedImagesIds('All');
            body.new_images = this.buildNewImagesArray(uploadedMedia);
        }

        return this.detailsService.updatePostContent(contentId, body).pipe(
            switchMap(() => {
                this.initialAllPostName = currentPostName;
                this.initialAllPostDescription = currentDesc;
                if (imgChanged) {
                    this.newManualImagesByTab['All'] = [];
                    this.initialSelectedIndicesSnapshot['All'] = JSON.stringify(
                        Array.from(this.selectedIndicesMap['All'] || []).sort((a: number, b: number) => a - b)
                    );
                }
                try {
                    if (this.postDetails && nameChanged) {
                        this.postDetails.postName = currentPostName;
                    }
                } catch (e) { }
                return of(null);
            })
        );
    }

    approve() {
        if (!this.postDetails || !this.postDetails.id) return;
        if (this.isLoading) return;

        const platformIds = this.collectSelectedPlatformIds();
        if (!this.validatePublishRequiredFields(platformIds)) return;

        const params: any = this.buildPublishParams(platformIds);
        const postGenerationId = this.postDetails.id;

        (async () => {
            const flow$ = await this.buildPreApproveFlow(params);
            this.isLoading = true;
            flow$.pipe(
                switchMap(() => this.detailsService.approveSocialPost(postGenerationId, params)),
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                })
            ).subscribe({
                next: () => {
                    try { this.toastr.success('Post approved'); } catch (e) { }
                    this.reloadPostDetails();
                },
                error: () => {
                    try { this.toastr.error('Failed to approve post'); } catch (e) { }
                }
            });
        })();
    }

    reject() {
        if (!this.postDetails || !this.postDetails.id) return;
        if (this.isLoading) return;
        this.isLoading = true;
        this.detailsService.rejectSocialPost(this.postDetails.id).subscribe({
            next: (res) => {
                this.isRejected = true;
                this.postDetails.status = 'rejected';
                this.disableFormForReadOnly();
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.success('Post rejected'); } catch (e) { }
            },
            error: (err) => {
                console.error('Reject failed', err);
                this.isLoading = false;
                this.cdr.detectChanges();
                try { this.toastr.error('Failed to reject the post'); } catch (e) { }
            }
        });
    }

    private collectSelectedPlatformIds(): string {
        const selectedNames = (this.platformsSelectedForDisplay || [])
            .map((p: any) => String(p || '').trim())
            .filter(Boolean)
            .map(p => p.toLowerCase());

        if (!selectedNames.length) return '';

        const pcs = Array.isArray(this.postDetails?.platformContents) ? this.postDetails.platformContents : [];

        const ids: Array<number | string> = [];
        for (const platformName of selectedNames) {
            const match = pcs.find((pc: any) => String(pc?.platform_name || '').toLowerCase() === platformName);
            let platformId = match?.platform_id ?? match?.platformId ?? match?.id;

            // If not found in platformContents, check the platformConnectionsMap (for draft posts)
            if (!platformId && this.platformConnectionsMap.has(platformName)) {
                platformId = this.platformConnectionsMap.get(platformName);
            }

            if (platformId !== null && platformId !== undefined && platformId !== '') {
                ids.push(platformId);
            }
        }

        const unique = Array.from(new Set(ids.map(x => String(x)))).filter(Boolean);
        return unique.join(',');
    }

    private formatScheduledTimeForApi(localDateTime: Date): string {
        const y = localDateTime.getUTCFullYear();
        const m = String(localDateTime.getUTCMonth() + 1).padStart(2, '0');
        const d = String(localDateTime.getUTCDate()).padStart(2, '0');
        const hh = String(localDateTime.getUTCHours()).padStart(2, '0');
        const mm = String(localDateTime.getUTCMinutes()).padStart(2, '0');
        const ss = String(localDateTime.getUTCSeconds()).padStart(2, '0');
        return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
    }

    private getScheduledDateTimeForPublish(): Date | null {
        try {
            const dtCtl = this.postForm.get('publicationDateTime');
            const timeCtl = this.postForm.get('publicationTime');
            const dateOnly = this.toJsDate(dtCtl?.value);
            if (!dateOnly) return null;
            const timeStr = timeCtl?.value;
            if (timeStr == null || String(timeStr).trim() === '') return null;
            const parsed = this.parseTimeToHoursMinutes(timeStr);
            if (!parsed) return null;
            return this.setTimePortion(dateOnly, timeStr);
        } catch (e) {
            return null;
        }
    }

    private buildPublishParams(platformIds: string): any {
        const goesLive = String(this.postForm.get('goesLive')?.value || 'now').toLowerCase();
        const publishNow = goesLive === 'now';

        const params: any = {
            publish_now: publishNow,
            platform_ids: platformIds,
            scheduled_time: null
        };

        if (!publishNow) {
            const scheduledDt = this.getScheduledDateTimeForPublish();
            if (scheduledDt) {
                params.scheduled_time = this.formatScheduledTimeForApi(scheduledDt);
            }
        }

        return params;
    }

    private hasImageChangesForTab(tab: string): boolean {
        const hasNewImages = !!(this.newManualImagesByTab[tab]?.length);
        const currentSnapshot = JSON.stringify(
            Array.from(this.selectedIndicesMap[tab] || []).sort((a: number, b: number) => a - b)
        );
        const initialSnapshot = this.initialSelectedIndicesSnapshot[tab] ?? null;
        return hasNewImages || currentSnapshot !== initialSnapshot;
    }

    private dataUrlToFile(dataUrl: string, filename: string): File | null {
        try {
            const arr = dataUrl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            if (!mimeMatch) return null;
            const mime = mimeMatch[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) { u8arr[n] = bstr.charCodeAt(n); }
            return new File([u8arr], filename, { type: mime });
        } catch { return null; }
    }

    private async uploadNewManualImages(tab: string): Promise<any[]> {
        const newImages = this.newManualImagesByTab[tab] || [];
        if (!newImages.length) return [];
        const files: File[] = newImages
            .map((item, i) => this.dataUrlToFile(item.dataUrl, `upload_${tab}_${i}.jpg`))
            .filter((f): f is File => f !== null);
        if (!files.length) return [];
        try {
            const res: any = await this.apiService.uploadFiles(files);
            return res?.data || res?.Data || [];
        } catch { return []; }
    }

    private buildSelectedImagesIds(tab: string): any[] {
        const imgs = this.platformContentsMap[tab] || this.generatedResults;
        const selectedSet = this.selectedIndicesMap[tab] || new Set<number>();
        return imgs
            .map((img: any, i: number) => ({ img, i }))
            .filter(({ img, i }: { img: any; i: number }) => !img.isManual && img.id != null && selectedSet.has(i))
            .map(({ img }: { img: any }) => img.id);
    }

    private buildNewImagesArray(uploadedMedia: any[]): any[] {
        return uploadedMedia.map((m: any) => ({
            image_key: m.media_url ?? m.image_key ?? '',
            image_type: 'uploaded',
            is_selected: true
        }));
    }

    async savePost() {
        if (this.isLoading) return;
        const postGenerationId = this.postDetails?.id;
        if (!postGenerationId) return;

        const pcs = Array.isArray(this.postDetails?.platformContents) ? this.postDetails.platformContents : [];
        const allPc = pcs.find((pc: any) => !pc?.platform_name) || pcs[0] || null;
        const contentId = allPc?.id ?? allPc?.content_id ?? allPc?.contentId ?? null;
        if (!contentId) {
            try { this.toastr.error('Could not find content to update'); } catch (e) { }
            return;
        }

        const body: any = {};
        let hasChanges = false;

        const currentPostNameVal = this.postForm.get('postName')?.value;
        const currentPostName = currentPostNameVal == null ? '' : String(currentPostNameVal);
        const baseName = this.initialAllPostName == null ? '' : String(this.initialAllPostName);
        if (currentPostName !== baseName) {
            body.post_name = currentPostName;
            hasChanges = true;
        }

        const currentDescVal = this.postForm.get('postDescription')?.value;
        const currentDesc = currentDescVal == null ? '' : String(currentDescVal);
        const baseDesc = this.initialAllPostDescription == null ? '' : String(this.initialAllPostDescription);
        if (htmlToSocialText(currentDesc) !== htmlToSocialText(baseDesc)) {
            body.content = htmlToSocialText(currentDesc);
            hasChanges = true;
        }

        const scheduledDt = this.getScheduledDateTimeForPublish();
        const currentScheduledTime = scheduledDt ? this.formatScheduledTimeForApi(scheduledDt) : null;
        if (currentScheduledTime !== this.initialScheduledTime) {
            body.scheduled_time = currentScheduledTime;
            hasChanges = true;
        }

        const currentGoesLive = this.postForm.get('goesLive')?.value || 'now';
        if (currentGoesLive !== this.initialGoesLive) {
            hasChanges = true;
        }

        body.publish_now = (currentGoesLive === 'now');

        // Image changes
        if (this.hasImageChangesForTab('All')) {
            const uploadedMedia = await this.uploadNewManualImages('All');
            body.selected_images = this.buildSelectedImagesIds('All');
            body.new_images = this.buildNewImagesArray(uploadedMedia);
            hasChanges = true;
        }

        if (!hasChanges) {
            try { this.toastr.info('No changes to save'); } catch (e) { }
            return;
        }

        this.isLoading = true;
        this.detailsService.updatePostContent(contentId, body).pipe(
            finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => {
                if (body.post_name !== undefined) {
                    this.initialAllPostName = currentPostName;
                    try { if (this.postDetails) this.postDetails.postName = currentPostName; } catch (e) { }
                }
                if (body.content !== undefined) {
                    this.initialAllPostDescription = currentDesc;
                }
                if (body.scheduled_time !== undefined) {
                    this.initialScheduledTime = currentScheduledTime;
                }
                if (body.selected_images !== undefined || body.new_images !== undefined) {
                    // Reset tracking after successful save
                    this.newManualImagesByTab['All'] = [];
                    this.initialSelectedIndicesSnapshot['All'] = JSON.stringify(
                        Array.from(this.selectedIndicesMap['All'] || []).sort((a: number, b: number) => a - b)
                    );
                }
                try { this.toastr.success('Post saved successfully'); } catch (e) { }
            },
            error: (err) => {
                console.error('Save failed', err);
                try { this.toastr.error('Failed to save the post'); } catch (e) { }
            }
        });
    }

    publishNow() {
        if (this.isLoading) return;
        const postGenerationId = this.postDetails?.id;
        if (!postGenerationId) return;

        const platformIds = this.collectSelectedPlatformIds();

        if (!this.validatePublishRequiredFields(platformIds)) {
            return;
        }

        const dialogRef = this.commonService.showAlertDialog({
            heading: 'Confirm Publish',
            content: 'Are you sure you want to publish this post?',
            showCancel: true,
            cancelBtnName: 'Cancel',
            actionBtnName: 'Publish'
        });

        dialogRef.afterClosed().pipe(first()).subscribe(async (confirmed: any) => {
            if (!confirmed) return;

            const params: any = this.buildPublishParams(platformIds);
            const preFlow$ = await this.buildPreApproveFlow(params);

            this.isLoading = true;
            preFlow$.pipe(
                switchMap(() => this.detailsService.publishSocialPost(postGenerationId, params)),
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                })
            ).subscribe({
                next: () => {
                    this.isPublished = true;
                    try {
                        if (this.postDetails) {
                            this.postDetails.status = 'published';
                        }
                    } catch (e) { }
                    try { this.toastr.success('Post published successfully'); } catch (e) { }
                    this.goBack();
                },
                error: (err) => {
                    console.error('Publish failed', err);
                    try { this.toastr.error('Failed to publish the post'); } catch (e) { }
                }
            });
        });
    }

    approveAndPublishNow() {
        if (this.isLoading) return;
        const postGenerationId = this.postDetails?.id;
        if (!postGenerationId) return;

        const platformIds = this.collectSelectedPlatformIds();

        if (!this.validatePublishRequiredFields(platformIds)) {
            return;
        }

        const dialogRef = this.commonService.showAlertDialog({
            heading: 'Confirm Approve & Publish',
            content: 'Are you sure you want to approve and publish this post?',
            showCancel: true,
            cancelBtnName: 'Cancel',
            actionBtnName: 'Approve & Publish'
        });

        dialogRef.afterClosed().pipe(first()).subscribe(async (confirmed: any) => {
            if (!confirmed) return;

            const params: any = this.buildPublishParams(platformIds);
            const flow$ = await this.buildPreApproveFlow(params);

            this.isLoading = true;
            flow$.pipe(
                switchMap(() => this.detailsService.approveSocialPost(postGenerationId, params)),
                switchMap(() => {
                    this.isApproved = true;
                    try {
                        if (this.postDetails) {
                            this.postDetails.status = 'approved';
                        }
                    } catch (e) { }
                    return this.detailsService.publishSocialPost(postGenerationId, params);
                }),
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.detectChanges();
                })
            ).subscribe({
                next: () => {
                    this.isPublished = true;
                    try {
                        if (this.postDetails) {
                            this.postDetails.status = 'published';
                        }
                    } catch (e) { }
                    this.cdr.detectChanges();
                    try { this.toastr.success('Post approved and published successfully'); } catch (e) { }
                    this.goBack();
                },
                error: (err) => {
                    console.error('Approve+Publish failed', err);
                    try { this.toastr.error('Internal Server Error'); } catch (e) { }
                }
            });
        });
    }
    
    onTabChange(event: any) {
        this.isSwitchingTabs = true;
        this.selectedTabIndex = event.index !== undefined ? event.index : event;
        const tabLabel = this.socialTabs[this.selectedTabIndex] || 'All';
        
        // Get or initialize selected indices for this tab
        const tabImages = tabLabel === 'All' ? this.generatedResults : (this.platformContentsMap[tabLabel] || []);
        if (!this.selectedIndicesMap[tabLabel]) {
            // First time visiting this tab - select all images by default
            this.selectedIndicesMap[tabLabel] = new Set();
            for (let i = 0; i < tabImages.length; i++) {
                this.selectedIndicesMap[tabLabel].add(i);
            }
        }
        
        this.finalPostViewIndex = 0;
        this.selectedPrompt = tabImages.length > 0 ? (tabImages[0]?.prompt || '') : '';
        const pdControl = this.postForm.get('postDescription');
        const tabContent = this.platformContentsTextMap[tabLabel] ?? '';
        
        if (pdControl) {
            // Update Final Description immediately
            this.finalDescriptionHtml = this.computeSanitizedHtml(tabContent);
            pdControl.setValue(tabContent, { emitEvent: true });
        }
        
        // Allow time for CKEditor to process the change before allowing edits
        setTimeout(() => {
            this.isSwitchingTabs = false;
        }, 350);
        
        this.ensurePostNameEditableForTab(tabLabel);
        try { this.ensureAlwaysDisabledFields(); } catch (e) { }
        
        try {
            if (tabLabel && tabLabel !== 'All') {
                const currentVal = this.postForm.get('postDescription')?.value ?? '';
                const original = this.platformInitialSnapshot[tabLabel] ?? '';
                this.saveEnabledMap[tabLabel] = String(currentVal) !== String(original);
            }
        } catch (e) { }
    }

    private ensurePostNameEditableForTab(tabLabel: string) {
        try {
            const ctl = this.postForm.get('postName');
            if (!ctl) return;
            if (this.isRejected || this.isPublished) {
                ctl.disable({ emitEvent: false });
                return;
            }
            if (tabLabel === 'All') {
                ctl.enable({ emitEvent: false });
            } else {
                ctl.disable({ emitEvent: false });
            }
        } catch (e) {}
    }

    ngOnDestroy(): void {
        try {
            if (this.formChangesSub && typeof this.formChangesSub.unsubscribe === 'function') {
                this.formChangesSub.unsubscribe();
            }
        } catch (e) { }

        try {
            if (this.publicationDateTimeSub && typeof this.publicationDateTimeSub.unsubscribe === 'function') {
                this.publicationDateTimeSub.unsubscribe();
            }
            if (this.publicationTimeSub && typeof this.publicationTimeSub.unsubscribe === 'function') {
                this.publicationTimeSub.unsubscribe();
            }
        } catch (e) { }
    }
}

