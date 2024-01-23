import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ChangeContext, NgxSliderModule, Options} from "@angular-slider/ngx-slider";
import {DEFAULT_DURATION_MAX, DEFAULT_DURATION_MIN} from "../../../resources/models/filter/active-filter";
import {NgIf} from "@angular/common";

export enum LabelType {
  /** Label above low pointer */
  Low = 0,
  /** Label above high pointer */
  High = 1,
  /** Label for minimum slider value */
  Floor = 2,
  /** Label for maximum slider value */
  Ceil = 3,
  /** Label below legend tick */
  TickValue = 4,
}


@Component({
  selector: 'ep-duration-filter',
  templateUrl: './duration-filter.component.html',
  styleUrls: ['./duration-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgxSliderModule,
    NgIf
  ],
  standalone: true
})
export class DurationFilterComponent {
  private _currentValues: any;

  @Input() set currentValues(value: any) {
    this.updateFormValues(value);
    this._currentValues = value;
  }

  get currentValues(): any {
    return this._currentValues;
  }

  @Output() filterValues: EventEmitter<any> = new EventEmitter<any>();

  minValue: number;
  highValue: number;
  /**
   * option Rangle  slider value min and max value
   */
  options: Options;

  private userSelection: {value: number, highValue: number};

  setOptions() {
    this.options = {
      floor: this.minValue,
      ceil: this.highValue,
      enforceStep: false,
      enforceRange: false,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return (
              String(Math.floor(value / 3600)).padStart(2, "0") + ":" +
              String(Math.floor((value % 3600) / 60)).padStart(2, "0") + ":" +
              String((value % 3600) % 60).padStart(2, "0")
            );
          case LabelType.High:
            return (
              String(Math.floor(value / 3600)).padStart(2, "0") +
              ":" +
              String(Math.floor((value % 3600) / 60)).padStart(2, "0") +
              ":" +
              String((value % 3600) % 60).padStart(2, "0")
            );
          default:
            return (
              String(Math.floor(value / 3600)).padStart(2, "0") +
              ":" +
              String(Math.floor((value % 3600) / 60)).padStart(2, "0") +
              ":" +
              String((value % 3600) % 60).padStart(2, "0")
            );
        }
      },
    };
  }

  onUserChange({value, highValue}: ChangeContext) {
    this.userSelection = {value, highValue};
    this.filterValues.emit({value, highValue});
  }

  private updateFormValues(currentValues: any) {
    if (!(this.userSelection?.value === currentValues.value && this.userSelection?.highValue === currentValues.highValue)) {
      this.minValue = currentValues.value;
      this.highValue = currentValues.highValue;
      this.setOptions();
    }
  }
}
