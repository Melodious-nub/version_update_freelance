import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocialPostsComponent } from './social-posts.component';
import { SocialPostsListComponent } from './social-posts-list/social-posts-list.component';
import { SocialPostDetailComponent } from './social-post-detail.component';
import { SocialPostCreateComponent } from './social-post-create.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocialPostsRoutingModule { }
