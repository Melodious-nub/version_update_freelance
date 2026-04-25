import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-social-posts',
    templateUrl: './social-posts.component.html',
    styleUrls: ['./social-posts.component.scss'],
    imports: [RouterOutlet]
})
export class SocialPostsComponent {

  constructor() { }

}
