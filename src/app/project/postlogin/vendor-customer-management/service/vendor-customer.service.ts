import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { relationAccountApis } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorCustomerService {
  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient
  ) {}

  //Get All notes List
  Get_All_Notes(relationAccountid: any): Observable<any> {
    let apiUrl = relationAccountApis.getNotes + `${relationAccountid}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  Get_All_Reminders(relationAccountid: any): Observable<any> {
    let apiUrl = relationAccountApis.getReminders + `${relationAccountid}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  addNotes(id: any, data): Observable<any> {
    let apiUrl = relationAccountApis.addNotes + `${id}`;
    return this.httpService.post(apiUrl, data).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  addReminder(id: any, data): Observable<any> {
    let apiUrl = relationAccountApis.addReminder + `${id}`;
    return this.httpService.post(apiUrl, data).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
  updateLeadField(
    relationaccountId: any,
    fieldName: any,
    value: any
  ): Observable<any> {
    const url = `${relationAccountApis.updateLeadRelationStatus}${relationaccountId}?fieldName=${fieldName}&updatedValue=${value}`;
    return this.httpService.post<any>(url);
  }

  bulkUpdateLeadField(
    relationaccountIds: any,
    fieldName: any,
    values: any,
    clearAllnAdd: any
  ): Observable<any> {
    const url = `${relationAccountApis.bulkUpdateLeadRelationStatus}?relationAccountIds=${relationaccountIds}&fieldName=${fieldName}&updatedValue=${values}&clearAllNAdd=${clearAllnAdd}`;
    return this.httpService.post<any>(url);
  }

  bulkUploadLeads(formData: any): Observable<any> {
    const url = `${relationAccountApis.bulkUploadLeads}`;
    return this.httpService.post<any>(url, formData);
  }

  downloadSampleFile(): Observable<any> {
    const url = `${relationAccountApis.downloadSampleFile}`;
    return this.httpClient.get(environment.apiUrl + url, {
      responseType: 'blob',
    });
  }
  suggestEmail(id: any): Observable<any> {
    let apiUrl = relationAccountApis.generateEmail + `${id}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  saveNoteByImage(id: any, imageFiles): Observable<any> {
    let apiUrl = relationAccountApis.saveNoteByImage + `${id}`;
    const formData = new FormData();
    for (const imageFile of imageFiles) {
      formData.append('imageFile', imageFile);
    }
    return this.httpService.post(apiUrl, formData).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  sendEmail(id: any, data: any, draft: any): Observable<any> {
    let url = relationAccountApis.sendEmail + `${id}`;
    if (draft) {
      url = url + '?sendEmail=false';
    }
    return this.httpService.post<any>(url, data);
  }
}
