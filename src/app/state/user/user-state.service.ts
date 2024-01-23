import { Injectable } from '@angular/core';
import { map, Observable, ReplaySubject, take } from 'rxjs';
import { UserFull } from '../../resources/models/user';
import { AclService } from '../../services/acl/acl.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private backingCurrentUser: ReplaySubject<UserFull> = new ReplaySubject<UserFull>(1);
  public readonly currentUser: Observable<UserFull> = this.backingCurrentUser.asObservable().pipe(map(user => new UserFull(user)));
  constructor(private aclService: AclService) { }

  updateCurrentUser(user: UserFull): void {
    this.aclService.loadPermission(user?.permissions?.permissionsList || []);
    this.backingCurrentUser.next(user);
  }

}
