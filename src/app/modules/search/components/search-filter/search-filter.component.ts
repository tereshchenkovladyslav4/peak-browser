import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SearchService} from "../../../../services/search/search.service";
import {FilterBaseComponent} from "../../../../components/filter/filter-base.component";
import {DialogService} from "../../../../services/dialog/dialog.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FilterStateService} from "../../../../state/filter/filter-state";


@Component({
  selector: 'ep-search-filter',
  templateUrl: '../../../../components/filter/filter-base.component.html',
  styleUrls: ['../../../../components/filter/filter-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilterComponent extends FilterBaseComponent {
  constructor(protected override service: SearchService,
              protected override dialog: DialogService,
              protected override router: Router,
              protected override route: ActivatedRoute,
              protected override filterState: FilterStateService,
              ) {
    super(service, dialog, router, route, filterState);
  }
}
