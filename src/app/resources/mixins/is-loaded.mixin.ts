import {Constructor} from "@angular/cdk/table";
import {Observable, of} from "rxjs";

interface IsLoaded {
  isLoaded$;
}


export function WithIsLoaded<T extends Constructor<{}>>(Base: T = (class {} as any)) {
  return class extends Base implements IsLoaded {
    isLoaded$: Observable<boolean>;

    setIsLoaded(state) {
      this.isLoaded$ = state['isLoaded$'];
    }
  }
}
