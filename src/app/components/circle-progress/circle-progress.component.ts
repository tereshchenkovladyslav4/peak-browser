import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ep-circle-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circle-progress.component.html',
  styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnChanges {
  @Input() size: number;
  @Input() strokeWidth: number;
  @Input() fontSize: string = '2.5rem';
  @Input() progress: number;
  @Input() trackStroke: string;
  @Input() progressStroke: string;
  @Input() showPercentage: boolean = false;

  arcLength: number;
  arcOffset: number;

  wrapperStyles: { [klass: string]: any; }; // type copied from angular docs
  trackStyles: { [klass: string]: any; }; // type copied from angular docs
  progressStyles: { [klass: string]: any; }; // type copied from angular docs

  ngOnChanges(changes: SimpleChanges): void {
    // safe to call on every changes cycle as we want to update everything when ANY of the inputs change
    this.setArcLengthAndOffset();
  }

  private setArcLengthAndOffset() {
    const center = this.size / 2;
    const radius = center - this.strokeWidth;
    this.arcLength = 2 * Math.PI * radius;
    this.arcOffset = this.arcLength * ((100 - this.progress) / 100)

    // set wrapper styles
    this.wrapperStyles = {
      'min-width': `${this.size}px`,
      'min-height': `${this.size}px`,
      'max-width': `${this.size}px`,
      'max-height': `${this.size}px`,
    };
    
    // set track styles
    this.trackStyles = {
      'cx': `${center}px`,
      'cy': `${center}px`,
      'r': `${radius}px`,
      'stroke': this.trackStroke,
      'stroke-width': `${this.strokeWidth}px`
    }

    // set progress styles
    this.progressStyles = {
      'cx': `${center}px`,
      'cy': `${center}px`,
      'r': `${radius}px`,
      'stroke': this.progressStroke,
      'stroke-width': `${this.strokeWidth}px`,
      'stroke-dasharray': `${this.arcLength}px`,
      'stroke-dashoffset': `${this.arcOffset}px`
    }
  }
}
