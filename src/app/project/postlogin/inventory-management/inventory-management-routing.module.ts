import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryManagementComponent } from './inventory-management.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component:InventoryManagementComponent
  // },
  {
    path: '',
    redirectTo: 'inventoryin'
  },
  {
    path: 'inventoryin', loadChildren: () =>
    import('./inventoryin/inventoryin.module').then((m) => m.InventoryinModule)
  },
  {
    path: 'inventoryout', loadChildren: () =>
    import('./inventoryout/inventoryout.module').then((m) => m.InventoryoutModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryManagementRoutingModule {}
