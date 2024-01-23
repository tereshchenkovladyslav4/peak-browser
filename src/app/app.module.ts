import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APICacheService } from './services/api-cache.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProdGenApi } from './services/apiService/prodgen.api';
import { Apiv2Service } from './services/apiService/apiv2.service';
import { AuthorizationService } from './components/dev-authorization/authorization.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslationService } from './services/translation.service'
import { LiveEventsPageComponent } from './components/live-events/live-events-page.component'
import { WorkGroupsPageComponent } from './components/workgroups/workgroups-page.component'


import { NavigationMenuComponent } from './components/navigation-menu/navigation-menu.component'
import { LoginComponent } from './components/dev-authorization/login.component'
import { AuthenticationStateService } from "./state/authentication/authentication-state.service";
import { of, take } from "rxjs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppBarComponent } from './components/app-bar/app-bar.component';
import { EpCheckboxInputComponent } from "./components/input-fields/checkbox-input/checkbox-input.component";
import { SharedModule } from './modules/shared/shared.module';
import { UserProfileImageComponent } from './components/user-profile-image/user-profile-image.component';
import { TooltipModule } from './modules/tooltip/tooltip.module';
import { ToastrModule } from "ngx-toastr";
import { StorageModule } from './services/storage/storage.module';
import { DropdownMenuComponent } from "./components/dropdown-menu/dropdown-menu.component";
import { CollapseButtonComponent } from './components/collapse-button/collapse-button.component';
import { ExpandButtonComponent } from './components/expand-button/expand-button.component';
import { AclDirective } from './directives/acl.directive';
import { NgxsModule } from '@ngxs/store';
import { AssignmentsState } from './state/assignments/assignments.state';
import { LibraryState } from './state/library/library.state';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { FilterState } from './state/filter/filter.state';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';
import { getSaver, SAVER } from "./services/download/saver.provider";
import { CommentsState } from './state/comments/comments.state';
import { ContentDetailsState } from './state/content-details/content-details.state';
import { RelatedContentState } from './state/related-content/related-content.state';
import { CourseState } from './state/courses/courses.state';

function loginCheck(authService: AuthenticationStateService) {
  return () => of(authService.isLoggedIn()).pipe(take(1));
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationMenuComponent,
    LoginComponent,
    LiveEventsPageComponent,
    WorkGroupsPageComponent,
    AppBarComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgOptimizedImage,
    EpCheckboxInputComponent,
    SharedModule,
    UserProfileImageComponent,
    TooltipModule,
    ToastrModule.forRoot({ closeButton: true, positionClass: 'toast-top-center' }),
    StorageModule.forRoot({
      prefix: 'peak',
    }),
    DropdownMenuComponent,
    CollapseButtonComponent,
    ExpandButtonComponent,
    AclDirective,
    NgxsModule.forRoot([
      AssignmentsState, 
      LibraryState, 
      FilterState,
      ContentDetailsState,
      CourseState,
      CommentsState,
      RelatedContentState
    ]),
    NgxsReduxDevtoolsPluginModule.forRoot({ maxAge: 25 }),
    NgxsResetPluginModule.forRoot()
  ],
  providers: [
    APICacheService,
    ProdGenApi,
    Apiv2Service,
    AuthorizationService,
    TranslationService,
    {
      provide: APP_INITIALIZER,
      useFactory: loginCheck,
      deps: [AuthenticationStateService],
      multi: true,
    },
    { provide: SAVER, useFactory: getSaver },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule { }
