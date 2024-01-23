import { Directive, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[epTextTruncate]',
  standalone: true,
})
export class TextTruncateDirective implements OnChanges {
  @Input() rows: number;
  @Output() rowsCalculated: EventEmitter<number> = new EventEmitter<number>();
  contentDom: HTMLDivElement;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnChanges() {
    this.calculateHeight();
  }

  calculateHeight() {
    setTimeout(() => {
      const lineHeightStyle = window.getComputedStyle(this.elementRef.nativeElement).lineHeight;

      // Should calculate height after Dom is rendered
      if (!lineHeightStyle) {
        setTimeout(() => this.calculateHeight(), 100);
        return;
      }

      let lineHeightPx: number;
      if (lineHeightStyle === 'normal') {
        const fontSizeStyle = window.getComputedStyle(this.elementRef.nativeElement).fontSize;
        lineHeightPx = Math.ceil(+fontSizeStyle.replace('px', '') * 1.25);
      } else {
        lineHeightPx = +lineHeightStyle.replace('px', '');
      }

      // Truncate style should be removed before calculating the scrollHeight
      if (this.contentDom) this.renderer.removeClass(this.contentDom, 'text-content');
      const actualRows = Math.ceil(this.elementRef.nativeElement.scrollHeight / lineHeightPx);

      this.renderer.addClass(this.elementRef.nativeElement, 'ep-text-truncate');

      // Extract content
      const content = this.contentDom?.innerHTML || this.elementRef.nativeElement.innerHTML;
      // Empty previous content
      this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', '');

      this.contentDom = this.renderer.createElement('div');
      this.renderer.addClass(this.contentDom, 'text-content');
      this.contentDom.style['-webkit-line-clamp'] = this.rows;
      this.contentDom.style['line-clamp'] = this.rows;
      this.renderer.setProperty(this.contentDom, 'innerHTML', content);
      this.renderer.appendChild(this.elementRef.nativeElement, this.contentDom);

      if (actualRows > this.rows) {
        const fullTextDom = this.renderer.createElement('div');
        this.renderer.addClass(fullTextDom, 'full-text-card');
        this.renderer.setProperty(fullTextDom, 'innerHTML', content);
        this.renderer.appendChild(this.elementRef.nativeElement, fullTextDom);
        this.renderer.listen(fullTextDom, 'click', ($event) => {
          $event.stopPropagation();
        });
      }

      this.rowsCalculated.next(Math.min(this.rows, actualRows));
    });
  }
}
