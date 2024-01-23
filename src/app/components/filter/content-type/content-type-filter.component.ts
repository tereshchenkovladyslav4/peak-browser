import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {map} from "rxjs/operators";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {EpCheckboxInputComponent} from "../../input-fields/checkbox-input/checkbox-input.component";
import {ContentTypeIconComponent} from "./content-type-icon/content-type-icon.component";
import {
  ContentTypeString,
  mapServerContentTypeToContentTypeString
} from "../../../resources/models/filter/content-type-filter";


@Component({
  selector: 'ep-content-type-filter',
  templateUrl: './content-type-filter.component.html',
  styleUrls: ['./content-type-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    EpCheckboxInputComponent,
    ReactiveFormsModule,
    NgIf,
    ContentTypeIconComponent
  ]
})
export class ContentTypeFilterComponent implements OnInit, OnDestroy {
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

  contentTypes$: Observable<any>
  contentType = ContentTypeString;
  form: FormGroup;
  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.setContentTypes();
    this.initForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSelectedChanged([type, event]: [ContentTypeString, boolean]) {
    this.form.get(type).setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  private setContentTypes() {
    this.contentTypes$ = this.data$.pipe(
      map(data => [...new Set(data?.map(item => mapServerContentTypeToContentTypeString(item.contentType)))]),
      map((contentTypes: string[]) => contentTypes.sort((a: string, b: string) => (a.localeCompare(b)))),
    )
  }

  private initForm() {
    this.subscriptions.add(
      this.contentTypes$.subscribe(contentTypes => {
        const controls = Object.fromEntries(
          contentTypes.map(type => [type, new FormControl(this.currentValues[type] || false, [])])
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



