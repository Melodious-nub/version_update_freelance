import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private router: Router, private tokenService: TokenService) { }

  ngOnInit(): void {
    const businessAccountId = this.tokenService.getBusinessAccountIdToken();
    if(businessAccountId== null || businessAccountId==''){
      this.navigate("/home/business-details");
    }
  }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

}
