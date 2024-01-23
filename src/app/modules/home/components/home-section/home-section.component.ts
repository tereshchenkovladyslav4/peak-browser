import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject } from 'rxjs';
import { Breakpoints } from '../../../../resources/enums/breakpoints.enum';
import { HomeSection } from '../../../../resources/enums/home-section.enum';

@Component({
  selector: 'ep-home-section',
  templateUrl: './home-section.component.html',
  styleUrls: ['./home-section.component.scss'],
})
export class HomeSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() section: HomeSection;
  @Input() sectionTitle: string;
  @Input() link: string;
  @Input() items: any[] = [];
  readonly HomeSection = HomeSection;
  readonly unsubscribeAll$ = new Subject<void>();
  readonly MAX_ITEMS = 15;
  numScroll = 3;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // TODO - uncomment after zoom is removed
    // this.handleChangeWidth();
    //
    // fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribeAll$), debounceTime(500)).subscribe(() => {
    //   this.handleChangeWidth();
    // })
  }

  ngOnDestroy() {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  onContactSupport() {
    const url = 'https://support.eaglepoint.com/hc/en-us';
    window.open(url, '_blank');
  }

  get numVisible() {
    // ToDo This function should be refactored to subscribe to window resize events after zoom is removed.
    const width = window.innerWidth;
    const containerWidth =
      this.elementRef.nativeElement.getBoundingClientRect().width;
    let numVisible = 5;

    if (width > Breakpoints.XXXL) {
      numVisible = (containerWidth - 48) / 308;
      this.numScroll = 3;
    } else if (width > Breakpoints.XL) {
      numVisible = (containerWidth - 48) / 308;
      this.numScroll = 2;
    } else if (width > Breakpoints.LG) {
      numVisible = (containerWidth - 48) / 308;
      this.numScroll = 1;
    } else if (width > Breakpoints.SM) {
      numVisible = (containerWidth - 12) / 290;
      this.numScroll = 1;
    } else {
      numVisible = (containerWidth - 12) / 290;
      this.numScroll = 1;
    }

    return numVisible;
  }
}
