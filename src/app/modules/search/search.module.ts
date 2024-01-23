import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SearchFilterComponent} from './components/search-filter/search-filter.component';
import {SearchContainerComponent} from './components/search-container/search-container.component';
import {SearchResultsComponent} from './components/search-results/search-results.component';
import {RouterModule, Routes} from "@angular/router";
import {PublisherFilterComponent} from "../../components/filter/publisher-filter/publisher-filter.component";
import {DifficultyFilterComponent} from "../../components/filter/difficulty-filter/difficulty-filter.component";
import {KeywordsFilterComponent} from "../../components/filter/keywords-filter/keywords-filter.component";
import {ContentTypeFilterComponent} from "../../components/filter/content-type/content-type-filter.component";
import {SearchResultsCardComponent} from './components/search-results-card/search-results-card.component';
import {ContentProgressComponent} from 'src/app/components/content-progress/content-progress.component';
import {TopicInfoComponent} from 'src/app/components/topic-info/topic-info.component';
import {SharedModule} from '../shared/shared.module';
import {DurationFilterComponent} from "../../components/filter/duration-filter/duration-filter.component";
import {TopicsFilterComponent} from "../../components/filter/topics-filter/topics-filter.component";
import {DropdownMenuComponent} from 'src/app/components/dropdown-menu/dropdown-menu.component';
import {ActiveFiltersComponent} from "../../components/filter/active-filters/active-filters.component";
import { TooltipModule } from '../tooltip/tooltip.module';
import {ReactiveFormsModule} from "@angular/forms";
import {FlexibleFrictionComponent} from "../../components/dialog/flexible-friction/flexible-friction.component";
import {FilterBaseComponent} from "../../components/filter/filter-base.component";

const SEARCH_ROUTES: Routes = [
  {path: '', component: SearchContainerComponent, title: 'Pinnacle Series - Search'},
];

@NgModule({
  declarations: [
    SearchFilterComponent,
    SearchContainerComponent,
    SearchResultsComponent,
    SearchResultsCardComponent
  ],
    imports: [
        CommonModule,
        PublisherFilterComponent,
        DifficultyFilterComponent,
        KeywordsFilterComponent,
        ContentTypeFilterComponent,
        FilterBaseComponent,
        SharedModule,
        ContentProgressComponent,
        TopicInfoComponent,
        DurationFilterComponent,
        TopicsFilterComponent,
        ActiveFiltersComponent,
        DropdownMenuComponent,
        TooltipModule,
        RouterModule.forChild(SEARCH_ROUTES),
        ReactiveFormsModule,
        FlexibleFrictionComponent
    ]
})
export class SearchModule {
}
