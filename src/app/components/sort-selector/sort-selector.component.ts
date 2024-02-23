import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap, combineLatest, takeUntil, Subject } from 'rxjs';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { DropdownItem } from '../../resources/models/dropdown-item';
import { DropdownMenuService } from '../../services/dropdown-menu.service';
import { TranslationService } from '../../services/translation.service';
import { SortService } from '../../services/sort/sort.service';
import { SortMeta } from 'primeng/api';
import { LabelValue } from '../../resources/models/label-value';

@Component({
  selector: 'ep-sort-selector',
  templateUrl: './sort-selector.component.html',
  styleUrls: ['./sort-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, DropdownMenuComponent],
})
export class SortSelectorComponent implements OnInit, OnDestroy {
  isSelectorDropdownOpen: boolean = false;
  selectedLabel: string;
  dropdownItems: DropdownItem[];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dropdownMenuService: DropdownMenuService,
    private translationService: TranslationService,
    protected sortService: SortService,
  ) {}

  ngOnInit(): void {
    this.setViewState();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setViewState() {
    combineLatest([this.sortService.sortBy$, this.sortService.fields$])
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(([sortBy, fields]) => this.buildDropdownMenu(sortBy, fields)),
      )
      .subscribe();
  }

  private buildDropdownMenu(sortBy: SortMeta, fields: LabelValue[]) {
    const checkmarkUrl = 'assets/images/check-dark.svg';

    (fields || []).forEach((item) => {
      this.dropdownMenuService.addCustomItem({
        iconUrl: sortBy.field === item.value ? checkmarkUrl : '',
        text: this.translationService.getTranslationFileData(item.label),
        visible: true,
        action: () => {
          this.sortService.updateSort(item.value.toString(), 1);
        },
      });
      if (sortBy.field === item.value) {
        this.selectedLabel = this.translationService.getTranslationFileData(item.label);
      }
    });

    this.dropdownItems = this.dropdownMenuService.getItems();
  }

  toggleSortDirection() {
    this.sortService.toggleSortDirection();
  }

  toggleSelectorDropdown() {
    this.isSelectorDropdownOpen = !this.isSelectorDropdownOpen;
  }

  closeDropdownMenu() {
    this.isSelectorDropdownOpen = false;
  }
}
