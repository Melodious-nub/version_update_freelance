import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable} from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';
import { DadyinMapAutoCompleteComponent } from '../../widgets/dadyin-map-autocomplete/dadyin-map-autocomplete.component';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-map-dialog',
    templateUrl: './map-dialog.component.html',
    styleUrls: ['./map-dialog.component.scss'],
    standalone: true,
    imports: [DadyinButtonComponent, FormsModule, ReactiveFormsModule, DadyinMapAutoCompleteComponent, GoogleMapsModule]
})
export class MapDialogComponent implements OnInit {
  apiLoaded: Observable<boolean>;
  markerOptions: google.maps.MarkerOptions = {draggable: true};
  markerPosition: google.maps.LatLngLiteral = {lat: 24.576110,lng: 73.700500};
  center:any={lat: 24.576110,lng: 73.700500};
  latitude:any
  longitude:any
  searchControl=this.fb.group({
    addressLine:[]
  })
  constructor(public dialogRef: MatDialogRef<MapDialogComponent>,httpClient: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,public fb:UntypedFormBuilder)
  {}

  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }

  onDragEnd(event,type) {
    let mapLink:any=`https://www.google.com/maps/dir/?api=1&destination=${event.latLng.lat()},${event.latLng.lng()}`
    this.data.mapLinkControl.setValue(mapLink)
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    let mapLink:any=`https://www.google.com/maps/dir/?api=1&destination=${event.latLng.lat()},${event.latLng.lng()}`
    this.data.mapLinkControl.setValue(mapLink)
  }

  copyLink(link:any) {
    // Copy the text inside the text field
   navigator.clipboard.writeText(link); 
   // Alert the copied text
   alert("Copied the text to clipboard");
  }


  onAddressSelection(event:any) {
    this.markerPosition={lat:event.geometry.location.lat(),lng:event.geometry.location.lng()}
    this.center={lat:event.geometry.location.lat(),lng:event.geometry.location.lng()}
    this.latitude=event.geometry.location.lat()
    this.longitude=event.geometry.location.lng()
    let mapLink:any=`https://www.google.com/maps/dir/?api=1&destination=${ this.latitude},${this.longitude}`
    this.data.mapLinkControl.setValue(mapLink)
    let btn:any = document.getElementById('btn')
    btn.click()
  }





}
