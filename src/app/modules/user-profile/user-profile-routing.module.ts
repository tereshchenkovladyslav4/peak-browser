import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileContainerComponent } from './components/user-details-container/user-profile-container.component';
import { NAVIGATION_ROUTES, ROUTE_TITLES } from '../../resources/constants/app-routes';

const USER_PROFILE_ROUTES: Routes = [
  {
    path: '', component: UserProfileContainerComponent, title: ROUTE_TITLES[NAVIGATION_ROUTES.profile] }
]

@NgModule({
  imports: [
    RouterModule.forChild(USER_PROFILE_ROUTES)
  ],
  exports: [RouterModule]
})
export class UserProfileRoutingModule { }
