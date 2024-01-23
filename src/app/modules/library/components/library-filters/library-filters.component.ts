import {Component} from '@angular/core';
import {FilterBaseComponent} from "../../../../components/filter/filter-base.component";
import {DialogService} from "../../../../services/dialog/dialog.service";
import {PublisherFilterComponent} from "../../../../components/filter/publisher-filter/publisher-filter.component";
import {DifficultyFilterComponent} from "../../../../components/filter/difficulty-filter/difficulty-filter.component";
import {KeywordsFilterComponent} from "../../../../components/filter/keywords-filter/keywords-filter.component";
import {ContentTypeFilterComponent} from "../../../../components/filter/content-type/content-type-filter.component";
import {SharedModule} from "../../../shared/shared.module";
import {DurationFilterComponent} from "../../../../components/filter/duration-filter/duration-filter.component";
import {TopicsFilterComponent} from "../../../../components/filter/topics-filter/topics-filter.component";
import {ActiveFiltersComponent} from "../../../../components/filter/active-filters/active-filters.component";
import {CommonModule} from "@angular/common";
import {LibraryContentService} from "../../../../services/library-content/library-content.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {FilterStateService} from "../../../../state/filter/filter-state";

@Component({
  selector: 'ep-library-filters',
  templateUrl: '../../../../components/filter/filter-base.component.html',
  styleUrls: ['../../../../components/filter/filter-base.component.scss'],
  standalone: true,
  imports: [
    PublisherFilterComponent,
    DifficultyFilterComponent,
    KeywordsFilterComponent,
    ContentTypeFilterComponent,
    FilterBaseComponent,
    SharedModule,
    DurationFilterComponent,
    TopicsFilterComponent,
    ActiveFiltersComponent,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LibraryFiltersComponent extends FilterBaseComponent {
  constructor(protected override service: LibraryContentService,
              protected override dialog: DialogService,
              protected override router: Router,
              protected override route: ActivatedRoute,
              protected override filterState: FilterStateService,
              ) {
    super(service, dialog, router, route, filterState);
  }
}
