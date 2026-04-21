import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CampaignsManagementRoutingModule } from './campaigns-management-routing.module';
import { CampaignsManagementComponent } from './campaigns-management.component';
import { CreateCampaignComponent } from './create-campaign.component';
import { CampaignDetailComponent } from './campaign-detail.component';
import { CampaignHistoryComponent } from './campaign-history.component';
import { CampaignFilterBoxComponent } from './filter-box/campaign-filter-box.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CampaignsManagementComponent, CreateCampaignComponent, CampaignDetailComponent, CampaignHistoryComponent, CampaignFilterBoxComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SharedModule, CampaignsManagementRoutingModule],
})
export class CampaignsManagementModule {}
