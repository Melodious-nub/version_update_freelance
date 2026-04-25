import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SeoService } from './seo.service';

@Injectable({ providedIn: 'root' })
export class SeoGuard implements CanActivate {
  constructor(private seo: SeoService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const title = route.data['title'] || 'Default Title';
    const metaTags = route.data['metaTags'] || [];
    this.seo.updateTitle(title);
    this.seo.updateMetaTags(metaTags);
    return true;
  }
}
