import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SocialBroadcastDetailsApiService } from './social-broadcast-details-api.service';

@Injectable({
  providedIn: 'root',
})
export class SocialPostsDetailsService {
  constructor(private api: SocialBroadcastDetailsApiService) { }

  getSocialPostDetails(id: string | number): Observable<any> {
    return this.api.getSocialPostDetails(id).pipe(
      map((item: any) => ({
        id: item.id ?? 'N/A',
        postName: item.post_name ?? item.postName ?? 'N/A',
        postCategory: item.post_category ?? item.postCategory ?? 'N/A',
        postType: item.post_type ?? item.postType ?? 'N/A',
        status: item.status ?? 'N/A',
        stage: item.stage ?? 'N/A',
        publicationDate: item.publication_date ?? item.publicationDate ?? null,
        publishAccounts: Array.isArray(item.publication_platforms) && item.publication_platforms.length > 0
          ? item.publication_platforms
          : (Array.isArray(item.platform_contents) ? item.platform_contents.map((pc: any) => pc.platform_name).filter(Boolean) : (item.publish_accounts ?? [])),
        createdAt: item.created_at ?? item.createdAt ?? 'N/A',
        updatedAt: item.updated_at ?? item.updatedAt ?? 'N/A',
        product: (() => {
          if (Array.isArray(item.product) && item.product.length) {
            return item.product.map((p: any) => ({
              product_id: p?.product_id ?? p?.productId ?? p?.id ?? null,
              product_name: p?.product_name ?? p?.productName ?? p?.name ?? null,
              product_images: Array.isArray(p?.product_images)
                ? p.product_images
                : (Array.isArray(p?.productImages) ? p.productImages : (p?.image ? [p.image] : [])),
              product_link: p?.product_link ?? p?.productLink ?? p?.link ?? ''
            }));
          }

          // Legacy shapes: try to synthesize an array
          const ids = Array.isArray(item.product_ids) ? item.product_ids : (item.product_id ? [item.product_id] : []);
          const namesRaw = Array.isArray(item.product_names) ? item.product_names : (item.product_name ?? item.productName ?? '');
          const names = Array.isArray(namesRaw) ? namesRaw : String(namesRaw || '').split(/\s*,\s*|\r?\n/g);
          const linksRaw = Array.isArray(item.product_links) ? item.product_links : (item.product_link ?? item.productLink ?? '');
          const links = Array.isArray(linksRaw) ? linksRaw : String(linksRaw || '').split(/\s*,\s*|\r?\n/g);
          const imgsRaw = Array.isArray(item.product_images) ? item.product_images : (item.product_image ? [item.product_image] : []);

          const max = Math.max(ids.length, names.length, links.length, imgsRaw.length, 0);
          const out: any[] = [];
          for (let i = 0; i < max; i++) {
            out.push({
              product_id: ids[i] ?? null,
              product_name: names[i] ? String(names[i]).trim() : null,
              product_images: Array.isArray(imgsRaw[i]) ? imgsRaw[i] : (imgsRaw[i] ? [imgsRaw[i]] : []),
              product_link: links[i] ? String(links[i]).trim() : ''
            });
          }
          return out;
        })(),
        sourceImageKey: item.source_image_key ?? item.sourceImageKey ?? 'N/A',
        generatedImages: (() => {
          const pcs = Array.isArray(item.platform_contents) ? item.platform_contents : [];
          if (pcs.length > 0) {
            const allPc = pcs.find((pc: any) => !pc.platform_name) || pcs[0];
            const imgs = Array.isArray(allPc?.images) ? allPc.images : [];
            return imgs.map((img: any) => ({ image_key: img.image_key, prompt: img.prompt }));
          }
          return (item.generated_images ?? item.generatedImages ?? []);
        })(),
        contents: Array.isArray(item.platform_contents) && item.platform_contents.length > 0
          ? item.platform_contents.map((pc: any) => ({ content: pc.content ?? '' }))
          : (item.contents ?? []),
        platformContents: item.platform_contents ?? [],
      }))
    );
  }

  approveSocialPost(id: string | number, body: any): Observable<any> {
    return this.api.approveSocialPost(id, body).pipe(
      tap(() => {
        // no-op tap to allow callers to react; could add further mapping if needed
      })
    );
  }

  updatePostContent(contentId: string | number, body: any): Observable<any> {
    // delegate to lower-level API service; the API client is expected to expose this method
    return this.api.updatePostContent(contentId, body).pipe(
      tap(() => {
        // no-op; callers will handle UI updates
      })
    );
  }

  regenerateImage(contentId: string | number, body: any): Observable<any> {
    return this.api.regenerateImage(contentId, body).pipe(
      tap(() => {
        // no-op; caller will update UI
      })
    );
  }

  rejectSocialPost(id: string | number): Observable<any> {
    return this.api.rejectSocialPost(id).pipe(
      tap(() => {
        // no-op
      })
    );
  }

  deleteSocialPost(id: string | number): Observable<any> {
    return this.api.deleteSocialPost(id).pipe(
      tap(() => {
        // no-op; caller will refresh UI
      })
    );
  }

  publishSocialPost(postGenerationId: string | number, params: any): Observable<any> {
    return this.api.publishSocialPost(postGenerationId, params).pipe(
      tap(() => {
        // no-op
      })
    );
  }
}
