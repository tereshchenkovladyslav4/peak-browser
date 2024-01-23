import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HorizontalTabsComponent, Tab } from '../../../../components/horizontal-tabs/horizontal-tabs.component';
import { ActiveFiltersComponent } from '../../../../components/filter/active-filters/active-filters.component';
import { AsyncPipe, CommonModule, NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase } from '@angular/common';
import { LibraryCardComponent } from '../../../library/components/library-card/library-card.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TopicsFilterComponent } from '../../../../components/filter/topics-filter/topics-filter.component';
import { WithIsLoaded } from '../../../../resources/mixins/is-loaded.mixin';
import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentlyAssignedComponent } from '../currently-assigned/currently-assigned.component';
import { AssignmentHistoryComponent } from '../assignment-history/assignment-history.component';
import { CardViewComponent } from '../../../../components/card-view/card-view.component';
import { AssignmentCardComponent } from '../assignment-card/assignment-card.component';
import { RouterLink } from '@angular/router';
import { NoResultComponent } from '../../../../components/no-result/no-result.component';
import { ViewModeComponent } from 'src/app/components/view-mode/view-mode.component';
import { ViewMode } from 'src/app/resources/enums/view-mode.enum';
import { LocalStorageService } from 'src/app/services/storage/services/local-storage.service';
import { LocalStorageKey } from 'src/app/resources/enums/local-storage-key.enum';

@Component({
  selector: 'ep-assignments-container',
  templateUrl: './assignments-container.component.html',
  styleUrls: ['./assignments-container.component.scss'],
  imports: [
    HorizontalTabsComponent,
    ActiveFiltersComponent,
    AsyncPipe,
    LibraryCardComponent,
    LoadingComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SharedModule,
    TopicsFilterComponent,
    NgStyle,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    CurrentlyAssignedComponent,
    AssignmentHistoryComponent,
    CommonModule,
    CardViewComponent,
    AssignmentCardComponent,
    RouterLink,
    NoResultComponent,
    ViewModeComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsContainerComponent extends WithIsLoaded() implements OnInit {
  form = new FormGroup({
    filter: new FormControl('', null),
  });
  formFilter$: Observable<string> = this.form.valueChanges.pipe(
    map((form) => (form.filter || '').toLowerCase()),
    startWith(''),
  );
  tabs: Tab[] = [
    { key: 'current', label: 'Currently Assigned' },
    { key: 'history', label: 'Enrollment History' },
  ];
  currentTabKey: string = null;
  viewMode = ViewMode.GRID;

  constructor(private localStorage: LocalStorageService) {
    super();
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.viewMode = this.localStorage.getItem(LocalStorageKey.ASSIGNMENT_VIEWMODE) || ViewMode.GRID;
  }

  setCurrentTabKey(tabKey: string) {
    this.currentTabKey = tabKey;
    this.form.reset();
  }

  handleChangeViewMode(value: ViewMode) {
    this.viewMode = value;
    this.localStorage.setItem(LocalStorageKey.ASSIGNMENT_VIEWMODE, value);
  }
}
