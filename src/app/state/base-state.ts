import {Inject, Injectable, InjectionToken} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface BaseState {
  isLoaded: boolean;
}

export const DEFAULT_BASE_STATE: BaseState = {
  isLoaded: false
}

type OmitDefault<T extends BaseState> = Omit<T, "isLoaded">;

export const setDefaultValues  = <OmitDefault>(values: OmitDefault) => (
  {
    ...DEFAULT_BASE_STATE,
    ...values
  }
);

export const DEFAULT_STATE_VALUES_TOKEN: InjectionToken<any> = new InjectionToken<any>('default_values');


@Injectable({
  providedIn: 'root'
})
export class BaseStateService<T extends BaseState> {
  state$: BehaviorSubject<T> = new BehaviorSubject<T>(null);

  constructor(
    @Inject(DEFAULT_STATE_VALUES_TOKEN) protected defaultStateValues: T) {
    this.updateState(defaultStateValues);
  }

  resetState() {
    this.updateState(this.defaultStateValues);
  }

  updateState(state: T) {
    this.state$.next(state);
  }

  updateIsLoaded(isLoaded) {
    this.updateState({
      ...this.getStateSnapshot(),
      isLoaded: isLoaded
    })
  }

  selectState(selectorFunction): Observable<any> {
    return this.state$.pipe(map(selectorFunction));
  }

  selectIsLoaded(): Observable<boolean> {
    return this.selectState(state => state.isLoaded);
  }

  getStateSnapshot() {
    return this.state$.getValue();
  }
}
