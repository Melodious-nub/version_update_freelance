import { Routes } from '@angular/router';
import { CreateNoteComponent } from './create-note/create-note.component';

export const NOTES_ROUTES: Routes = [
  {
    path: 'add',
    component: CreateNoteComponent
  },
  {
    path: 'edit/:id',
    component: CreateNoteComponent
  }
];
