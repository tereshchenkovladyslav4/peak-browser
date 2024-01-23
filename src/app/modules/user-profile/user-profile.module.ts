import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileContainerComponent } from './components/user-details-container/user-profile-container.component';
import { UserDetailsHeaderComponent } from './components/user-details-header/user-details-header.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { UserProfileImageComponent } from '../../components/user-profile-image/user-profile-image.component';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { UpdatePasswordSectionComponent } from './components/update-password-section/update-password-section.component';
import { SharedModule } from '../shared/shared.module';
import { DialogBaseComponent } from '../../components/dialog/dialog-base/dialog-base.component';




@NgModule({
  declarations: [
    UserProfileContainerComponent,
    UserDetailsHeaderComponent,
    SectionHeaderComponent,
    UpdatePasswordSectionComponent
  ],
  imports: [
    CommonModule,
    UserProfileImageComponent,
    UserProfileRoutingModule,
    LoadingComponent,
    SharedModule,
    DialogBaseComponent
  ]
})
export class UserProfileModule { }
