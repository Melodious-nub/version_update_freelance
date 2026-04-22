import { Routes } from '@angular/router';

export const INVENTORY_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inventoryin',
    pathMatch: 'full'
  },
  {
    path: 'inventoryin',
    loadChildren: () => import('./inventoryin/inventoryin.routes').then(m => m.INVENTORY_IN_ROUTES)
  },
  {
    path: 'inventoryout',
    loadChildren: () => import('./inventoryout/inventoryout.routes').then(m => m.INVENTORY_OUT_ROUTES)
  },
];
