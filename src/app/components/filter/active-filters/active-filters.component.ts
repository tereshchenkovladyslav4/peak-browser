import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'ep-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf
  ]
})
export class ActiveFiltersComponent implements OnInit {

  @Input() filters: any[];
  @Output() removeFilter: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
  }

  onRemoveFilter(filter) {
    this.removeFilter.emit(filter);
  }
}
