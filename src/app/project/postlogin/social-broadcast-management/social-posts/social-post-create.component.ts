import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChildren, QueryList, ViewChild, ElementRef } from '@angular/core';
import { SocialProfilesApiService } from '../service/social-profiles-api.service';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';
import { Location, NgClass, NgTemplateOutlet } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { APPCOMMONHELPERS } from 'src/app/helpers/appcommonhelpers';
import { ApiService } from 'src/app/service/api.service';
import { SocialBroadcastDetailsApiService } from '../service/social-broadcast-details-api.service';
import { firstValueFrom } from 'rxjs';
import { CommonService } from 'src/app/service/common.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

import { formatGeneratedContentToHtml, htmlToSocialText } from '../../../../helpers/content-utils';
import { TimePickerComponent } from '../../../../shared/widgets/time-picker/time-picker.component';
import { MatIcon } from '@angular/material/icon';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DadyinSearchSelectNewComponent } from '../../../../shared/widgets/dadyin-search-select-new/dadyin-search-select-new.component';
import { DadyinSelectComponent } from '../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';
import { DadyinButtonComponent } from '../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SpinnerOverlayComponent } from '../../../../shared/component/spinner-overlay/spinner-overlay.component';

type ProductImageTile = {
    productId: any;
    productLabel: string;
    fileName: string;
    url: string;
    imageIndex: number;
    imageTotal: number;
};

@Component({
    selector: 'app-social-post-create',
    templateUrl: './social-post-create.component.html',
    styleUrls: ['./social-post-detail.component.scss'],
    imports: [SpinnerOverlayComponent, DadyinButtonComponent, MatTabGroup, MatTab, MatTabLabel, MatTabContent, FormsModule, ReactiveFormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, DadyinInputComponent, DadyinSelectComponent, DadyinSearchSelectNewComponent, CKEditorModule, NgClass, ExtendedModule, MatIcon, TimePickerComponent, NgTemplateOutlet]
})
export class SocialPostCreateComponent implements OnInit, OnDestroy{
    public Editor = ClassicEditor;
    public editorConfig = {
        toolbar: [
            'bulletedList', 'numberedList', '|', 'undo', 'redo'
        ]
    };
    @ViewChildren(MatExpansionPanel) expansionPanels!: QueryList<MatExpansionPanel>;
    @ViewChild('generatedImagesFileInput') generatedImagesFileInputRef!: ElementRef<HTMLInputElement>;
    postForm: UntypedFormGroup;
    isLoading = false;
    generatedResults: any[] = [];
    selectedPrompt: string = '';
    selectedResultIndices: Set<number> = new Set();
    selectedImage: string | null = null;
    maxGeneratedImages = 10;
    finalPostImageIndex = 0;
    socialTabs: string[] = ['All'];
    selectedTabIndex: number = 0;
    platformsForDisplay: string[] = [];
    productImageBaseUrl: string = environment?.imgUrl || '';
    productImagesForDisplay: ProductImageTile[] = [];
    productImagesPageIndex: number = 0;
    productImagesPageSize: number = 4;
    private selectedProductImageKeys = new Set<string>();
    private productImagesLockedAfterGenerate = false;

    private platformIdByNameLower: { [nameLower: string]: number } = {};

    goesLiveOptions = [
        { label: 'Now', value: 'now' },
        { label: 'Schedule Later', value: 'later' }
    ];

