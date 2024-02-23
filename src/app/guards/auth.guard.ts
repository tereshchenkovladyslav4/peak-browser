import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationStateService } from '../state/authentication/authentication-state.service';
import { APP_ROUTES } from '../resources/constants/app-routes';

export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean> | Promise<boolean> | boolean => {
  const router = inject(Router);
  const authState = inject(AuthenticationStateService);
  if (authState.isLoggedIn()) {
    return true;
  }

  authState.setRedirectUrl(state.url);
  router.navigate([APP_ROUTES.login]);
  return false;
};
