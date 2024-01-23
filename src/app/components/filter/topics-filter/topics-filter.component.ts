import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf, NgStyle} from "@angular/common";
import {EpCheckboxInputComponent} from "../../input-fields/checkbox-input/checkbox-input.component";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {combineLatest, Observable, startWith} from "rxjs";
import {map} from "rxjs/operators";
import {FilterableBaseComponent} from "../filterable-base/filterable-base.component";
import { SharedModule } from 'src/app/modules/shared/shared.module';

const NO_TOPICS_ASSIGNED = 'noTopicsAssigned';

@Component({
  selector: 'ep-topics-filter',
  templateUrl: './topics-filter.component.html',
  styleUrls: ['./topics-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    EpCheckboxInputComponent,
    ReactiveFormsModule,
    NgIf,
    SharedModule,
    NgStyle
  ]
})
export class TopicsFilterComponent extends FilterableBaseComponent implements OnInit {
  private _currentValues: any;

  @Input() set currentValues(value: any) {
    this.updateFormValues(value);
    this._currentValues = value;
  }

  get currentValues(): any {
    return this._currentValues;
  }

  @Input() data$: Observable<any>;
  @Input() customStyles: any = {};

  @Output() filterValues: EventEmitter<any> = new EventEmitter<any>();

  topics$: Observable<any>
  form: FormGroup;
  emptyForm$: Observable<any>;

  constructor(protected override fb: FormBuilder) {
    super(fb);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.setTopics();
    this.setEmptyForm();
    this.initForm();
  }

  onTopicSelectedChanged(event: any, topic: any) {
    const topicsGroup = this.form.get('topics') as unknown as FormGroup;
    const subtopicsGroup = this.form.controls[topic.name] as unknown as FormGroup;

    topicsGroup.controls[topic.name].setValue(event);
    subtopicsGroup.patchValue(
      topic.subtopics.reduce((subtopicMap, {name}) => {
        subtopicMap[name] = event;
        return subtopicMap
      }, {})
    );

    this.filterValues.emit(this.form.getRawValue());
  }

  onSubtopicSelectedChanged(event: any, topicName, subtopicName: any) {
    const topicsGroup = this.form.get('topics') as unknown as FormGroup;
    const topicGroup = this.form.controls[topicName] as unknown as FormGroup;

    topicsGroup.controls[topicName].setValue(true);
    topicGroup.controls[subtopicName].setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  onSelectedChanged(event: any) {
    this.form.get(NO_TOPICS_ASSIGNED).setValue(event);

    this.filterValues.emit(this.form.getRawValue());
  }

  private setTopics() {
    this.topics$ = combineLatest([
      // sets up topics data
      this.data$.pipe(
        map(data => data?.flatMap(item => item?.topics) || []),
        map(topics => getTopicMap(topics)),
        // convert map to array of objects
        map(topicMap => Object.keys(topicMap).map(key => ({name: key, subtopics: topicMap[key]}))),
        map((topics: any[]) => {
          topics.sort((a, b) => (a.name.localeCompare(b.name)));
          topics.forEach(topic => topic?.subtopics?.sort((a, b) => (a.name.localeCompare(b.name))))
          return topics;
        }),
      ),
      // gets inner filter values
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.getRawValue()),
        map((v: { filter: string }) => v?.filter?.toLowerCase()))
    ]).pipe(
      // sets show property used in template to show/hide based on filter form
      map(([topics, filterValues]: [{ name: string; subtopics: any; }[], any]) => {
        if (!filterValues) {
          return topics.map(topic => ({
            ...topic,
            show: true,
            subtopics: topic?.subtopics?.map(subtopic => ({
              ...subtopic,
              show: true
            }))
          }));
        }
        return topics?.map(topic => {
          // show topic and all of it's subtopics if topic matches search filter value
          const topicMatches = topic.name.toLowerCase().includes(filterValues);
          if (topicMatches) {
            return {
              ...topic,
              show: true,
              subtopics: topic?.subtopics?.map(subtopic => ({
                ...subtopic,
                show: true
              }))
            }
          }

          // show topic if any of it's subtopics match search filter value and also return all matching subtopics
          return {
            ...topic,
            show: topic?.subtopics?.some(s => s.name.toLowerCase().includes(filterValues)),
            subtopics: topic?.subtopics?.map(subtopic => ({
              ...subtopic,
              show: subtopic.name.toLowerCase().includes(filterValues)
            }))
          }
        });
      })
    );
  }

  /**
   * sets empty form status observable so topics filter panel gets updated asynchronously
   */
  private setEmptyForm() {
    this.emptyForm$ = this.topics$.pipe(
      map(topics => topics?.length === 0)
    );
  }

  private initForm() {
    this.subscriptions.add(
      this.topics$.subscribe(topics => {
        const topicsGroup = Object.fromEntries(
          topics.map(topic => [topic.name, new FormControl(this.currentValues?.topics?.[topic.name] || false, [])])
        );
        const topicsMap = getTopicMap(topics);
        const subtopicsGroupMap = Object.fromEntries(
          Object.keys(topicsMap).map(topic => [
            topic,
            this.fb.group(Object.fromEntries(
              topicsMap[topic].map(subtopic => [subtopic.name, new FormControl(this.currentValues?.[topic]?.[subtopic.name] || false, [])])
            ))
          ])
        );

        this.form = this.fb.group({
          ...subtopicsGroupMap,
          topics: this.fb.group(topicsGroup),
          noTopicsAssigned: new FormControl(this.currentValues?.noTopicsAssigned || false, [])
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

function getTopicMap(topics: any[]) {
  return topics.reduce((topicMap, {name, subtopics}) => {
    return {
      ...topicMap,
      [name]: deduplicateSubtopics(((topicMap?.[name] || []).concat(subtopics)))
    };
  }, {});
}

function deduplicateSubtopics(arr: any[]): any[] {
  return getUniqueObjectsByKey(arr, 'name');
}

function getUniqueObjectsByKey(arr: any[], key: string): any[] {
  return [...new Map(arr.map(item => [item[key], item])).values()];
}
