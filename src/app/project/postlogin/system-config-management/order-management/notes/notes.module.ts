import { SharedModule } from 'src/app/shared/shared.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesListComponent } from './notes-list/notes-list.component';
import { CreateNoteComponent } from './create-note/create-note.component';

@NgModule({
  declarations: [
    NotesListComponent,
    CreateNoteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    NotesRoutingModule
  ],
  exports: [NotesListComponent, CreateNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class NotesModule { }
