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
import { DownloadAddOnsComponent } from './components/download-add-ons/download-add-ons.component';
import { UpdateLanguageSectionComponent } from './components/update-language-section/update-language-section.component';
import { SelectDropdownComponent } from '../../components/select-dropdown/select-dropdown.component';
import { AutodeskProductCommandsComponent } from './components/autodesk-product-commands/autodesk-product-commands.component';
import { HorizontalTabsComponent } from '../../components/horizontal-tabs/horizontal-tabs.component';




@NgModule({
  declarations: [
    UserProfileContainerComponent,
    UserDetailsHeaderComponent,
    SectionHeaderComponent,
    UpdatePasswordSectionComponent,
    DownloadAddOnsComponent,
    UpdateLanguageSectionComponent,
    AutodeskProductCommandsComponent
  ],
  imports: [
    CommonModule,
    UserProfileImageComponent,
    UserProfileRoutingModule,
    LoadingComponent,
    SharedModule,
    DialogBaseComponent,
    SelectDropdownComponent,
    HorizontalTabsComponent
  ]
})
export class UserProfileModule { }
