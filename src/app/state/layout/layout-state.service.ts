import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';

export type PageLayout = 'default' | 'full-screen';

interface LayoutState {
  layout: PageLayout;
  fullScreenText: string;
}

const DEFAULT_STATE: LayoutState = {
  layout: 'default',
  fullScreenText: 'Exit'
}

@Injectable({
  providedIn: 'root'
})
export class LayoutStateService {

  state$: BehaviorSubject<LayoutState> = new BehaviorSubject<LayoutState>(DEFAULT_STATE);

  // selectors
  selectLayout$: Observable<PageLayout> = selectFrom(this.state$, nameof<LayoutState>('layout'));
  selectFullScreenText$: Observable<string> = selectFrom(this.state$, nameof<LayoutState>('fullScreenText'));
  selectIsFullScreen$: Observable<boolean> = selectFrom<LayoutState, PageLayout>(this.state$, nameof<LayoutState>('layout')).pipe(
    map(layout => layout === 'full-screen')
  );

  constructor() { }

  reset() {
    this.state$.next(DEFAULT_STATE);
  }

  setLayout(newLayout: PageLayout, fullScreenText?: string) {
    if (this.state$.getValue().layout !== newLayout) {
      this.updateLayout(newLayout);
    }

    if (this.state$.getValue().fullScreenText !== fullScreenText) {
      this.updateFullScreenText(fullScreenText);
    }
  }

  // state funcs
  get snapshot(): LayoutState {
    return this.state$.getValue();
  }

  private updateLayout(layout: PageLayout) {
    this.state$.next({
      ...this.state$.getValue(),
      layout: layout
    })
  }

  private updateFullScreenText(fullScreenText?: string) {
    this.state$.next({
      ...this.state$.getValue(),
      fullScreenText: fullScreenText
    })
  }
}
