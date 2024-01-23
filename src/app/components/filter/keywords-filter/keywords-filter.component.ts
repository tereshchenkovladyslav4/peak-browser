import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {combineLatest, Observable, startWith} from "rxjs";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {map} from "rxjs/operators";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {EpCheckboxInputComponent} from "../../input-fields/checkbox-input/checkbox-input.component";
import {FilterableBaseComponent} from "../filterable-base/filterable-base.component";
import { SharedModule } from 'src/app/modules/shared/shared.module';

@Component({
  selector: 'ep-keywords-filter',
  templateUrl: './keywords-filter.component.html',
  styleUrls: ['./keywords-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    EpCheckboxInputComponent,
    ReactiveFormsModule,
    NgIf,
    SharedModule
  ]
})
export class KeywordsFilterComponent extends FilterableBaseComponent implements OnInit {
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

  keywords$: Observable<any>
  form: FormGroup;
  emptyForm$: Observable<any>;

  constructor(protected override fb: FormBuilder) {
    super(fb);
  }

  override ngOnInit() {
    super.initFilterForm();
    this.setKeywords();
    this.setEmptyForm();
    this.initForm();
  }

  onSelectedChanged(event: any) {
    this.form.get('noKeywordsAssigned').setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  onKeywordSelectedChanged(event: any, id: any) {
    this.form.get(id).setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  private setKeywords() {
    this.keywords$ = combineLatest([
      this.data$.pipe(
        map(data => [...new Set(data?.flatMap(item => item.keywords))]),
        map((keywords: string[]) => keywords.sort((a, b) => a.localeCompare(b)))),
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.getRawValue()),
        map((v: { filter: string }) => v?.filter?.toLowerCase()))

    ]).pipe(
      // sets show property used in template to show/hide based on filter form
      map(([keywords, filterValues]: [string[], any]) => {
        if (!filterValues) {
          return keywords.map(keyword => ({
            name: keyword,
            show: true,
          }))
        }

        return keywords?.map(keyword => ({
          name: keyword,
          show: keyword.toLowerCase().includes(filterValues)
        }));
      })
    )
  }

  /**
   * sets empty form status observable so keywords filter panel gets updated asynchronously
   */
  private setEmptyForm() {
    this.emptyForm$ = this.keywords$.pipe(
      map(keywords => keywords?.length === 0)
    );
  }

  private initForm() {
    this.subscriptions.add(
      this.keywords$.subscribe(keywords => {
        const controls = Object.fromEntries(
          keywords.map(k => [k.name, new FormControl(this.currentValues[k.name] || false, [])])
        );

        this.form = this.fb.group({
          ...controls,
          noKeywordsAssigned: new FormControl(this.currentValues?.noKeywordsAssigned || false, [])
        });
      })
    );
  }

  private updateFormValues(currentValues: any) {
    if (this.form && currentValues !== this.form.getRawValue()) {
      this.form.patchValue(currentValues);
    }
  }
}
