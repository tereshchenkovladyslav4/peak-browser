import { ApplicationRef, ComponentRef, Directive, ElementRef, EmbeddedViewRef, HostListener, Input, OnDestroy, OnInit, ViewContainerRef, createComponent } from "@angular/core";
import { TooltipComponent } from "../components/tooltip/tooltip.component";

export type TooltipPosition = 'above' | 'below' | 'left' | 'right' | 'center';
export type TooltipTheme = 'dark' | 'light';

export const TOOLTIP_POSITION_DEFAULT = 'center';
export const TOOLTIP_THEME_DEFAULT = 'light';

export class TooltipOffsets {
  top: number = 0;
  left: number = 0;
}

@Directive({
  selector: '[epTooltip]'
})
export class TooltipDirective implements OnDestroy {

  @Input('epTooltipText') tooltipText: string = ''; // the text that will display in the tooltip; if this isn't set, then the elements innerText will be used
  @Input('epTooltipPosition') position: TooltipPosition = TOOLTIP_POSITION_DEFAULT;
  @Input('epTooltipTheme') theme: TooltipTheme = TOOLTIP_THEME_DEFAULT;
  @Input('epTooltipShowDelay') showDelay: number = 500;
  @Input('epTooltipHideDelay') hideDelay: number = 50;
  @Input('epTooltipArrow') enableArrow: boolean = false;
  @Input('epTooltipRestrictWidth') restrictWidth: boolean = false; // if width of tooltip component should be restricted relative to the element this directive is on
  @Input('epTooltipEnabled') enabled: boolean = true;
  @Input('epTooltipIgnoreValidation') ignoreValidation: boolean = false;
  @Input('epTooltipOffsets') offsets: TooltipOffsets = new TooltipOffsets();
  @Input('epTooltipStyles') customStyles: { [klass: string]: any; }; // type copied from angular docs

  componentRef: ComponentRef<TooltipComponent> = null;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private appRef: ApplicationRef) {}

  ngOnInit(): void {
    
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.componentRef === null && this.isValidTooltip() && this.enabled) {
      window.clearInterval(this.hideDelay);

      // create TooltipComponent and inject into DOM
      const environmentInjector = this.appRef.injector;
      this.componentRef = createComponent(TooltipComponent, {environmentInjector});
      this.appRef.attachView(this.componentRef.hostView);
      const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

      this.setTooltipComponentProperties();

      document.body.appendChild(domElem);
      this.showTimeout = window.setTimeout(this.showTooltip.bind(this), this.showDelay);
    }
  }

  isValidTooltip(): boolean {
    // ignore text ellipsis active check on the following types of elements
    // OR ignore validation flag set
    if (['BUTTON', 'IMG'].includes(this.elementRef?.nativeElement.nodeName) || this.ignoreValidation) {
      return true;
    }

    // is ellipsis active on text?
    return this.elementRef?.nativeElement?.clientWidth < this.elementRef?.nativeElement?.scrollWidth || 
    this.elementRef?.nativeElement?.clientHeight < this.elementRef?.nativeElement?.scrollHeight;
  }

  private setTooltipComponentProperties() {
    if (this.componentRef !== null) {
      this.componentRef.instance.tooltip = this.tooltipText ? this.tooltipText : this.elementRef.nativeElement.innerText;
      this.componentRef.instance.position = this.position;
      this.componentRef.instance.theme = this.theme;
      this.componentRef.instance.enableArrow = this.enableArrow;
      this.componentRef.instance.customStyles = this.customStyles;

      const {left, right, top, bottom} = this.elementRef.nativeElement.getBoundingClientRect();

      const tooltipWidth = right - left;
      if (this.restrictWidth) {
        this.componentRef.instance.width = Math.round(tooltipWidth) + 'px';
      }

      switch(this.position) {
        case 'center': {
          this.componentRef.instance.left = Math.round(tooltipWidth / 2 + left) + this.offsets.left;
          this.componentRef.instance.top = Math.round(top) + this.offsets.top;
          break;
        }
        case 'below': {
          this.componentRef.instance.left = Math.round(tooltipWidth / 2 + left) + this.offsets.left;
          this.componentRef.instance.top = Math.round(bottom) + this.offsets.top;
          break;
        }
        case 'above': {
          this.componentRef.instance.left = Math.round(tooltipWidth / 2 + left) + this.offsets.left;
          this.componentRef.instance.top = Math.round(top - 5) + this.offsets.top;
          break;
        }
        case 'right': {
          this.componentRef.instance.left = Math.round(right) + this.offsets.left;
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2) + this.offsets.top;
          break;
        }
        case 'left': {
          this.componentRef.instance.left = Math.round(left) + this.offsets.left;
          this.componentRef.instance.top = Math.round(top + (bottom - top) / 2) + this.offsets.top;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  private showTooltip() {
    if (this.componentRef !== null) {
      this.componentRef.instance.visible = true;
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.setHideTooltipTimeout();
  }

  private setHideTooltipTimeout() {
    this.hideTimeout = window.setTimeout(this.destroy.bind(this), this.hideDelay);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.componentRef !== null) {
      window.clearTimeout(this.showTimeout);
      window.clearTimeout(this.hideTimeout);
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
