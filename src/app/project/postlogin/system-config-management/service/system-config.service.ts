import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { orderConfigModule, systemConfigModule } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class SystemConfigService {
  private httpService = inject(HttpService);






/**
 * Save business entity configuration
 * POST - http://localhost:8080/dadyin-api/business-entity-configurations/
 */
saveBusinessEntityConfiguration(data: any) {
  return this.httpService.post(systemConfigModule.saveBusinessEntityConfiguration, data).pipe(
    map((res) => {
      return res as any;
    })
  );
}

/**
 * Get all configuration types
 * GET - http://localhost:8080/dadyin-api/business-entity-configurations/types
 */
getConfigurationTypes() {
  return this.httpService.get(systemConfigModule.getConfigurationTypes).pipe(
    map((res) => {
      return res as any;
    })
  );
}

/**
 * Get the active configuration for a specific type
 * GET - http://localhost:8080/dadyin-api/business-entity-configurations/active/{configurationType}
 */
getActiveConfiguration(configurationType: string) {
  return this.httpService.get(systemConfigModule.getActiveConfiguration + configurationType).pipe(
    map((res) => {
      return res as any;
    })
  );
}

}
