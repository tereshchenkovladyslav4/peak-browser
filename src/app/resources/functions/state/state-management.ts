import { BehaviorSubject, Observable, distinctUntilChanged, map } from "rxjs";

export function selectFrom<T, U>(stateSubject: BehaviorSubject<T>, selector: string): Observable<U> {
  return stateSubject.pipe(
    distinctUntilChanged((prev, curr) => prev[selector] === curr[selector]),
    map(state => state[selector])
  );
}

export const nameof = <T>(name: keyof T) => name;