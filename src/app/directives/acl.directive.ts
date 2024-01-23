import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AclService } from '../services/acl/acl.service';
import { AclRole } from '../resources/enums/acl-role.enum';

@Directive({
  selector: '[epAclIf]',
  standalone: true,
})
export class AclDirective {
  private roles: AclRole[];

  @Input()
  public set epAclIf(value: AclRole[]) {
    this.roles = value;
    this.evaluate();
  }

  private created = false;

  constructor(
    private template: TemplateRef<any>,
    private view: ViewContainerRef,
    private aclService: AclService,
  ) {}

  private evaluate(): void {
    const isAllowed = this.aclService.checkRoles(this.roles);
    if (isAllowed) {
      this.allow();
    } else {
      this.disallow();
    }
  }

  private allow(): void {
    if (this.created) {
      return;
    }
    this.view.clear();
    this.view.createEmbeddedView(this.template);
    this.created = true;
  }

  private disallow(): void {
    if (!this.created) {
      return;
    }
    this.view.clear();
    this.created = false;
  }
}
