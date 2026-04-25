import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { DadyInUsersModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root'
})
export class UsersManagementService {
  private httpService = inject(HttpService);


  getAllBusinessAccount(
    pageNumber: any,
    pageS: any,
    sort: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        DadyInUsersModule.getAllbusinessAccount +
        `?page=${pageNumber}&size=${pageS}${filter || ''}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  /**
   * Update lead (sales rep) for a business account.
   * @param businessAccountId Business account id (e.g. 301)
   * @param leadId Employee/lead id, or null to unassign
   */
  updateBusinessLead(businessAccountId: number, leadId: number | null): Observable<any> {
    const url = DadyInUsersModule.updateBusinessLead + businessAccountId + '/lead';
    return this.httpService.patch(url, { leadId });
  }

  /**
   * Get invites list. statusFilter: 'ALL' | 'ONBOARDED' | 'YET_TO_JOIN'
   */
  getInvitesList(
    pageNumber: number,
    pageSize: number,
    sort: string,
    statusFilter: string,
    searchString?: string
  ): Observable<{ content: any[]; totalElements: number; totalPages: number }> {
    let params = `?page=${pageNumber}&size=${pageSize}&sort=${sort || 'audit.createdDate,desc'}&status=${statusFilter || 'ALL'}`;
    if (searchString) params += `&searchString=${encodeURIComponent(searchString)}`;
    return this.httpService.get(DadyInUsersModule.getInvitesList + params).pipe(
      map((res: any) => ({
        content: res?.content ?? [],
        totalElements: res?.totalElements ?? 0,
        totalPages: res?.totalPages ?? 0,
      })),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0 }))
    );
  }
}
