import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ep-text-truncate',
  templateUrl: './text-truncate.component.html',
  styleUrls: ['./text-truncate.component.css'],
  standalone: true,
  imports: [NgIf],
})
export class TextTruncateComponent implements OnChanges {
  @ViewChild('contentDom') contentDom: ElementRef;
  @Input() content: any;
  @Input() rows: number;
  @Output() rowsCalculated: EventEmitter<number> = new EventEmitter<number>();
  isOverflow: boolean;

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges() {
    this.calculateHeight();
  }

  calculateHeight() {
    setTimeout(() => {
      const lineHeightStyle = window.getComputedStyle(this.contentDom.nativeElement).lineHeight;

      // Should calculate height after Dom is rendered
      if (!lineHeightStyle) {
        setTimeout(() => this.calculateHeight(), 100);
        return;
      }

      let lineHeightPx: number;
      if (lineHeightStyle === 'normal') {
        const fontSizeStyle = window.getComputedStyle(this.contentDom.nativeElement).fontSize;
        lineHeightPx = Math.ceil(+fontSizeStyle.replace('px', '') * 1.25);
      } else {
        lineHeightPx = +lineHeightStyle.replace('px', '');
      }

      const actualRows = Math.ceil(this.contentDom.nativeElement.scrollHeight / lineHeightPx);
      this.rowsCalculated.next(Math.min(this.rows, actualRows));

      this.isOverflow = actualRows > this.rows;

      this.cdr.detectChanges();
    });
  }
}
