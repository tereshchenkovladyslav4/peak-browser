import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonOptions } from 'src/app/resources/models/button/button';

export const RIGHT_BUTTON_ICON_URL = 'assets/images/right-chevron.svg'

@Component({
  selector: 'ep-course-nav-buttons-view',
  templateUrl: './course-nav-buttons-view.component.html',
  styleUrls: ['./course-nav-buttons-view.component.scss']
})
export class CourseNavButtonsViewComponent {

  @Input() buttonOptionsList: ButtonOptions[];
  @Output() onButtonClick = new EventEmitter<ButtonOptions>();

  buttonClick(buttonOptions: ButtonOptions) {
    this.onButtonClick.emit(buttonOptions);
  }
}
