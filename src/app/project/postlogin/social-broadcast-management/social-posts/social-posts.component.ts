import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-social-posts',
    templateUrl: './social-posts.component.html',
    styleUrls: ['./social-posts.component.scss'],
    standalone: true,
    imports: [RouterOutlet]
})
export class SocialPostsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
