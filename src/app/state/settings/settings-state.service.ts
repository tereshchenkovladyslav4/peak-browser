import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from "rxjs";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { GetKnowledgeSmartResponse, KnowledgeSmartConfiguration, TenantSetting } from '../../services/apiService/classFiles/v2-organizations'
import { TenantSettingType } from '../../resources/enums/tenant-setting-type.enum'
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Apiv2Service } from 'src/app/services/apiService/apiv2.service';
import { LocalStorageService } from 'src/app/services/storage/services/local-storage.service';


export const GUID_EMPTY = "00000000-0000-0000-0000-000000000000";

interface SettingsState {
  tenantSettings: TenantSetting[];
  knowledgeSmartSettings: KnowledgeSmartConfiguration;
}

const DEFAULT_STATE: SettingsState = {
  tenantSettings: [],
  knowledgeSmartSettings: new KnowledgeSmartConfiguration()
}
@Injectable({
  providedIn: 'root'
})
export class SettingsStateService {

  state$: BehaviorSubject<SettingsState> = new BehaviorSubject<SettingsState>(DEFAULT_STATE);

  // state selectors
  tenantSettings$: Observable<TenantSetting[]> = selectFrom(this.state$, nameof<SettingsState>('tenantSettings'));
  knowledgeSmartSettings$: Observable<KnowledgeSmartConfiguration> = selectFrom(this.state$, nameof<SettingsState>('knowledgeSmartSettings'));
  workflowDisplaySetting$: Observable<string> = this.tenantSettings$.pipe(
    map(tenantSettings => tenantSettings.find(tenantSetting => tenantSetting.settingName === TenantSettingType.WFTreeDisplay)),
    filter(tenantSetting => !!tenantSetting),
    map(tenantSetting => tenantSetting?.settingValue.toLocaleString()),
  );
  lpWorkflowDisplaySetting$: Observable<string> = this.tenantSettings$.pipe(
    map(tenantSettings => tenantSettings.find(tenantSetting => tenantSetting.settingName === TenantSettingType.WFTreeLPDisplay)),
    filter(tenantSetting => !!tenantSetting),
    map(tenantSetting => tenantSetting?.settingValue.toLocaleString()),
  );

  constructor(private organizationService: OrganizationService,
              private v2Service: Apiv2Service) { }

  performSessionSetup() {
    this.organizationService.getAllTenantSettings()
      .subscribe(settings => {
        this.updateTenantSettings(settings.settings);
      });
    this.v2Service.getKSIntegrationConfigInfo().subscribe({
      next: res => this.updateKnowledgeSmartSettings(res.knowledgeSmartConfiguration),
      error: err => {
        let v_DefaultKS = new GetKnowledgeSmartResponse();
        v_DefaultKS.knowledgeSmartConfiguration = new KnowledgeSmartConfiguration();
        v_DefaultKS.knowledgeSmartConfiguration.useKnowledgeSmartIntegration = false;
        v_DefaultKS.knowledgeSmartConfiguration.knowledgeSmartAPI_Key = "";
        v_DefaultKS.knowledgeSmartConfiguration.assessmentSelfEnroll = false;


        this.updateKnowledgeSmartSettings(v_DefaultKS.knowledgeSmartConfiguration);
      }
    });
  }

  getRawTenantSetting(settingType: TenantSettingType): string | number {
    let s = this.snapshot.tenantSettings.find(s => s.settingName === settingType.valueOf());
    return s ? s.settingValue : null;
  }

  getTenantSetting(settingType: TenantSettingType): Observable<string | number> {
    let s = this.snapshot.tenantSettings.find(s => s.settingName === settingType.valueOf());
    return s ? of(s.settingValue) : of(null);
  }

  // STATE FUNCS
  get snapshot(): SettingsState {
    return this.state$.getValue();
  }

  updateTenantSettings(tenantSettings: TenantSetting[]) {
    this.state$.next({
      ...this.state$.getValue(),
      tenantSettings: tenantSettings
    })
  }

  updateTenantSettingValue(settingType: TenantSettingType, newValue: any) {
    let s = this.snapshot.tenantSettings.find(s => s.settingName === settingType.valueOf());
    if (s != null) {
      s.settingValue = newValue;
      this.state$.next({
        ...this.state$.getValue(),
        tenantSettings: [...this.snapshot.tenantSettings]
      })
    }
  }

  updateKnowledgeSmartSettings(knowledgeSmartSettings: KnowledgeSmartConfiguration) {
    this.state$.next({
      ...this.state$.getValue(),
      knowledgeSmartSettings: knowledgeSmartSettings
    });
  }
}
