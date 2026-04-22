
import { Routes } from '@angular/router';
import { SocialBroadcastManagementComponent } from './social-broadcast-management.component';

export const SOCIAL_BROADCAST_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    component: SocialBroadcastManagementComponent,
    children: [
      {
        path: 'social-posts',
        loadChildren: () => import('./social-posts/social-posts.routes').then(m => m.SOCIAL_POSTS_ROUTES)
      },
      {
        path: 'campaigns',
        loadChildren: () => import('../campaigns-management/campaigns-management.routes').then(m => m.CAMPAIGNS_MANAGEMENT_ROUTES)
      },
      {
        path: '',
        redirectTo: 'social-posts',
        pathMatch: 'full'
      }
    ]
  }
];
