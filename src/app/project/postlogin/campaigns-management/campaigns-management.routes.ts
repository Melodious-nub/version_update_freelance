import { Routes } from '@angular/router';
import { CampaignsManagementComponent } from './campaigns-management.component';
import { CreateCampaignComponent } from './create-campaign.component';
import { CampaignDetailComponent } from './campaign-detail.component';
import { CampaignHistoryComponent } from './campaign-history.component';

export const CAMPAIGNS_MANAGEMENT_ROUTES: Routes = [
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
