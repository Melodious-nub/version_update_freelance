import { Routes } from '@angular/router';
import { SocialPostsComponent } from './social-posts.component';
import { SocialPostsListComponent } from './social-posts-list/social-posts-list.component';
import { SocialPostCreateComponent } from './social-post-create.component';
import { SocialPostDetailComponent } from './social-post-detail.component';

export const SOCIAL_POSTS_ROUTES: Routes = [
  {
    path: '',
    component: SocialPostsComponent,
    children: [
      {
        path: '',
        component: SocialPostsListComponent
      },
      {
        path: 'create',
        component: SocialPostCreateComponent
      },
      {
        path: 'detail/:id',
        component: SocialPostDetailComponent
      }
    ]
  }
];
