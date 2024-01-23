import { Directive, ElementRef, HostBinding, Input, SecurityContext, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[epHighlight]'
})
export class HighlightDirective {

  @Input('highlightSearchTerm') searchTerm: string;
  @Input('highlightText') text: string;
  @Input('highlightGlobalSearch') globalSearch = true;
  @Input('highlightCaseSensitive') caseSensitive = false;
  @Input('highlightCustomClasses') customClasses = "";

  @HostBinding("innerHtml")
  content: string;
  constructor(private el: ElementRef, private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.el?.nativeElement) {
      if ("searchTerm" in changes || "caseSensitive" in changes) {
        if (!this.searchTerm) {
          this.content = this.text;
        } else {
          let regexFlags = "";
          regexFlags += this.globalSearch ? "g" : "";
          regexFlags += this.caseSensitive ? "" : "i";

          const regex = new RegExp(
            this.searchTerm,
            regexFlags
          );
          const newText = this.text.replace(regex, (match: string) => {
            return `<span class="highlight ${this.customClasses}">${match}</span>`;
          });
          const sanitzed = this.sanitizer.sanitize(
            SecurityContext.HTML,
            newText
          );
          this.content = sanitzed;
        }
      }
    }
  }
}
