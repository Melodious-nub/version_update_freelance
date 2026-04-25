import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);


  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateMetaTags(tags: any[]) {
    tags.forEach(tag => {
      this.meta.updateTag(tag);
    });
  }
}
