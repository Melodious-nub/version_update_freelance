import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-product-type',
    templateUrl: './product-type.component.html',
    styleUrls: ['./product-type.component.scss']
})
export class ProductTypeComponent implements OnInit {

    currentMainIndex: number = 0;
    mainTab: Array<any> = [
        {
            id: 1,
            title: 'Type Details',
            link: '/product-details',
            badge: 0,
            index: 0
        },
        {
            id: 2,
            title: 'SubType Details',
            link: '/subtype-list',
            badge: 0,
            index: 1
        }
    ];

    constructor(private router: Router,public route:ActivatedRoute) {
    }

    ngOnInit(): void {
       
    }

    changeMainTab(event: any) {
        this.currentMainIndex = event;
        // this.navigateToUrl();
    }

    navigateToUrl() {
        this.router.navigate(['/home/product-management/product-type' + this.mainTab[this.currentMainIndex].link]);
    }

}
