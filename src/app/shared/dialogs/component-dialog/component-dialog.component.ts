import {
  Component,
  ComponentRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'app-component-dialog',
    templateUrl: './component-dialog.component.html',
    styleUrls: ['./component-dialog.component.scss'],
    imports: [MatDialogContent]
})
export class ComponentDialogComponent implements OnInit, OnDestroy {
  @ViewChild('target', { read: ViewContainerRef, static: true })
  vcRef!: ViewContainerRef;

  componentRef!: ComponentRef<any>;
  dialogCallback$ = new ReplaySubject<any>();
  dialogCallback$$ = this.dialogCallback$.asObservable();

  constructor(
    public dialogRef: MatDialogRef<ComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogCallback$$.subscribe((data: any) => {
      this.dialogRef.close(data);
    });
  }

  ngOnInit(): void {
    this.componentRef = this.vcRef.createComponent(this.data.component);
    let componentInstance = this.componentRef.instance;
    componentInstance.data = {
      ...this.data.data,
      callback: this.dialogCallback$,
    };
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}
