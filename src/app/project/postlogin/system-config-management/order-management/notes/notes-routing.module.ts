import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNoteComponent } from './create-note/create-note.component';


const routes: Routes = [
  {
    path: 'add',
    component: CreateNoteComponent
  },
  {
    path: 'edit/:id',
    component: CreateNoteComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotesRoutingModule { }
