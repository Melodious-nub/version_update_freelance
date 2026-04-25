import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
    selector: 'dadyin-map-autocomplete',
    templateUrl: './dadyin-map-autocomplete.component.html',
    styleUrls: ['./dadyin-map-autocomplete.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule
    ]
})
export class DadyinMapAutoCompleteComponent implements AfterViewInit{
  httpClient = inject(HttpClient);
  apiService = inject(ApiService);

  @Input() height: string | null = null;
  @Input() fontSize: string | null = null;
  apiLoaded: boolean;
  @Input() control: any;
  @Input() label: any = '';
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef;
  @Output() address = new EventEmitter();

  ngAfterViewInit() {
    if (!this.apiService.googleMapApiLoaded) {
      this.loadGoogleMapsAPI().subscribe((success: boolean) => {
        this.apiLoaded = success;
        if (success) {
          this.createAutocomplete();
          this.apiService.googleMapApiLoaded = true;
        } else {
          // Handle API loading failure
        }
      });
    } else {
      this.createAutocomplete();
    }
  }

  loadGoogleMapsAPI() {
    return this.httpClient
      .jsonp(
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyCHV_bK7nPYldKqmAoegvz_CkYjr4SN0-c&libraries=places',
        'callback'
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  createAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.autocompleteInput.nativeElement
    );
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.address.emit(place);
    });
  }

  onChangeInput(event) {
    if (!event.target.value) {
      this.control.reset();
    }
  }
}
