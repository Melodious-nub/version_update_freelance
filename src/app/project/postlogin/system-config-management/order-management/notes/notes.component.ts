import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class NotesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}


  
}
