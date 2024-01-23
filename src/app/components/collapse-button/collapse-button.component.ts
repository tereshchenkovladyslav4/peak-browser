import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ep-collapse-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collapse-button.component.html',
  styleUrls: ['./collapse-button.component.scss']
})
export class CollapseButtonComponent {
  @Input() top: number;
  @Input() right: number;
  @Input() left: number;
  @Input() scaleUpClassCondition: boolean;
  @Input() scaleDownClassCondition: boolean;
  @Input() rotateIconClassCondition: boolean;
  @Input() reverseIcon: boolean = false;

  @Output() onIconClick = new EventEmitter();

  onClicked() {
    this.onIconClick.emit();
  }
}
