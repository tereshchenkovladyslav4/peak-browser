import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveToast, ToastrModule, ToastrService } from 'ngx-toastr';
import { OrganizationService } from '../../../../services/organization/organization.service';
import { TranslationService } from '../../../../services/translation.service';

import { AutodeskProductCommandsComponent } from './autodesk-product-commands.component';
import { HttpClientModule } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { StorageModule } from 'src/app/services/storage/storage.module';
import { TenantMini } from 'src/app/resources/models/tenant/tenant';
import { of } from 'rxjs';
import { OrganizationInfo } from 'src/app/resources/models/organization/organization';
import { GuidEmpty } from 'src/app/services/apiService/classFiles/v2-externallearning';

describe('AutodeskProductCommandsComponent', () => {
  //Mock all services
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let organizationServiceMock: jest.Mocked<OrganizationService>;
  let component: AutodeskProductCommandsComponent;
  let fixture: ComponentFixture<AutodeskProductCommandsComponent>;

  beforeEach(async () => {
    toastrServiceMock = { success: jest.fn() } as unknown as jest.Mocked<ToastrService>;

    organizationServiceMock = { getOrganizationDetails: jest.fn().mockReturnValue(of({
      expirationDate: new Date(),
      organizationId: 5000656,
      organizationName: "test",
      partnerId: GuidEmpty,
      sellingPartnerId: GuidEmpty,
      tenants: []
    } as unknown as OrganizationInfo)) } as unknown as jest.Mocked<OrganizationService>;

    await TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        HttpClientModule,
        SharedModule,
        StorageModule.forRoot({prefix: 'peak'})   
      ],
      declarations: [AutodeskProductCommandsComponent],
      providers: [
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: OrganizationService, useValue: organizationServiceMock },
        { provide: InjectionToken, useValue: '',}
      ]
    })
    .compileComponents();

    toastrServiceMock.toastrConfig = {
      ...toastrServiceMock.toastrConfig,
      maxOpened: 1,
      autoDismiss: true
    };

    fixture = TestBed.createComponent(AutodeskProductCommandsComponent);
    component = fixture.componentInstance;
    component.currentTenantDetails = new TenantMini();
    component.currentTenantDetails.organizationId = 5000656;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    
  });

  it('should apply max toast messages allowed on screen at once', () => {    
    component.ngOnInit();
    fixture.detectChanges();
    expect(toastrServiceMock.toastrConfig.autoDismiss).toBe(true);
    expect(toastrServiceMock.toastrConfig.maxOpened).toBe(1);
  })

  it('should get the organization details based on organization id', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.currentTenantDetails.organizationId).toBe(5000656);
    expect(component.orgInfo.partnerId).toBe(GuidEmpty);
  })

  it('should activate Revit and AutoCAD-based product commands when "Activate on this Device" is clicked', () => {
    const autodeskSpy = jest.spyOn(component, 'onAutodeskSearchEnabledChange');
    const activateBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.description-and-actions .actions button:first-child');
    expect(activateBtn.textContent.trim()).toBe('user-profile.activate-autodesk-commands');
    activateBtn.click();
    expect(autodeskSpy).toHaveBeenCalledWith(true);
  })

  it('should deactivate Revit and AutoCAD-based product commands when "Deactivate on this Device" is clicked', () => {
    const autodeskSpy = jest.spyOn(component, 'onAutodeskSearchEnabledChange');
    const activateBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.description-and-actions .actions button:last-child');
    expect(activateBtn.textContent.trim()).toBe('user-profile.deactivate-autodesk-commands');
    activateBtn.click();
    expect(autodeskSpy).toHaveBeenCalledWith(false);
  })
});
