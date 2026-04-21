import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { orderConfigModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService {
  constructor(public httpService: HttpService) { }


  saveProductAttributes(data: any) {
    return this.httpService.post(orderConfigModule.saveproductAttributes, data).pipe(
        map((res) => {
            return res as any;
        })
    );
  }



  editProductAttributes(data: any) {
    return this.httpService.post(orderConfigModule.saveproductAttributes, data).pipe(
        map((res) => {
            return res as any;
        })
    );
  }

  getAllproductAttributeSetDetailById(id:any) {
    return this.httpService.get(orderConfigModule.saveproductAttributes + '/' + id).pipe(
      map((res) => {
          return res as any;
      })
  );
  }

  saveNotes(data: any) {
    return this.httpService.post(orderConfigModule.saveNotes, data).pipe(
        map((res) => {
            return res as any;
        })
    );
  }
  getAllNotes() {
    return this.httpService.get(orderConfigModule.getAllNotes).pipe(
        map((res) => {
            return res as any;
        })
    );
  }

  getAllproductAttributeSets() {
    return this.httpService.get(orderConfigModule.getAllproductAttributeSets).pipe(
        map((res) => {
            return res as any;
        })
    );
  }

  getNoteTypeById(id:any) {
    const url:any = orderConfigModule.getNoteType + id
    return this.httpService.get(url).pipe(
        map((res) => {
            return res as any;
        })
    );
  }

}