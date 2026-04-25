import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { SignupUser } from 'src/app/model/signup/SignupUser';
import { environment } from 'src/environments/environment';
import {  apiModules, userApiModules } from 'src/app/shared/constant';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { GenricResponse } from 'src/app/model/common/generic-response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Branch, BusinessAccount, BusinessAccounts } from 'src/app/model/common/business-account';
import { AuthService } from 'src/app/service/auth.service';
import { Invite } from 'src/app/model/common/invite';
import { Employee } from 'src/app/model/common/employee';
import { UserAccount } from 'src/app/model/common/user-account';
import { Role } from 'src/app/model/common/role';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class BusinessRegistartionService {

    constructor(private httpService: HttpService) { }

    saveBusinessAccDetail(userId, BADetail): Observable<BusinessAccount> {
      return this.httpService.post<BusinessAccount>(`${apiModules.save_business_account_regi}`+"/"+userId, BADetail);
    }


    saveBranchDetail(businessAccountId, branchDetail): Observable<Branch[]> {
      return this.httpService.post<Branch[]>(`${apiModules.save_branch}`+"/"+businessAccountId, branchDetail);
    }

    saveAllBranchDetail(businessAccountId, branchDetails): Observable<Branch[]> {
      return this.httpService.post<Branch[]>(`${apiModules.save_all_branch}`+"/"+businessAccountId, branchDetails);
    }

    getAllBranchDetail(businessAccountId): Observable<Branch[]> {
      return this.httpService.get<Branch[]>(`${apiModules.get_all_Branch}`+"/"+businessAccountId);
    }

    deleteBranchDetail(branchDetailId, businessAccountId): Observable<Branch[]> {
      return this.httpService.get<Branch[]>(`${apiModules.delete_branch}`+"/"+branchDetailId+"/"+businessAccountId);
    }

    registerEmployee(userDetails : UserAccount,  baId): Observable<GenricResponse> {
      return this.httpService.post<GenricResponse>(`${userApiModules.save_employee}`+"/"+baId, userDetails);
    }

    registerAllEmployee(userDetails : UserAccount[],  baId): Observable<GenricResponse> {
      return this.httpService.post<GenricResponse>(`${userApiModules.save_all_employee}`+"/"+baId, userDetails);
    }

    sendEmployeeInvite(userDetails : UserAccount, userId, baId): Observable<GenricResponse> {
      return this.httpService.post<GenricResponse>(`${userApiModules.send_employee_invite}`+"/"+userId+"/"+baId, userDetails);
    }
    sendInvite(data): Observable<GenricResponse> {
      return this.httpService.post<GenricResponse>(`${userApiModules.send_invite}`, data);
    }
    getAllEmployee(baId): Observable<UserAccount[]> {
      return this.httpService.get<UserAccount[]>(`${userApiModules.getAllEmployee}`+"/"+baId);
    }

    deleteEmployee(empId, baId): Observable<UserAccount[]> {
      return this.httpService.get<UserAccount[]>(`${userApiModules.employee}`+"/delete/"+empId+"/"+baId);
    }

    getAllRoles(): Observable<Role[]> {
      return this.httpService.get<Role[]>(`${userApiModules.employee}`+"/getroles");
    }



}
