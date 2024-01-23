import {Inject, Injectable, InjectionToken} from "@angular/core";
import {Observable} from "rxjs";

export const STATE_CLASS_TOKEN: InjectionToken<any> = new InjectionToken<any>('state_class');

@Injectable({
  providedIn: 'root'
})
export class ConsumesState<T> {
  isLoaded$: Observable<boolean>;

  constructor(@Inject(STATE_CLASS_TOKEN) protected state: T) {
    this.isLoaded$ = state["selectIsLoaded"]();
  }
}
