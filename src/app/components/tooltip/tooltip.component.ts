import { Component, ElementRef } from '@angular/core';
import { TOOLTIP_POSITION_DEFAULT, TOOLTIP_THEME_DEFAULT, TooltipPosition, TooltipTheme } from 'src/app/directives/tooltip.directive';

@Component({
  selector: 'tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {

  position: TooltipPosition = TOOLTIP_POSITION_DEFAULT;
  theme: TooltipTheme = TOOLTIP_THEME_DEFAULT;
  tooltip: string = '';
  left: number = 0;
  top: number = 0;
  width: string = '';
  enableArrow: boolean = false;
  visible: boolean = false;
  customStyles: { [klass: string]: any; }; // type copied from angular docs

  constructor(private elementRef: ElementRef) {}

}