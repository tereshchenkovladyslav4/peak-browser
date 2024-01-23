import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'ep-filterable-base',
  templateUrl: './filterable-base.component.html',
  styleUrls: ['./filterable-base.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule
  ]
})
export class FilterableBaseComponent implements OnInit, OnDestroy {

  @Input() currentSearchFilterValue: string = '';
  @Output() searchFilterValue = new EventEmitter();
  filterForm: FormGroup;

  protected subscriptions: Subscription = new Subscription();

  constructor(protected fb: FormBuilder) {
  }

  ngOnInit() {
    this.initFilterForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected initFilterForm() {
    this.filterForm = this.fb.group({
      filter: new FormControl(this.currentSearchFilterValue, null)
    });

    this.listenToValueChanges();
  }

  private listenToValueChanges() {
    this.subscriptions.add(
    this.filterForm.get('filter').valueChanges.subscribe(filterValue => {
      this.searchFilterValue.emit(filterValue)
    })
    );
  }
}
