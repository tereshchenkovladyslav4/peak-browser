import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AclDirective } from './acl.directive';
import { AclService } from '../services/acl/acl.service';
import { AclRole } from '../resources/enums/acl-role.enum';

@Component({
  template: ` <div *epAclIf="allowedRoles">Content to show if allowed</div> `,
})
class TestComponent {
  allowedRoles: AclRole[] = [];
}

describe('AclDirective', () => {
  let aclServiceMock: jest.Mocked<AclService>; // Services must be mocked
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let debugElement: DebugElement;

  // Runs before each it block
  beforeEach(() => {
    // Define mocked service
    aclServiceMock = {
      checkRoles: jest.fn(),
    } as unknown as jest.Mocked<AclService>;

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [AclDirective],
      // Provide mocked service in place of service
      providers: [{ provide: AclService, useValue: aclServiceMock }],
    });

    // Initialize component for testing
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  // Default test
  it('should create the component', () => {
    expect(component).toBeDefined();
  });

  it('should show content if roles are allowed', () => {
    component.allowedRoles = [AclRole.PinnacleLite]; // Set the roles that should be allowed
    aclServiceMock.checkRoles.mockReturnValue(true);
    fixture.detectChanges();

    const contentElement = debugElement.query(By.css('div'));
    expect(contentElement).toBeTruthy();
    expect(contentElement.nativeElement.textContent).toContain('Content to show if allowed');
    expect(aclServiceMock.checkRoles).toHaveBeenCalledWith([AclRole.PinnacleLite]);
  });

  it('should hide content if roles are not allowed', () => {
    component.allowedRoles = [AclRole.NotPinnacleLite]; // Set the roles that should not be allowed
    aclServiceMock.checkRoles.mockReturnValue(false);
    fixture.detectChanges();

    const contentElement = debugElement.query(By.css('div'));
    expect(contentElement).toBeFalsy();
    expect(aclServiceMock.checkRoles).toHaveBeenCalledWith([AclRole.NotPinnacleLite]);
  });
});
