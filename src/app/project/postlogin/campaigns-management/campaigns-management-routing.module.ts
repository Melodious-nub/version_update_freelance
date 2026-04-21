import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignsManagementComponent } from './campaigns-management.component';
import { CreateCampaignComponent } from './create-campaign.component';
import { CampaignDetailComponent } from './campaign-detail.component';
import { CampaignHistoryComponent } from './campaign-history.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignsManagementComponent,
  },
  {
    path: 'create',
    component: CreateCampaignComponent,
  },
  {
    path: 'detail/:id',
    component: CampaignDetailComponent,
  },
  {
    path: 'history/:id',
    component: CampaignHistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsManagementRoutingModule {}
