import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {map} from "rxjs/operators";
import {EpCheckboxInputComponent} from "../../input-fields/checkbox-input/checkbox-input.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  DifficultyString,
  mapContentDifficultyToDifficultyString
} from "../../../resources/models/filter/difficulty-filter";
import {getDifficultyLabel} from "../../../resources/models/filter/active-filter";
import {ContentDifficulty} from "../../../resources/enums/content-difficulty.enum";
import { SharedModule } from 'src/app/modules/shared/shared.module';

interface DifficultyDisplay {
  key: string,
  label: DifficultyString,
  order: number,
}

@Component({
  selector: 'ep-difficulty-filter',
  templateUrl: './difficulty-filter.component.html',
  styleUrls: ['./difficulty-filter.component.scss'],
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
export class DifficultyFilterComponent implements OnInit, OnDestroy {
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

  difficulties$: Observable<any>
  form: FormGroup;
  emptyForm$: Observable<any>;
  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.setDifficulties();
    this.setEmptyForm();
    this.initForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSelectedChanged(event: any, id: any) {
    this.form.get(id).setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  private setDifficulties() {
    const hardcodedNoneContentDifficulty = ContentDifficulty.None;

    this.difficulties$ = this.data$.pipe(
      // syntax like: (arr || []) due to ts spread operator in arrays not handling null or undefined like objects do
      map(data => [...new Set([...(data?.map(item => item?.difficulty) || []), hardcodedNoneContentDifficulty])]),
      map((difficulties: ContentDifficulty[]) => difficulties?.map((difficulty) => getDifficultyDisplay(difficulty))),
      map(difficulties => difficulties.sort((a, b) => a.order - b.order)),
    )
  }

  /**
   * sets empty form status observable so difficulty filter panel gets updated asynchronously
   */
  private setEmptyForm() {
    this.emptyForm$ = this.difficulties$.pipe(
      map(difficulties => difficulties?.length <= 1) // NONE difficulty is always added, so if there is only 1, then we want to display empty form
    );
  }

  private initForm() {
    this.subscriptions.add(
      this.difficulties$.subscribe(difficulties => {
        const controls = Object.fromEntries(
          difficulties.map(dif => [dif.key, new FormControl(this.currentValues[dif.key] || false, [])])
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

function getDifficultyDisplay(difficulty: ContentDifficulty): DifficultyDisplay {
  const difficultyString = mapContentDifficultyToDifficultyString(difficulty);
  return ({key: difficultyString, label: getDifficultyLabel(difficultyString), order: +difficulty});
}
