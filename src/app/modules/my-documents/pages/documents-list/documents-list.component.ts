import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WithIsLoaded } from '../../../../resources/mixins/is-loaded.mixin';
import { take } from 'rxjs/operators';
import { map, Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { Document } from '../../../../resources/models/content';
import { FilterStateService } from '../../../../state/filter/filter-state';
import { EpDatePipe } from '../../../../pipes/ep-date.pipe';
import { SharedModule } from '../../../shared/shared.module';
import { MyDocumentMenuComponent } from '../../components/my-document-menu/my-document-menu.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { MyDocumentsStateService } from '../../../../state/my-documents-state/my-documents-state.service';

@Component({
  selector: 'ep-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss'],
  providers: [EpDatePipe, SharedModule],
  standalone: true,
  imports: [CommonModule, SharedModule, RouterLink, TableModule, MyDocumentMenuComponent, LoadingComponent],
})
export class DocumentsListComponent extends WithIsLoaded() implements OnInit {
  filteredData$: Observable<Document[]>;
  isNoDataResults$: Observable<boolean>;

  constructor(
    private filterState: FilterStateService,
    private myDocumentsStateService: MyDocumentsStateService,
  ) {
    super();
  }

  ngOnInit() {
    this.myDocumentsStateService.getMyDocuments().pipe(take(1)).subscribe();
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();
    this.setIsLoaded(this.myDocumentsStateService);

    this.filteredData$ = this.filterState.selectFilteredData().pipe(
      map((items: Document[]) => {
        return items.sort((a, b) => a.name.localeCompare(b.name));
      }),
    );
  }
}
