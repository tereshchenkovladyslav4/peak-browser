import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';

import { CarouselModule } from 'primeng/carousel';

import { HomeComponent } from './pages/home/home.component';
import { LibraryCardComponent } from '../library/components/library-card/library-card.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { HomeSectionComponent } from './components/home-section/home-section.component';
import { AssignmentCardComponent } from '../assignments/components/assignment-card/assignment-card.component';

@NgModule({
  declarations: [HomeComponent, HomeSectionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    SharedModule,
    CarouselModule,
    LibraryCardComponent,
    AssignmentCardComponent,
    LoadingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class HomeModule {}
