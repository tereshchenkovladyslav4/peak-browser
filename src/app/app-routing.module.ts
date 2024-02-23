import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/dev-authorization/login.component';
import { LiveEventsPageComponent } from './components/live-events/live-events-page.component';
import { WorkGroupsPageComponent } from './components/workgroups/workgroups-page.component';
import { APP_ROUTES, NAVIGATION_ROUTES, ROUTE_TITLES } from './resources/constants/app-routes';
import { LibrariesContainerComponent } from './modules/library/components/libraries-container/libraries-container.component';
import { LibraryContainerComponent } from './modules/library/components/library-container/library-container.component';
import { AssignmentsContainerComponent } from './modules/assignments/components/assignments-container/assignments-container.component';
import { BookmarksContainerComponent } from './modules/bookmarks/components/bookmarks-container/bookmarks-container.component';
import { authGuard } from './guards/auth.guard';

const ROUTES: Routes = [
  // LOGIN
  { path: APP_ROUTES.login, component: LoginComponent, title: 'Pinnacle Series - Login' },
  { path: '', redirectTo: APP_ROUTES.login, pathMatch: 'prefix' },

  // SEARCH
  {
    path: APP_ROUTES.search,
    loadChildren: () => import('./modules/search/search.module').then((m) => m.SearchModule),
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.content,
    loadChildren: () => import('./modules/content/content.module').then((m) => m.ContentModule),
    canActivate: [authGuard],
  },

  // GENERAL
  {
    path: APP_ROUTES.home,
    loadChildren: () => import('./modules/home/home.module').then((m) => m.HomeModule),
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.assignments,
    component: AssignmentsContainerComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.assignments],
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.libraries,
    children: [
      {
        path: '',
        component: LibrariesContainerComponent,
        title: ROUTE_TITLES[NAVIGATION_ROUTES.libraries],
      },
      {
        path: ':id',
        component: LibraryContainerComponent,
        title: ROUTE_TITLES[NAVIGATION_ROUTES.libraries],
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.liveEvents,
    component: LiveEventsPageComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.liveEvents],
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.workGroups,
    component: WorkGroupsPageComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.workGroups],
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.bookmarks,
    component: BookmarksContainerComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.bookmarks],
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.myDocuments,
    loadChildren: () => import('./modules/my-documents/my-documents.module').then((m) => m.MyDocumentsModule),
    canActivate: [authGuard],
  },
  {
    path: APP_ROUTES.profile,
    loadChildren: () => import('./modules/user-profile/user-profile.module').then((m) => m.UserProfileModule),
    canActivate: [authGuard],
  },

  //MANAGEMENT
  {
    path: 'manage',
    loadChildren: () => import('./modules/manage/manage.module').then((m) => m.ManageModule),
    canActivate: [authGuard],
  },

  // WILDCARD
  // todo need to make this work without breaking login issue - seems to be race condition
  // { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES, {
      onSameUrlNavigation: 'reload',
      canceledNavigationResolution: 'computed',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
