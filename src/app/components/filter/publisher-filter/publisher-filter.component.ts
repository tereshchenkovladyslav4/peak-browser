import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {map} from "rxjs/operators";
import {EpCheckboxInputComponent} from "../../input-fields/checkbox-input/checkbox-input.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'ep-publisher-filter',
  templateUrl: './publisher-filter.component.html',
  styleUrls: ['./publisher-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    EpCheckboxInputComponent,
    ReactiveFormsModule,
    NgIf
  ]
})
export class PublisherFilterComponent implements OnInit, OnDestroy {
  private _currentValues: any;

  @Input() set currentValues(value: any) {
    this.updateFormValues(value);
    this._currentValues = value;
  }
  get currentValues(): any {
    return this._currentValues;
  }
  @Input() data$: Observable<any>;

  @Output() filterValues: EventEmitter<any> = new EventEmitter<any>();

  publishers$: Observable<any>
  form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.setPublishers();
    this.initForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSelectedChanged(event: any, id: any) {
    this.form.get([id]).setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  private setPublishers() {
    this.publishers$ = this.data$.pipe(
      map(data => [...new Set(data?.map(item => item?.publisher?.name))]),
    );
  }

  private initForm() {
    this.subscriptions.add(
      this.publishers$.subscribe(publishers => {
        const controls = Object.fromEntries(
          publishers.map(pub => [pub, new FormControl(this.currentValues[pub] || false, [])])
        );

        this.form = this.fb.group(controls);
      })
    );
  }

  private updateFormValues(currentValues: any) {
    if (this.form && currentValues !== this.form.getRawValue()) {
      this.form.patchValue(currentValues);
    }
  }
}
