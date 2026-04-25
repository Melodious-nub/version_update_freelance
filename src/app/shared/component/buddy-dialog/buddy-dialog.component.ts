import { Component, OnInit, inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';

import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-buddy-dialog',
    templateUrl: './buddy-dialog.component.html',
    styleUrls: ['./buddy-dialog.component.scss'],
    imports: [DadyinButtonComponent]
})
export class BuddyDialogComponent implements OnInit {
    dialog = inject(MatDialog);
    data = inject(MAT_DIALOG_DATA);

    public buddyDetails: any[]
    public orderValue: any

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
