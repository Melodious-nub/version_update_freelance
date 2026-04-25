
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocialPostItem } from 'src/app/model/social-broadcast/social-post.model';
import { SocialBroadcastApiService } from './social-broadcast-api.service';
import { version } from 'os';

@Injectable({
  providedIn: 'root'
})
export class SocialPostsService {
  private api = inject(SocialBroadcastApiService);


  // Get all social posts from API
  getSocialPosts(
    page = 1,
    pageSize = 10,
    filters?: { status?: string; post_type?: string }
  ): Observable<{ items: SocialPostItem[]; totalElements: number; totalPages: number }> {
    return this.api.getSocialPosts(page, pageSize, filters).pipe(
      map((res: any) => {
        const rawItems = Array.isArray(res?.items) ? res.items : [];
        const items = rawItems.map((item: any) => ({
          id: item.id ?? 'N/A',
          postName: item.post_name ?? 'N/A',
          postCategory: item.post_category ?? 'N/A',
          creationType: item.post_type ?? 'N/A',
          publicationPlatforms: item.publication_platforms ?? [],
          publicationDateTime: item.publication_date,
          views: item.views ?? 'N/A',
          clicks: item.clicks ?? 'N/A',
          status: item.status ?? 'N/A',
          product: Array.isArray(item.product_name) ? item.product_name.join(', ') : item.product_name ?? 'N/A',
          captions: item.captions ?? [],
          stage: item.stage ?? 'N/A',
          createdAt: item.created_at ?? 'N/A',
          productId: item.product_id ?? 'N/A',
          date: item.created_at ?? 'N/A',
        }));

        const totalElements =
          Number(res?.totalElements ?? res?.total_elements ?? res?.total ?? items.length) ||
          items.length;
        const totalPages = Number(res?.totalPages ?? res?.total_pages ?? 1) || 1;

        return { items, totalElements, totalPages };
      })
    );
  }

  // Get social posts for a given product id
  getSocialPostsByProduct(
    productId: any,
    page = 1,
    pageSize = 20,
    filters?: { status?: string; post_type?: string }
  ): Observable<{ items: SocialPostItem[]; totalElements: number; totalPages: number }> {
    return this.api.getSocialPostsByProduct(productId, page, pageSize, filters).pipe(
      map((res: any) => {
        const rawItems = Array.isArray(res?.items) ? res.items : [];
        const items = rawItems.map((item: any) => ({
          id: item.id ?? 'N/A',
          postName: item.post_name ?? 'N/A',
          postCategory: item.post_category ?? 'N/A',
          creationType: item.post_type ?? 'N/A',
          publicationPlatforms: item.publication_platforms ?? [],
          publicationDateTime: item.publication_date,
          views: item.views ?? 'N/A',
          clicks: item.clicks ?? 'N/A',
          status: item.status ?? 'N/A',
          product: Array.isArray(item.product_name) ? item.product_name.join(', ') : item.product_name ?? 'N/A',
          captions: item.captions ?? [],
          stage: item.stage ?? 'N/A',
          version: item.version ?? 'N/A',
          createdAt: item.created_at ?? 'N/A',
          productId: item.product_id ?? 'N/A',
          date: item.created_at ?? 'N/A',
        }));

        const totalElements = Number(res?.total ?? res?.totalElements ?? res?.total_elements ?? items.length) || items.length;
        const totalPages = Math.ceil((res?.total ?? items.length) / pageSize) || 1;

        return { items, totalElements, totalPages };
      })
    );
  }
}
