import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';


import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-postlogin',
    templateUrl: './postlogin.component.html',
    styleUrls: ['./postlogin.component.scss'],
    standalone: true,
    imports: [HeaderComponent, RouterOutlet, CommonModule],
})
export class PostloginComponent implements OnInit {
 
  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    console.log('PostloginComponent Initialized');
  }


  

}