    postCategoryOptions = [
        { label: 'Festival Post', value: 'Festival Post' },
        { label: 'Product Post', value: 'Product Post' },
        { label: 'Service Post', value: 'Service Post' },
        { label: 'Sale Post', value: 'Sale Post' },
        { label: 'Clearance Post', value: 'Clearance Post' }
    ];
    minPublicationDate: Date = (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    })();

    productsForDropdown: any[] = [];
    private productsFilter = "&filter=status!'DELETED'";

    @ViewChild('refFileInput') refFileInputRef!: ElementRef<HTMLInputElement>;
    selectedAttachments: Array<{ file: File; url: string; name: string }> = [];
    hoveredImageUrl: string | null = null;
    maxAttachments = 3;
    allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    finalDescriptionHtml: SafeHtml = '';
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

    private isPatchingTab = false;
    private allBaseForm: any = {};
    private tabOverrides: { [tab: string]: any } = {};
    private allBaseImages: { images: any[]; selectedIndices: Set<number> } = { images: [], selectedIndices: new Set() };
    private tabImageOverrides: { [tab: string]: { images: any[]; selectedIndices: Set<number> } | null } = {};
    private imagesDirtyForTab: { [tab: string]: boolean } = {};

    private activeTabLabel: string = 'All';
    uploadedMediaByTab: { [tab: string]: any[] } = {};
    private readonly allOnlyEditableFields = [
        'postName',
        'postCategory',
        'product',
        'productLink',
        'goesLive',
        'publicationDateTime',
        'publicationTime'
    ];

    private readonly allOverwriteFields = ['postDescription'];
    private publicationTimeSub: any = null;

    constructor(
        private fb: UntypedFormBuilder,
        private location: Location,
        private cdr: ChangeDetectorRef,
        private socialProfilesApi: SocialProfilesApiService,
        private apiService: ApiService,
        private detailsApi: SocialBroadcastDetailsApiService,
        private sanitizer: DomSanitizer,
        private commonService: CommonService,
        private router: Router,
        public toastr: ToastrService
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

        this.setupGoesLiveBehavior();
    }
    ngOnDestroy(): void {
        try {
            if (this.publicationTimeSub && typeof this.publicationTimeSub.unsubscribe === 'function') {
                this.publicationTimeSub.unsubscribe();
            }
        } catch (e) { }
    }
    ngOnInit(): void {
        try {
            this.postForm.get('creationType')?.setValue('Manual', { emitEvent: false });
            this.postForm.get('creationType')?.disable({ emitEvent: false });
        } catch (e) { }

        this.fetchSocialTabs();
        this.loadProducts('');
        this.setupMaxThreeProductsGuard();
        this.setupProductLinksSync();
        this.setupProductImagesSync();
        this.setupAllTabAsBase();
        this.setupDerivedHtml();
        this.activeTabLabel = 'All';
        this.updateFieldEditabilityForTab('All');
    }

    private normalizeLinkValue(value: any): string {
        const v = value == null ? '' : String(value).trim();
        return v;
    }

    private normalizeImageFileName(value: any): string {
        const v = value == null ? '' : String(value).trim();
        return v;
    }

    private getProductLabelFromItem(item: any): string {
        try {
            const lbl = APPCOMMONHELPERS.getProductLabel(item);
            return lbl || '';
        } catch (e) {
            return '';
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

    private buildProductImageTiles(selection: any): ProductImageTile[] {
        const arr = Array.isArray(selection) ? selection : [];
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
                const url = `${this.productImageBaseUrl || ''}${fileName}`;
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

    private setupProductImagesSync() {
        try {
            const ctl = this.postForm.get('product') as UntypedFormControl;
            if (!ctl) return;

            const sync = (v: any) => {
                try {
                    this.productImagesLockedAfterGenerate = false;
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
            };

            sync(ctl.value);
            ctl.valueChanges.pipe(debounceTime(0)).subscribe((v: any) => {
                if (this.isPatchingTab) return;
                sync(v);
            });
        } catch (e) { }
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
        try {
            this.productImagesPageIndex = Math.max(0, this.productImagesPageIndex - 1);
        } catch (e) { }
    }

    nextProductImagesPage() {
        try {
            if (!this.canNextProductImagesPage) return;
            this.productImagesPageIndex = this.productImagesPageIndex + 1;
        } catch (e) { }
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
            if (this.productImagesLockedAfterGenerate) {
                this.showInfoDialog(
                    'Product images are locked after generation. Please delete all generated results before changing image selection.',
                    'Images Locked'
                );
                return;
            }

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
                this.toastr?.info?.('Select product(s) first to choose images');
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

    private extractProductLinkFromItem(item: any): string {
        if (!item) return '';
        const candidates = [
            item.shareUrl,
        ];
        for (const c of candidates) {
            const v = this.normalizeLinkValue(c);
            if (v) return v;
        }
        return '';
    }

    private findProductInDropdownById(id: any): any | null {
        const needle = id == null ? '' : String(id).trim();
        if (!needle) return null;
        const list = Array.isArray(this.productsForDropdown) ? this.productsForDropdown : [];
        return (
            list.find((p: any) => String(p?.id ?? p?.productId ?? p?.product_id ?? '').trim() === needle) || null
        );
    }

    private deriveLinksFromSelectedProducts(selection: any): string[] {
        const arr = Array.isArray(selection) ? selection : [];
        const links: string[] = [];
        for (const item of arr) {
            if (item && typeof item === 'object') {
                const link = this.extractProductLinkFromItem(item);
                if (link) links.push(link);
                continue;
            }
            const matched = this.findProductInDropdownById(item);
            const link = matched ? this.extractProductLinkFromItem(matched) : '';
            if (link) links.push(link);
        }
        const seen = new Set<string>();
        const out: string[] = [];
        for (const l of links) {
            const key = l.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(l);
        }
        return out;
    }

    private setupProductLinksSync() {
        try {
            const ctl = this.postForm.get('product') as UntypedFormControl;
            const linkCtl = this.postForm.get('productLink');
            if (!ctl || !linkCtl) return;

            const sync = (v: any) => {
                try {
                    const links = this.deriveLinksFromSelectedProducts(v);
                    linkCtl.setValue(links.join('\n'), { emitEvent: false });
                } catch (e) { }
                try { this.cdr.detectChanges(); } catch (e) { }
            };
            sync(ctl.value);
            ctl.valueChanges.pipe(debounceTime(0)).subscribe((v: any) => {
                if (this.isPatchingTab) return;
                sync(v);
            });
        } catch (e) { }
    }

    get productLinksForDisplay(): string[] {
        try {
            const raw = this.postForm.getRawValue() as any;
            return this.splitLinks(raw?.productLink);
        } catch (e) {
            return [];
        }
    }

    copySingleProductLink(link: string) {
        const value = this.normalizeLinkValue(link);
        if (!value) return;
        try {
            if (navigator && (navigator as any).clipboard) {
                (navigator as any).clipboard.writeText(value);
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

    private setupGoesLiveBehavior() {
        try {
            const ctl = this.postForm.get('goesLive');
            if (!ctl) return;
            if (ctl.value == null || String(ctl.value || '').trim() === '') {
                try { ctl.setValue('now', { emitEvent: false }); } catch (e) { }
            }

            const apply = (v: any) => {
                try {
                    const isNow = String(v || '').toLowerCase() === 'now';
                    const dtCtl = this.postForm.get('publicationDateTime');
                    const timeCtl = this.postForm.get('publicationTime');
                    try {
                        if (dtCtl && (dtCtl.value == null || String(dtCtl.value || '').trim() === '')) {
                            dtCtl.patchValue(this.formatDateForInput(this.minPublicationDate), { emitEvent: false });
                        }
                    } catch (e) { }

                    if (isNow) {
                        try { dtCtl?.disable({ emitEvent: false }); } catch (e) { }
                    } else {
                        try { dtCtl?.enable({ emitEvent: false }); } catch (e) { }
                    }
                    try { timeCtl?.enable({ emitEvent: false }); } catch (e) { }
                } catch (e) { }
                try { this.cdr.detectChanges(); } catch (e) { }
            };

            apply(ctl.value);
            try { ctl.valueChanges.pipe(distinctUntilChanged()).subscribe(apply); } catch (e) { }
            const timeCtl = this.postForm.get('publicationTime');
            if (timeCtl) {
                if (this.publicationTimeSub && typeof this.publicationTimeSub.unsubscribe === 'function') {
                    this.publicationTimeSub.unsubscribe();
                }
                this.publicationTimeSub = timeCtl.valueChanges.pipe(debounceTime(0), distinctUntilChanged()).subscribe((t: any) => {
                    try {
                        const goesLiveCtl = this.postForm.get('goesLive');
                        if (goesLiveCtl && String(goesLiveCtl.value || '').toLowerCase() === 'now') {
                            goesLiveCtl.setValue('later', { emitEvent: true });
                        }
                        this.cdr.detectChanges();
                    } catch (e) { }
                });
            }
        } catch (e) { }
    }

    onPublicationTimeFocus() {
        try {
            const goesLiveCtl = this.postForm.get('goesLive');
            if (goesLiveCtl && String(goesLiveCtl.value || '').toLowerCase() === 'now') {
                goesLiveCtl.setValue('later');
            }
        } catch (e) { }
    }

    private get currentTab(): string {
        return this.activeTabLabel || 'All';
    }

    get productControl(): UntypedFormControl {
        return this.postForm.get('product') as UntypedFormControl;
    }

    private updateFieldEditabilityForTab(tab: string) {
        const isAll = tab === 'All';
        for (const key of this.allOnlyEditableFields) {
            const ctl = this.postForm.get(key);
            if (!ctl) continue;
            try {
                if (isAll) ctl.enable({ emitEvent: false });
                else ctl.disable({ emitEvent: false });
            } catch (e) { }
        }
        try {
            if (isAll) {
                const v = this.postForm.get('goesLive')?.value;
                const isNow = String(v || '').toLowerCase() === 'now';
                if (isNow) {
                    try { this.postForm.get('publicationDateTime')?.disable({ emitEvent: false }); } catch (e) { }
                }
            }
        } catch (e) { }
        try {
            this.postForm.get('creationType')?.disable({ emitEvent: false });
        } catch (e) { }
    }

    private pickFormState() {
        const v = this.postForm.getRawValue();
        return {
            postName: v.postName,
            postCategory: v.postCategory,
            product: v.product,
            creationType: v.creationType,
            productLink: v.productLink,
            postDescription: v.postDescription,
            goesLive: v.goesLive,
            publicationDateTime: v.publicationDateTime,
            publicationTime: v.publicationTime,
            goalLine: v.goalLine,
            platforms: v.platforms,
            platformsSelected: v.platformsSelected,
        };
    }

    private applyFormState(state: any) {
        this.isPatchingTab = true;
        try {
            this.postForm.patchValue(state || {}, { emitEvent: false });
        } catch (e) { }
        this.isPatchingTab = false;
    }

    private cloneImages(images: any[]): any[] {
        if (!Array.isArray(images)) return [];
        return images.map((img) => (img ? { ...img } : img));
    }

    private setupAllTabAsBase() {
        this.allBaseForm = this.pickFormState();
        this.allBaseImages = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };

        const trackKeys = [
            'postName',
            'postCategory',
            'product',
            'productLink',
            'postDescription',
            'goesLive',
            'publicationDateTime',
            'publicationTime',
            'goalLine',
        ];

        for (const key of trackKeys) {
            const ctl = this.postForm.get(key);
            if (!ctl) continue;
            ctl.valueChanges.pipe(debounceTime(0), distinctUntilChanged()).subscribe((val) => {
                if (this.isPatchingTab) return;
                const tab = this.currentTab;
                if (!this.allOnlyEditableFields.includes(key) && tab !== 'All') {
                    // ok
                } else if (this.allOnlyEditableFields.includes(key) && tab !== 'All') {
                    // ignore any programmatic changes while in non-All tabs
                    return;
                }

                if (tab === 'All') {
                    this.allBaseForm[key] = val;
                    if (this.allOverwriteFields.includes(key)) {
                        for (const t of Object.keys(this.tabOverrides)) {
                            if (t === 'All') continue;
                            if (this.tabOverrides[t]) delete this.tabOverrides[t][key];
                        }
                    }
                } else {
                    const baseVal = this.allBaseForm[key];
                    const same = this.isSameValueForKey(key, baseVal, val);
                    if (!this.tabOverrides[tab]) this.tabOverrides[tab] = {};
                    if (same) {
                        delete this.tabOverrides[tab][key];
                    } else {
                        this.tabOverrides[tab][key] = val;
                    }
                }
            });
        }
    }

    private isSameValueForKey(key: string, baseVal: any, curVal: any): boolean {
        if (key === 'product') {
            const a = Array.isArray(baseVal) ? baseVal : [];
            const b = Array.isArray(curVal) ? curVal : [];
            const aIds = a.map((x: any) => x?.id ?? x?.productId ?? x?.product_id ?? x).join(',');
            const bIds = b.map((x: any) => x?.id ?? x?.productId ?? x?.product_id ?? x).join(',');
            return aIds === bIds;
        }
        return (baseVal ?? '') === (curVal ?? '');
    }

    private setupMaxThreeProductsGuard() {
        try {
            const ctl = this.postForm.get('product') as UntypedFormControl;
            if (!ctl) return;
            ctl.valueChanges.pipe(debounceTime(0)).subscribe((v: any) => {
                if (this.isPatchingTab) return;
                if (!Array.isArray(v)) return;
                if (v.length <= 3) return;
                try {
                    ctl.setValue(v.slice(0, 3), { emitEvent: false });
                    this.showInfoDialog('You can select maximum 3 products.');
                } catch (e) { }
            });
        } catch (e) { }
    }

    private showInfoDialog(content: string, heading: string = 'Alert') {
        try {
            this.commonService.showAlertDialog({
                heading,
                content,
                showCancel: false,
                actionBtnName: 'Ok'
            });
        } catch (e) {}
    }

    private async confirmDialog(heading: string, content: string, actionBtnName: string): Promise<boolean> {
        try {
            const dialogRef = this.commonService.showAlertDialog({
                heading,
                content,
                showCancel: true,
                cancelBtnName: 'Cancel',
                actionBtnName
            });
            const confirmed = await firstValueFrom(dialogRef.afterClosed());
            return !!confirmed;
        } catch (e) {
            return false;
        }
    }

    private hasAnyImagesSelectedForPublish(): boolean {
        try {
            const tabs = Array.isArray(this.socialTabs) && this.socialTabs.length ? this.socialTabs : ['All'];
            for (const tab of tabs) {
                const images = this.getSelectedImagesForTab(tab); // Changed to use selected images only
                for (let i = 0; i < images.length; i++) {
                    const u = String(images[i]?.image || images[i]?.url || images[i] || '').trim();
                    if (u) return true;
                }
            }
        } catch (e) { }
        return false;
    }

    private validateCreatePublishRequiredFields(): boolean {
        const missing: string[] = [];
        const raw = this.postForm.getRawValue();

        const postName = String(raw?.postName ?? '').trim();
        const postCategory = String(raw?.postCategory ?? '').trim();
        const goesLive = String(raw?.goesLive || 'now').toLowerCase();

        if (!postName) missing.push('Please enter Post Name');
        if (!postCategory) missing.push('Please select Post Category');
        const postDescriptionPlain = String(this.allBaseForm?.postDescription ?? raw?.postDescription ?? '').trim();
        if (!postDescriptionPlain) missing.push('Please enter Post Description');
        const selectedNames = Array.isArray(raw?.platformsSelected) ? raw.platformsSelected : [];
        const selectedPlatformsLower = selectedNames
            .map((p: any) => String(p || '').trim())
            .filter(Boolean)
            .map((p: string) => p.toLowerCase());

        const platformIds: number[] = selectedPlatformsLower
            .map((nameLower) => this.platformIdByNameLower[nameLower])
            .filter((id) => id !== undefined && id !== null)
            .map((id) => Number(id))
            .filter((id) => isFinite(id));

        if (!platformIds.length) {
            missing.push('Please select at least one publication platform');
        }

        if (!this.hasAnyImagesSelectedForPublish()) {
            missing.push('Please generate at least one image before publishing/scheduling');
        }

        if (goesLive !== 'now') {
            const scheduledDt = this.getScheduledDateTimeForPublish();
            if (!scheduledDt) {
                const dateVal = this.postForm.get('publicationDateTime')?.value;
                const timeVal = this.postForm.get('publicationTime')?.value;
                if (!dateVal) missing.push('Please select Publication Date');
                if (!timeVal) missing.push('Please select Publication Time');
                if (dateVal && timeVal) missing.push('Please select both Publication Date and Time');
            }
        }

        if (missing.length > 0) {
            this.showInfoDialog(missing.join('<br/>'));
            return false;
        }
        return true;
    }

    private validateGenerateRequiredFields(): boolean {
        const missing: string[] = [];
        const productIds = this.extractSelectedProductIds();
        const postCategory = String(this.postForm.getRawValue()?.postCategory ?? '').trim();
        const prompt = String(this.selectedPrompt ?? '').trim();

        if (!productIds) {
            missing.push("Please select at least one product in 'Product's in post'.");
        }
        if (!prompt) {
            missing.push('Please enter a prompt.');
        } else if (String(prompt).trim().length < 10) {
            missing.push('Prompt must be at least 10 characters long.');
        }
        if (!postCategory) {
            missing.push('Please select Post Category.');
        }

            try {
                const productsData = this.buildProductsDataForForm();
                const productsDataMap = new Map<string, string[]>((productsData || []).map(p => [String(p.product_id), Array.isArray(p.images) ? p.images : []]));

                const rawSelected = this.postForm?.getRawValue()?.product;
                const selectedItems = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);

                const missingProductMsgs: string[] = [];
                for (const item of selectedItems) {
                    const pid = item?.id ?? item?.productId ?? item?.product_id ?? item;
                    if (pid == null || String(pid).trim() === '') continue;
                    const key = String(pid);
                    const imgs = productsDataMap.get(key) || [];
                    if (!Array.isArray(imgs) || imgs.length === 0) {
                        const fullProduct = this.findProductInDropdownById(pid) || item;
                        const label = this.getProductLabelFromItem(fullProduct) || String(pid);
                        missingProductMsgs.push(`Please select one image for the product '${label}'. If no image is available for this product, please select another product to proceed.`);
                    }
                }

                if (missingProductMsgs.length > 0) {
                    missing.push(...missingProductMsgs);
                }
            } catch (e) {}

        if (missing.length > 0) {
            this.showInfoDialog(missing.join('<br/>'));
            return false;
        }

        return true;
    }

    private navigateToSocialPostsList() {
        try {
            this.router.navigate(['/home/social-broadcast-management/social-posts']);
            return;
        } catch (e) {}
        try { this.location.back(); } catch (e) { }
    }

    onProductSearch(term: any) {
        this.loadProducts(term);
    }

    private loadProducts(term: any) {
        const searchTerm = (term ?? '').toString();
        try {
            this.apiService
                .Get_Product_List_By_Search(0, '', '', '', searchTerm, this.productsFilter)
                .subscribe((res: any) => {
                    this.productsForDropdown = Array.isArray(res?.content)
                        ? res.content.map((p: any) => {
                              const id = p?.id ?? null;
                              const code = p?.productCode ?? '';
                              const desc = p?.description ?? '';
                              const combined = (code ? String(code).trim() + ' - ' : '') + String(desc ?? '').trim();
                              return { ...p, id: id, description: combined };
                          })
                        : [];
                    this.cdr.detectChanges();
                });
        } catch (e) {
            this.productsForDropdown = [];
        }
    }

    private setupDerivedHtml() {
        const descCtl = this.postForm.get('postDescription');
        if (!descCtl) return;
        this.finalDescriptionHtml = this.computeSanitizedHtml(descCtl.value);
        descCtl.valueChanges.pipe(debounceTime(0)).subscribe((v) => {
            this.finalDescriptionHtml = this.computeSanitizedHtml(v);
        });
    }

    private computeSanitizedHtml(desc: any): SafeHtml {
        const value = desc || '';
        if (!value) return '';
        const asStr = String(value);
        const containsHtml = /<[^>]+>/.test(asStr);
        if (containsHtml) return this.sanitizer.bypassSecurityTrustHtml(asStr);
        const escaped = asStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        const withBreaks = escaped.replace(/\r\n|\r|\n/g, '<br/>');
        return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
    }

    fetchSocialTabs() {
        this.socialProfilesApi.getSocialProfiles().subscribe({
            next: (profiles) => {
                const connected = (profiles || []).filter((p: any) => {
                    const status = `${p?.connection_status ?? ''}`.toLowerCase();
                    const hasStatusKey = Object.prototype.hasOwnProperty.call(p ?? {}, 'connection_status');
                    return hasStatusKey && status === 'connected' && !!p?.platform_name;
                });

                const nameToId: { [k: string]: number } = {};
                for (const p of connected) {
                    const name = `${p?.platform_name ?? ''}`.trim();
                    const key = name.toLowerCase();
                    const platformId = Number(p?.platform_id);
                    if (!name || !isFinite(platformId)) continue;
                    if (nameToId[key] == null) nameToId[key] = platformId;
                }
                this.platformIdByNameLower = nameToId;

                const seen = new Set<string>();
                const uniquePlatforms: string[] = [];
                for (const p of connected) {
                    const name = `${p.platform_name}`.trim();
                    const key = name.toLowerCase();
                    if (!name || seen.has(key)) continue;
                    seen.add(key);
                    uniquePlatforms.push(name);
                }

                this.socialTabs = uniquePlatforms.length ? ['All', ...uniquePlatforms] : ['All'];
                this.platformsForDisplay = [...uniquePlatforms];

                try {
                    this.postForm.patchValue(
                        {
                            platforms: uniquePlatforms,
                            platformsSelected: [],
                        },
                        { emitEvent: false }
                    );
                    this.allBaseForm = { ...this.allBaseForm, platforms: uniquePlatforms, platformsSelected: [] };
                } catch (e) { }

                this.cdr.detectChanges();
            },
            error: () => {
                this.socialTabs = ['All'];
                this.platformsForDisplay = [];
                this.platformIdByNameLower = {};
                try {
                    this.postForm.patchValue({ platforms: [], platformsSelected: [] }, { emitEvent: false });
                    this.allBaseForm = { ...this.allBaseForm, platforms: [], platformsSelected: [] };
                } catch (e) { }
            },
        });
    }
    goBack() {
        this.location.back();
    }

    navigateToBusinessRegistration() {
        this.router.navigate(['/home/business-registration'], { queryParams: { currentMainIndex: 3 } });
    }

    onPlatformToggle(platform: string, checked: boolean) {
        const selected = this.postForm.value.platformsSelected ? [...this.postForm.value.platformsSelected] : [];
        if (checked) {
            if (!selected.includes(platform)) selected.push(platform);
        } else {
            const idx = selected.indexOf(platform);
            if (idx >= 0) selected.splice(idx, 1);
        }
        this.postForm.patchValue({ platformsSelected: selected });
    }

    openFilePicker() {
        try {
            if (this.refFileInputRef && this.refFileInputRef.nativeElement) {
                try { this.refFileInputRef.nativeElement.click(); return; } catch (e) { }
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
                this.showInfoDialog(`You can select up to ${this.maxAttachments} images.`);
                break;
            }
            const f = files.item(i);
            if (!f) continue;
            if (this.allowedImageTypes.indexOf(f.type.toLowerCase()) === -1) {
                this.showInfoDialog('Only image files (jpg, jpeg, png, webp) are allowed.');
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
        try {
            if (!this.canAddMoreGeneratedImages) {
                this.showInfoDialog('Maximum 10 images allowed', 'Image Limit');
                return;
            }
            if (this.generatedImagesFileInputRef && this.generatedImagesFileInputRef.nativeElement) {
                this.generatedImagesFileInputRef.nativeElement.value = '';
                this.generatedImagesFileInputRef.nativeElement.click();
            }
        } catch (e) {
            console.error('Failed to open file picker', e);
        }
    }

    onGeneratedImagesSelected(event: any) {
        try {
            const files = event?.target?.files;
            if (files && files.length > 0) {
                this.addManualImagesToGenerated(files);
            }
        } catch (e) {
            console.error('Failed to process selected images', e);
        }
    }

    private addManualImagesToGenerated(files: FileList) {
        const tab = this.currentTab;
        if (tab !== 'All') this.ensureImagesLocalForCurrentTab();

        const remainingSlots = this.maxGeneratedImages - this.generatedResults.length;
        const filesToAdd = Math.min(files.length, remainingSlots);

        if (filesToAdd <= 0) {
            this.showInfoDialog('Maximum 10 images allowed', 'Image Limit');
            return;
        }

        const startIndex = this.generatedResults.length;

        for (let i = 0; i < filesToAdd; i++) {
            const file = files[i];
            if (!this.allowedImageTypes.includes(file.type)) {
                continue;
            }

            try {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    try {
                        const dataUrl = e.target.result;
                        const newImage = {
                            image: dataUrl,
                            alt: file.name,
                            prompt: this.selectedPrompt || 'Manual upload',
                            isManual: true,
                            file: file
                        };
                        
                        this.generatedResults.push(newImage);
                        
                        // Select newly added image by default
                        const newIndex = this.generatedResults.length - 1;
                        this.selectedResultIndices.add(newIndex);

                        // Update tab state
                        if (tab === 'All') {
                            this.allBaseImages = { 
                                images: this.cloneImages(this.generatedResults), 
                                selectedIndices: new Set(this.selectedResultIndices) 
                            };
                        } else {
                            this.tabImageOverrides[tab] = { 
                                images: this.cloneImages(this.generatedResults), 
                                selectedIndices: new Set(this.selectedResultIndices) 
                            };
                            this.imagesDirtyForTab[tab] = true;
                        }
                        
                        this.cdr.detectChanges();
                    } catch (e) {
                        console.error('Failed to add image', e);
                    }
                };
                reader.readAsDataURL(file);
            } catch (e) {
                console.error('Failed to read file', e);
            }
        }

        if (filesToAdd < files.length) {
            const skipped = files.length - filesToAdd;
            this.showInfoDialog(`Only ${filesToAdd} image(s) added. ${skipped} exceeded the limit of ${this.maxGeneratedImages}.`, 'Image Limit');
        }
    }

    isGeneratedResultSelected(index: number): boolean {
        return this.selectedResultIndices.has(index);
    }

    showImagePreview(imageUrl: string) {
        this.hoveredImageUrl = imageUrl;
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
        const selected = this.getSelectedGeneratedResults();
        return selected.length > 0 ? selected[this.finalPostImageIndex % selected.length] : null;
    }

    get hasMultipleGeneratedResults(): boolean {
        return this.getSelectedGeneratedResults().length > 1;
    }

    get canAddMoreGeneratedImages(): boolean {
        return this.generatedResults.length < this.maxGeneratedImages;
    }

    getSelectedGeneratedResults(): any[] {
        return Array.from(this.selectedResultIndices)
            .sort((a, b) => a - b)
            .map(idx => this.generatedResults[idx])
            .filter(Boolean);
    }

    prevFinalPostImage() {
        try {
            const selected = this.getSelectedGeneratedResults();
            if (selected.length > 1) {
                this.finalPostImageIndex = (this.finalPostImageIndex - 1 + selected.length) % selected.length;
            }
        } catch (e) { }
    }

    nextFinalPostImage() {
        try {
            const selected = this.getSelectedGeneratedResults();
            if (selected.length > 1) {
                this.finalPostImageIndex = (this.finalPostImageIndex + 1) % selected.length;
            }
        } catch (e) { }
    }

    private getImagesForTab(tab: string): any[] {
        try {
            const imgState = tab === 'All'
                ? this.allBaseImages
                : (this.tabImageOverrides[tab] || this.allBaseImages);
            const images = Array.isArray(imgState?.images) ? imgState.images : [];
            return images.filter((x: any) => !!(x && (x.image || x.url || typeof x === 'string')));
        } catch (e) {
            return [];
        }
    }

    private getSelectedImagesForTab(tab: string): any[] {
        try {
            const imgState = tab === 'All'
                ? this.allBaseImages
                : (this.tabImageOverrides[tab] || this.allBaseImages);
            const allImages = Array.isArray(imgState?.images) ? imgState.images : [];
            const selectedIndices = imgState?.selectedIndices || new Set();
            
            return Array.from(selectedIndices)
                .sort((a, b) => a - b)
                .map(idx => allImages[idx])
                .filter(Boolean);
        } catch (e) {
            return [];
        }
    }

    private toJsDate(value: any): Date | null {
        if (!value) return null;
        if (value instanceof Date) return new Date(value.getTime());
        if (value && typeof (value as any).toDate === 'function') {
            try { return (value as any).toDate(); } catch (e) { }
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

    private parseTimeToHoursMinutes(timeStr: any): { hours: number; minutes: number } | null {
        if (timeStr == null) return null;
        const s = String(timeStr).trim();
        if (!s) return null;
        const m = s.match(/^\s*(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)?\s*$/i);
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

    private buildPublishPayload(): any | null {
        const raw = this.postForm.getRawValue();
        const goesLive = String(raw?.goesLive || 'now').toLowerCase();
        const publishNow = goesLive === 'now';
        const scheduledDt = publishNow ? null : this.getScheduledDateTimeForPublish();

        if (!publishNow) {
            if (!scheduledDt) {
                this.showInfoDialog('Please select both Publication Date and Time before scheduling.');
                return null;
            }
        }

        const selectedNames = Array.isArray(raw?.platformsSelected) ? raw.platformsSelected : [];
        const selectedPlatformsLower = selectedNames
            .map((p: any) => String(p || '').trim())
            .filter(Boolean)
            .map((p: string) => p.toLowerCase());

        const allConnectedPlatformsLower = (Array.isArray(this.platformsForDisplay) ? this.platformsForDisplay : [])
            .map((p: any) => String(p || '').trim())
            .filter(Boolean)
            .map((p: string) => p.toLowerCase());

        const platformIds: number[] = selectedPlatformsLower
            .map((nameLower) => this.platformIdByNameLower[nameLower])
            .filter((id) => id !== undefined && id !== null)
            .map((id) => Number(id))
            .filter((id) => isFinite(id));

        const platformContents: any[] = [];

        const allImages = this.getSelectedImagesForTab('All'); // Changed to use selected images only
        const allUploaded = Array.isArray(this.uploadedMediaByTab?.All) ? this.uploadedMediaByTab.All : [];
        const allDescPlain = htmlToSocialText(this.allBaseForm?.postDescription ?? raw?.postDescription ?? '');
        platformContents.push({
            platform_id: null,
            platform_name: null,
            content: allDescPlain,
            status: 'approved',
            images: allImages.map((img: any, idx: number) => ({
                image_key: String(allUploaded[idx]?.media_url ?? ''),
                prompt: String(img?.prompt ?? ''),
                image_type: img?.isManual ? 'uploaded' : 'generated',
                is_selected: true
            })).filter((x: any) => !!x.image_key)
        });

        for (const nameLower of allConnectedPlatformsLower) {
            const tabLabel = (Array.isArray(this.socialTabs) ? this.socialTabs.find(t => String(t || '').toLowerCase() === nameLower) : null) || nameLower;
            const mergedForm = { ...this.allBaseForm, ...(this.tabOverrides?.[tabLabel] || {}) };
            const descPlain = htmlToSocialText(mergedForm?.postDescription ?? '');
            const images = this.getSelectedImagesForTab(tabLabel); // Changed to use selected images only
            const uploaded = Array.isArray(this.uploadedMediaByTab?.[tabLabel]) ? this.uploadedMediaByTab[tabLabel] : [];

            platformContents.push({
                platform_id: this.platformIdByNameLower[nameLower] ?? null,
                platform_name: tabLabel,
                content: descPlain,
                status: 'approved',
                images: images.map((img: any, idx: number) => ({
                    image_key: String(uploaded[idx]?.media_url ?? ''),
                    prompt: String(img?.prompt ?? ''),
                    image_type: img?.isManual ? 'uploaded' : 'generated',
                    is_selected: true
                })).filter((x: any) => !!x.image_key)
            });
        }

        const products: Array<{ product_id: number; product_image_key: string }> = [];
        try {
            const productsData = this.buildProductsDataForForm();
            const rawSelected = this.postForm?.getRawValue()?.product;
            const selectedItems = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);

            for (const item of selectedItems) {
                const pid = item?.id ?? item?.productId ?? item?.product_id ?? item;
                if (pid == null || String(pid).trim() === '') continue;
                const pd = (productsData || []).find((p: any) => Number(p.product_id) === Number(pid));
                const imgs = (pd && Array.isArray(pd.images)) ? pd.images : [];
                if (imgs && imgs.length > 0) {
                    products.push({ product_id: Number(pid), product_image_key: String(imgs[0]) });
                }
            }
        } catch (e) {}

        const payload: any = {
            post_name: String(raw?.postName ?? '').trim(),
            post_type: 'manual',
            post_category: String(raw?.postCategory ?? '').trim(),
            products: products,
            platform_contents: platformContents,
            platform_ids: Array.from(new Set(platformIds)),
            publish_now: publishNow,
            scheduled_time: publishNow ? null : this.formatScheduledTimeForApi(scheduledDt as Date)
        };

        return payload;
    }

    private dataUrlToFile(dataUrl: string, filename: string): File | null {
        try {
            const m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
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

    private async uploadImagesForAllTabs(): Promise<any> {
        try { this.persistCurrentTabState(); } catch (e) { }

        const tabs = Array.isArray(this.socialTabs) && this.socialTabs.length ? this.socialTabs.slice() : ['All'];
        const uniqueUrls: string[] = [];
        const urlToIndex = new Map<string, number>();
        const perTabIndices: { [tab: string]: number[] } = {};

        for (const tab of tabs) {
            const images = this.getSelectedImagesForTab(tab); // Changed to use selected images only
            const indices: number[] = [];
            for (let i = 0; i < images.length; i++) {
                const u = String(images[i]?.image || images[i]?.url || images[i] || '').trim();
                if (!u) continue;
                if (!urlToIndex.has(u)) {
                    urlToIndex.set(u, uniqueUrls.length);
                    uniqueUrls.push(u);
                }
                indices.push(urlToIndex.get(u) as number);
            }
            perTabIndices[tab] = indices;
        }

        if (!uniqueUrls.length) {
            this.showInfoDialog('Please select at least one image before publishing/scheduling.');
            return null;
        }

        const files: File[] = [];
        for (let i = 0; i < uniqueUrls.length; i++) {
            const file = await this.urlToFile(uniqueUrls[i], `social-post-${i + 1}`);
            if (!file) {
                this.showInfoDialog('Failed to prepare one of the images for upload. Please try again.', 'Error');
                return null;
            }
            files.push(file);
        }

        const res: any = await this.apiService.uploadFiles(files);
        const uploaded = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.Data) ? res.Data : []);
        const byTab: { [tab: string]: any[] } = {};
        for (const tab of tabs) {
            const idxs = perTabIndices[tab] || [];
            byTab[tab] = idxs.map((k) => uploaded[k]).filter((x) => x !== undefined);
        }
        this.uploadedMediaByTab = byTab;

        return res;
    }

    private ensureImagesLocalForCurrentTab() {
        const tab = this.currentTab;
        if (tab === 'All') return;
        if (this.tabImageOverrides[tab]) return;
        this.tabImageOverrides[tab] = {
            images: this.cloneImages(this.generatedResults),
            selectedIndices: new Set(this.selectedResultIndices),
        };
        this.imagesDirtyForTab[tab] = true;
    }

    selectResult(index: number) {
        const tab = this.currentTab;
        if (tab !== 'All') this.ensureImagesLocalForCurrentTab();
        
        // Toggle selection
        if (this.selectedResultIndices.has(index)) {
            this.selectedResultIndices.delete(index);
        } else {
            this.selectedResultIndices.add(index);
        }

        // Update prompt based on first selected image
        const firstSelected = Array.from(this.selectedResultIndices).sort((a, b) => a - b)[0];
        if (firstSelected !== undefined && this.generatedResults[firstSelected]) {
            this.selectedPrompt = this.generatedResults[firstSelected].prompt || '';
        } else {
            this.selectedPrompt = '';
        }

        if (tab === 'All') {
            this.allBaseImages.selectedIndices = new Set(this.selectedResultIndices);
        } else {
            this.imagesDirtyForTab[tab] = true;
        }
        
        this.finalPostImageIndex = 0;
    }

    onPromptChange(val: string) {
        const tab = this.currentTab;
        this.selectedPrompt = val;

        if (this.selectedResultIndices.size > 0) {
            if (tab !== 'All') this.ensureImagesLocalForCurrentTab();
            
            // Update prompt for all selected images
            this.selectedResultIndices.forEach(idx => {
                if (this.generatedResults[idx]) {
                    this.generatedResults[idx].prompt = val;
                }
            });

            if (tab === 'All') {
                this.allBaseImages.images = this.cloneImages(this.generatedResults);
                for (const t of this.socialTabs) {
                    if (t === 'All') continue;
                    const override = this.tabImageOverrides[t];
                    if (override && Array.isArray(override.images)) {
                        this.selectedResultIndices.forEach(idx => {
                            if (override.images[idx]) {
                                override.images[idx] = { ...override.images[idx], prompt: val };
                            }
                        });
                    }
                }
            } else {
                this.imagesDirtyForTab[tab] = true;
            }
        } else {
            if (tab !== 'All') this.imagesDirtyForTab[tab] = true;
        }
    }
    deleteResult(index: number) {
        const tab = this.currentTab;
        if (tab !== 'All') this.ensureImagesLocalForCurrentTab();
        
        // Remove from selection if it was selected
        this.selectedResultIndices.delete(index);
        
        // Remove the image
        this.generatedResults.splice(index, 1);
    
        if (this.generatedResults.length === 0) {
            this.productImagesLockedAfterGenerate = false;
        }
        
        // Adjust indices in the selection set (shift down indices after deleted one)
        const updatedIndices = new Set<number>();
        this.selectedResultIndices.forEach(idx => {
            if (idx > index) {
                updatedIndices.add(idx - 1);
            } else {
                updatedIndices.add(idx);
            }
        });
        this.selectedResultIndices = updatedIndices;
        
        // Update prompt
        const firstSelected = Array.from(this.selectedResultIndices).sort((a, b) => a - b)[0];
        if (firstSelected !== undefined && this.generatedResults[firstSelected]) {
            this.selectedPrompt = this.generatedResults[firstSelected].prompt || '';
        } else {
            this.selectedPrompt = '';
        }

        if (tab === 'All') {
            this.allBaseImages = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
        } else {
            this.imagesDirtyForTab[tab] = true;
        }
        
        this.finalPostImageIndex = 0;
    }

    private buildProductsDataForForm(): Array<{ product_id: number; images: string[] }> {
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

        const rawSelected = this.postForm?.getRawValue()?.product;
        const selectedIds: any[] = [];
        if (Array.isArray(rawSelected)) {
            for (const p of rawSelected) {
                if (p == null) continue;
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
    }

    private extractSelectedProductIds(): string {
        try {
            const raw = this.postForm.getRawValue();
            const selected = Array.isArray(raw?.product) ? raw.product : [];
            const ids = selected
                .map((x: any) => x?.id ?? x?.product_id ?? x?.productId ?? x)
                .filter((v: any) => v !== undefined && v !== null && String(v).trim() !== '')
                .map((v: any) => String(v).trim());
            return ids.join(',');
        } catch (e) {
            return '';
        }
    }

    generate() {
        if (this.isLoading) return;

        const tab = this.currentTab;
        if (tab !== 'All') this.ensureImagesLocalForCurrentTab();

        if (!this.validateGenerateRequiredFields()) return;

        const postCategory = String(this.postForm.getRawValue()?.postCategory ?? '').trim();
        const prompt = String(this.selectedPrompt ?? '').trim();

        const formData = new FormData();
        const productsData = this.buildProductsDataForForm();
        formData.append('products_data', JSON.stringify(productsData));
        formData.append('prompt', prompt);
        formData.append('post_category', postCategory);
        formData.append('aspect_ratio', '1:1');

        try {
            const files = Array.isArray(this.selectedAttachments) ? this.selectedAttachments.slice(0, 3) : [];
            files.forEach((att: any) => {
                const f: File | undefined = att?.file;
                if (f) formData.append('uploaded_images', f, f.name);
            });
        } catch (e) { }

        this.isLoading = true;
        this.detailsApi.generateManualPostImages(formData).subscribe({
            next: (res: any) => {
                try {
                    const imgs = Array.isArray(res?.images)
                        ? res.images
                        : (Array.isArray(res?.data?.images) ? res.data.images : (Array.isArray(res?.generated_images) ? res.generated_images : []));

                    const mapped = Array.isArray(imgs)
                        ? imgs.map((img: any) => {
                            const key = img?.image_key ?? img?.key ?? img?.imageKey ?? img?.id ?? '';
                            const base64 = img?.data ?? img?.image_data ?? null;
                            const mime = img?.mime_type ?? img?.mimeType ?? 'image/png';
                            const url = base64
                                ? `data:${mime};base64,${base64}`
                                : (img?.image_url ?? img?.url ?? (key ? `${this.productImageBaseUrl}${key}` : ''));
                            return {
                                image: url,
                                alt: key || 'N/A',
                                prompt: img?.prompt ?? prompt,
                            };
                        })
                        : [];

                    const content = res?.content ?? res?.data?.content ?? res?.description ?? res?.data?.description ?? null;
                    if (content) {
                        try {
                            const html = formatGeneratedContentToHtml(content);
                            try { this.postForm.get('postDescription')?.setValue(html, { emitEvent: false }); } catch (e) { }
                            if (tab === 'All') {
                                try {
                                    this.allBaseForm = { ...this.allBaseForm, postDescription: html };
                                } catch (e) { }
                            } else {
                                try {
                                    if (!this.tabOverrides[tab]) this.tabOverrides[tab] = {};
                                    this.tabOverrides[tab].postDescription = html;
                                } catch (e) { }
                            }
                        } catch (e) { }
                    }

                    // Add new images to existing ones (don't replace)
                    const startIndex = this.generatedResults.length;
                    this.generatedResults = [...this.generatedResults, ...mapped];
                    
                    // Select all newly added images by default
                    for (let i = startIndex; i < this.generatedResults.length; i++) {
                        this.selectedResultIndices.add(i);
                    }

                    if (tab === 'All') {
                        this.allBaseImages = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
                        for (const t of this.socialTabs) {
                            if (t === 'All') continue;
                            this.tabImageOverrides[t] = null;
                            this.imagesDirtyForTab[t] = false;
                        }
                    } else {
                        this.tabImageOverrides[tab] = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
                        this.imagesDirtyForTab[tab] = true;
                    }
                    
                    this.finalPostImageIndex = 0;
                } catch (e) {
                    console.warn('Failed to process generate images response', e);
                }
                
                this.productImagesLockedAfterGenerate = true;
                
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Generate images failed', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }
    saveSocialTab() {
        this.persistCurrentTabState();
    }

    private persistCurrentTabState() {
        const tab = this.currentTab;
        const currentForm = this.pickFormState();
        if (tab === 'All') {
            this.allBaseForm = { ...this.allBaseForm, ...currentForm };
            this.allBaseImages = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
            return;
        }

        if (!this.tabOverrides[tab]) this.tabOverrides[tab] = {};
        for (const key of Object.keys(currentForm)) {
            if (this.allOnlyEditableFields.includes(key)) continue;
            const baseVal = this.allBaseForm[key];
            const curVal = currentForm[key];
            const same = this.isSameValueForKey(key, baseVal, curVal);
            if (same) delete this.tabOverrides[tab][key];
            else this.tabOverrides[tab][key] = curVal;
        }

        if (this.imagesDirtyForTab[tab]) {
            this.tabImageOverrides[tab] = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
        } else {
            this.tabImageOverrides[tab] = null;
        }
    }

    private loadStateForTab(tab: string) {
        const mergedForm = tab === 'All'
            ? this.allBaseForm
            : { ...this.allBaseForm, ...(this.tabOverrides[tab] || {}) };
        this.applyFormState(mergedForm);

        const imgState = tab === 'All'
            ? this.allBaseImages
            : (this.tabImageOverrides[tab] || this.allBaseImages);
        this.generatedResults = this.cloneImages(imgState?.images || []);
        this.selectedResultIndices = new Set(imgState?.selectedIndices || []);

        const firstSelected = Array.from(this.selectedResultIndices).sort((a, b) => a - b)[0];
        const sel = firstSelected !== undefined ? this.generatedResults[firstSelected] : null;
        this.selectedPrompt = sel ? (sel.prompt || '') : '';
        this.imagesDirtyForTab[tab] = false;
        this.finalDescriptionHtml = this.computeSanitizedHtml(this.postForm.get('postDescription')?.value);
        this.finalPostImageIndex = 0;
        try {
            this.productImagesForDisplay = this.buildProductImageTiles(this.postForm.get('product')?.value);
            this.productImagesPageIndex = 0;
        } catch (e) { }

        this.updateFieldEditabilityForTab(tab);
    }

    onTabChange(event: any) {
        const previousTab = this.activeTabLabel;
        try {
            this.persistCurrentTabState();
        } catch (e) { }

        this.selectedTabIndex = event.index !== undefined ? event.index : event;
        this.activeTabLabel = (this.socialTabs && this.socialTabs.length > 0)
            ? (this.socialTabs[this.selectedTabIndex] || 'All')
            : 'All';
        try {
            this.loadStateForTab(this.activeTabLabel);
        } catch (e) { }
        this.cdr.detectChanges();
    }

    onFileSelected(event: any) {
        const tab = this.currentTab;
        if (tab !== 'All') this.ensureImagesLocalForCurrentTab();
        const file = event?.target?.files && event.target.files[0];
        if (!file) return;
        // enforce max 3 uploads
        if (!this.generatedResults) this.generatedResults = [];
        if (this.generatedResults.length >= 3) {
            // ignore additional uploads
            return;
        }
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const dataUrl = e.target.result;
            this.generatedResults.push({ image: dataUrl, prompt: '' });
            const newIndex = this.generatedResults.length - 1;
            this.selectedResultIndices.add(newIndex);
            this.selectedPrompt = '';

            if (tab === 'All') {
                this.allBaseImages = { images: this.cloneImages(this.generatedResults), selectedIndices: new Set(this.selectedResultIndices) };
            } else {
                this.imagesDirtyForTab[tab] = true;
            }

            this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
    }

    discard() {
        try {
            this.postForm.reset({
                postName: '',
                postCategory: '',
                product: [],
                creationType: 'Manual',
                productLink: '',
                postDescription: '',
                platforms: this.postForm.get('platforms')?.value || [],
                platformsSelected: [],
                publicationDateTime: this.formatDateForInput(this.minPublicationDate),
                publicationTime: '',
                goesLive: 'now',
                goalLine: ''
            }, { emitEvent: false });
            this.generatedResults = [];
            this.selectedResultIndices.clear();
            this.selectedImage = null;
            this.selectedAttachments = [];
            this.tabOverrides = {};
            this.tabImageOverrides = {};
            this.imagesDirtyForTab = {};
            this.uploadedMediaByTab = {};

            this.navigateToSocialPostsList();
        } catch (e) {
            this.navigateToSocialPostsList();
        }
    }

    async onPublishClick() {
        if (this.isLoading) return;

        if (!this.validateCreatePublishRequiredFields()) return;

        const goesLive = String(this.postForm.getRawValue()?.goesLive || 'now').toLowerCase();
        const publishNow = goesLive === 'now';
        const confirmed = await this.confirmDialog(
            publishNow ? 'Confirm Publish' : 'Confirm Schedule',
            publishNow
                ? 'Are you sure you want to publish this post?'
                : 'Are you sure you want to schedule this post?'
            ,
            publishNow ? 'Publish' : 'Schedule'
        );
        if (!confirmed) return;

        this.isLoading = true;
        try {
            const res = await this.uploadImagesForAllTabs();
            if (!res) return;

            const payload = this.buildPublishPayload();
            if (!payload) return;

            await firstValueFrom(this.detailsApi.createSocialPost(payload));
            try { this.toastr.success('Post created successfully.'); } catch (e) { }
            this.navigateToSocialPostsList();
        } catch (err: any) {
            console.error('Publish flow failed', err);
            try { this.toastr.error('Failed to create post'); } catch (e) { }
        } finally {
            this.isLoading = false;
            try { this.cdr.detectChanges(); } catch (e) { }
        }
    }
}
