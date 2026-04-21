import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateMetaTags(tags: any[]) {
    tags.forEach(tag => {
      this.meta.updateTag(tag);
    });
  }
}
