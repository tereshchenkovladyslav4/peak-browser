import { TestBed } from '@angular/core/testing';
import { AclService } from './acl.service';
import { AclRole } from '../../resources/enums/acl-role.enum';
import { SessionStorageService } from '../storage/services/session-storage.service';
import { TenantMini } from '../../resources/models/tenant/tenant';

describe('AclService', () => {
  let aclService: AclService;
  let sessionStorageServiceMock: jest.Mocked<SessionStorageService>; // Services must be mocked

  beforeEach(() => {
    // Define mocked service
    sessionStorageServiceMock = {
      getItem: jest.fn(),
    } as unknown as jest.Mocked<SessionStorageService>;

    TestBed.configureTestingModule({
      // Provide mocked service in place of service
      providers: [AclService, { provide: SessionStorageService, useValue: sessionStorageServiceMock }],
    });

    // Initialize service for testing
    aclService = TestBed.inject(AclService);
  });

  // Default test
  it('should be created', () => {
    expect(aclService).toBeTruthy();
  });

  it('should return true for empty roles', () => {
    const result = aclService.checkRoles(null); // Service call
    expect(result).toBeTruthy(); // Assert
  });

  it('should check for NotPinnacleLite role correctly', () => {
    // Setup
    const roles: AclRole[] = [AclRole.NotPinnacleLite];
    const mockTenantDetails: TenantMini = {
      tenantId: null,
      organizationId: null,
      tenantName: null,
      isPinnacleLite: false,
    };
    sessionStorageServiceMock.getItem.mockReturnValue(mockTenantDetails);

    // Service call
    const result = aclService.checkRoles(roles);

    // Assert
    expect(result).toBeTruthy();
    expect(sessionStorageServiceMock.getItem).toHaveBeenCalledWith('tenantDetails');
  });

  it('should check for PinnacleLite role correctly', () => {
    // Setup
    const roles: AclRole[] = [AclRole.PinnacleLite];
    const mockTenantDetails: TenantMini = {
      tenantId: null,
      organizationId: null,
      tenantName: null,
      isPinnacleLite: true,
    };
    sessionStorageServiceMock.getItem.mockReturnValue(mockTenantDetails);

    // Service call
    const result = aclService.checkRoles(roles);

    // Assert
    expect(result).toBeTruthy();
    expect(sessionStorageServiceMock.getItem).toHaveBeenCalledWith('tenantDetails');
  });

  it('should return true for null permission', () => {
    const result = aclService.checkPermission(null); // Service call
    expect(result).toBeTruthy(); // Assert
  });

  it('should return false for invalid permission', () => {
    const invalidPermission = 'invalid_permission'; // Setup

    const result = aclService.checkPermission(invalidPermission); // Service call

    expect(result).toBeFalsy(); // Assert
  });
});
