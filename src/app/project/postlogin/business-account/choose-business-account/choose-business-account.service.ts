import { Injectable, inject } from '@angular/core';
import { apiModules} from 'src/app/shared/constant';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';




@Injectable({ providedIn: 'root' })
export class ChooseBusinessAccountService {
    private httpService = inject(HttpService);


    selectBusinessAccount(userId, businessAccountId): Observable<any> {
        return this.httpService.get<any>(`${apiModules.select_business_account}`+"/"+userId+"/"+businessAccountId);
    }


}
