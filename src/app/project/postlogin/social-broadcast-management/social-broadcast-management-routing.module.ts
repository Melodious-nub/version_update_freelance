import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialBroadcastManagementComponent } from './social-broadcast-management.component';

const routes: Routes = [
  {
    path: '',
    component: SocialBroadcastManagementComponent,
    children: [
      {
        path: 'social-posts',
        loadChildren: () =>
          import('./social-posts/social-posts.module').then((m) => m.SocialPostsModule)
      },
      {
        path: 'campaigns',
        loadChildren: () =>
          import('../campaigns-management/campaigns-management.module').then((m) => m.CampaignsManagementModule)
      },
      {
        path: '',
        redirectTo: 'social-posts',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialBroadcastManagementRoutingModule { }
