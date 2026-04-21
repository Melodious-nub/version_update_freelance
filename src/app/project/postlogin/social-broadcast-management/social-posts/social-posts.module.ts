
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialPostsComponent } from './social-posts.component';
import { SocialPostsListComponent } from './social-posts-list/social-posts-list.component';
import { SocialPostsRoutingModule } from './social-posts-routing.module';
import { FilterBoxComponent } from './social-posts-list/filter-box/filter-box.component';
import { SocialPostDetailComponent } from './social-post-detail.component';
import { SocialPostCreateComponent } from './social-post-create.component';

@NgModule({
  declarations: [
    SocialPostsComponent,
    SocialPostsListComponent,
    FilterBoxComponent,
    SocialPostDetailComponent,
    SocialPostCreateComponent
  ],
  imports: [
    CommonModule,
    SocialPostsRoutingModule,
    SharedModule,
    RouterModule
  ],
  exports: [SocialPostsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class SocialPostsModule { }
