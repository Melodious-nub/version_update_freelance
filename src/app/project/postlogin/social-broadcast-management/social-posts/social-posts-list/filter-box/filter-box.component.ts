import { Component, HostListener, OnInit, inject, input, output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialPostItem } from 'src/app/model/social-broadcast/social-post.model';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-filter-box',
    templateUrl: './filter-box.component.html',
    styleUrls: ['./filter-box.component.scss'],
    imports: [MatIcon, DadyinButtonComponent, FormsModule, ReactiveFormsModule, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle]
})
export class FilterBoxComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);

  readonly posts = input<SocialPostItem[]>([]);
  readonly emitFilterPosts = output<any>();
  readonly filtersApplied = output<{
    status?: string;
    post_type?: string;
    selectedCategory?: string;
}>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    this.openFilter = false;
  }

  openFilter = false;
  filterForm: UntypedFormGroup;
  filterCount = 0;
  postCategories: string[] = [];
  creationTypes = ['Automate', 'Manual'];
  statuses = ['Draft', 'Approved', 'Scheduled', 'Rejected', 'Published'];
  platforms = ['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'tiktok'];

  constructor() {
    this.filterForm = this.fb.group({
      statusDraft: [false],
      statusApproved: [false],
      statusScheduled: [false],
      statusRejected: [false],
      statusPublished: [false],
      typeAutomatic: [false],
      typeManual: [false],
      platformInstagram: [false],
      platformFacebook: [false],
      platformLinkedin: [false],
      platformYoutube: [false],
      platformTwitter: [false],
      platformTiktok: [false],
      selectedCategory: ['']
    });
  }

  ngOnInit(): void {
    this.extractCategories();
    this.filterForm.valueChanges.subscribe(() => {
      this.updateFilterCount();
    });
    if (this.creationTypes && this.creationTypes.length === 2) {
      const autoCtrl = this.filterForm.get('typeAutomatic');
      const manualCtrl = this.filterForm.get('typeManual');
      if (autoCtrl && manualCtrl) {
        autoCtrl.valueChanges.subscribe((val: boolean) => {
          if (val && manualCtrl.value) {
            manualCtrl.setValue(false, { emitEvent: false });
          }
        });
        manualCtrl.valueChanges.subscribe((val: boolean) => {
          if (val && autoCtrl.value) {
            autoCtrl.setValue(false, { emitEvent: false });
          }
        });
      }
    }
  }

  extractCategories(): void {
    const categoriesSet = new Set<string>();
    this.posts().forEach(post => {
      if (post.postCategory) {
        categoriesSet.add(post.postCategory);
      }
    });
    this.postCategories = Array.from(categoriesSet).sort();
  }

  updateFilterCount(): void {
    const formValues = this.filterForm.value;
    this.filterCount = 0;
    if (formValues.statusDraft) this.filterCount++;
    if (formValues.statusApproved) this.filterCount++;
    if (formValues.statusScheduled) this.filterCount++;
    if (formValues.statusRejected) this.filterCount++;
    if (formValues.statusPublished) this.filterCount++;
    if (formValues.typeAutomatic) this.filterCount++;
    if (formValues.typeManual) this.filterCount++;
    if (formValues.platformInstagram) this.filterCount++;
    if (formValues.platformFacebook) this.filterCount++;
    if (formValues.platformLinkedin) this.filterCount++;
    if (formValues.platformYoutube) this.filterCount++;
    if (formValues.platformTwitter) this.filterCount++;
    if (formValues.platformTiktok) this.filterCount++;
    if (formValues.selectedCategory) this.filterCount++;
  }

  apply(): void {
    const formValues = this.filterForm.value;
    let filteredPosts = [...this.posts()];
    const selectedStatuses: string[] = [];
    if (formValues.statusDraft) selectedStatuses.push('Draft');
    if (formValues.statusApproved) selectedStatuses.push('Approved');
    if (formValues.statusScheduled) selectedStatuses.push('Scheduled');
    if (formValues.statusRejected) selectedStatuses.push('Rejected');
    if (formValues.statusPublished) selectedStatuses.push('Published');

    if (selectedStatuses.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        selectedStatuses.includes(post.status)
      );
    }

    const selectedTypes: string[] = [];
    if (formValues.typeAutomatic) selectedTypes.push('Automate');
    if (formValues.typeManual) selectedTypes.push('Manual');

    if (selectedTypes.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        selectedTypes.includes(post.creationType)
      );
    }

    const selectedPlatforms: string[] = [];
    if (formValues.platformInstagram) selectedPlatforms.push('instagram');
    if (formValues.platformFacebook) selectedPlatforms.push('facebook');
    if (formValues.platformLinkedin) selectedPlatforms.push('linkedin');
    if (formValues.platformYoutube) selectedPlatforms.push('youtube');
    if (formValues.platformTwitter) selectedPlatforms.push('twitter');
    if (formValues.platformTiktok) selectedPlatforms.push('tiktok');

    if (selectedPlatforms.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.publicationPlatforms.some(platform => 
          selectedPlatforms.includes(platform)
        )
      );
    }

    if (formValues.selectedCategory) {
      filteredPosts = filteredPosts.filter(post => 
        post.postCategory === formValues.selectedCategory
      );
    }

    this.emitFilterPosts.emit(filteredPosts);
    this.filtersApplied.emit({
      status: selectedStatuses.length ? selectedStatuses.map((s) => String(s).toLowerCase()).join(',') : undefined,
      post_type: selectedTypes.length ? selectedTypes.map((s) => String(s).toLowerCase()).join(',') : undefined,
      selectedCategory: formValues.selectedCategory ? String(formValues.selectedCategory) : undefined,
    });
    this.openFilter = false;
  }

  clearFilter(): void {
    this.filterForm.reset({
      statusDraft: false,
      statusApproved: false,
      statusScheduled: false,
      statusRejected: false,
      statusPublished: false,
      typeAutomatic: false,
      typeManual: false,
      platformInstagram: false,
      platformFacebook: false,
      platformLinkedin: false,
      platformYoutube: false,
      platformTwitter: false,
      platformTiktok: false,
      selectedCategory: ''
    });
    this.filterCount = 0;
    this.emitFilterPosts.emit([...this.posts()]);
    this.filtersApplied.emit({});
    this.openFilter = false;
  }
}
