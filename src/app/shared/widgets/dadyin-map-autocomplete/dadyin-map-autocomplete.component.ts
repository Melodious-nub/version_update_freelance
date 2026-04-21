import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'dadyin-map-autocomplete',
  templateUrl: './dadyin-map-autocomplete.component.html',
  styleUrls: ['./dadyin-map-autocomplete.component.scss'],
})
export class DadyinMapAutoCompleteComponent implements OnInit, AfterViewInit {
  @Input() height: string | null = null;
  @Input() fontSize: string | null = null;
  apiLoaded: boolean;
  @Input() control: any;
  @Input() label: any = '';
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef;
  @Output('address') address = new EventEmitter();
  constructor(public httpClient: HttpClient, public apiService: ApiService) {}

  ngOnInit(): void {}

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
