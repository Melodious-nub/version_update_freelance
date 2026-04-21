import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent implements OnInit {

  constructor(
    private router: Router,
    private location: LocationStrategy
  ) {
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
      this.router.navigate(['/signin'],  {replaceUrl:true});
  });
  }

  ngOnInit(): void {
  }

  onClick(){
    this.router.navigate(['/signin'],  {replaceUrl:true});
  }

}
