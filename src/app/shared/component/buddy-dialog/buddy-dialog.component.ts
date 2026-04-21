import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';

@Component({
    selector: 'app-buddy-dialog',
    templateUrl: './buddy-dialog.component.html',
    styleUrls: ['./buddy-dialog.component.scss']
})
export class BuddyDialogComponent implements OnInit {
    public buddyDetails: any[]
    public orderValue: any
    constructor(public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.buddyDetails = this.data?.buddyAccounts;
        this.orderValue = this.data.cost;
    }

    inviteBuddy() {
        this.dialog.open(InviteDialogComponent, {
            data: {
                "redirectType": "QUICK_CHECKOUT",
                "redirectReferenceId": this.data.id,
                // "data": this.data
            }
        });
    }

    deleteBuddy(buddy) {
        const index = this.buddyDetails.indexOf(buddy);
        var x = this.buddyDetails.splice(index, 1);
    }

    close() {
        this.dialog.closeAll();
    }

}
