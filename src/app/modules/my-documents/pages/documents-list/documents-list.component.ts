import { Component, OnInit } from '@angular/core';
import { MyDocumentsService } from '../../../../services/my-documents/my-documents.service';
import { WithIsLoaded } from '../../../../resources/mixins/is-loaded.mixin';
import { take } from 'rxjs/operators';
import { map, Observable } from 'rxjs';
import { Document } from '../../../../resources/models/content';
import { FilterStateService } from '../../../../state/filter/filter-state';
import { EpDatePipe } from '../../../../pipes/ep-date.pipe';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'ep-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss'],
  providers: [EpDatePipe, SharedModule],
})
export class DocumentsListComponent extends WithIsLoaded() implements OnInit {
  filteredData$: Observable<Document[]>;
  isNoDataResults$: Observable<boolean>;

  constructor(
    private filterState: FilterStateService,
    private myDocumentsService: MyDocumentsService,
  ) {
    super();
  }

  ngOnInit() {
    this.myDocumentsService.getMyDocuments().pipe(take(1)).subscribe();
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();
    this.setIsLoaded(this.myDocumentsService);

    this.filteredData$ = this.filterState.selectFilteredData().pipe(
      map((items: Document[]) => {
        return items.sort((a, b) => a.name.localeCompare(b.name));
      }),
    );
  }
}
