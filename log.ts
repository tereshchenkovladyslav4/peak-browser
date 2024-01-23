import {MonoTypeOperatorFunction, observable, Observable, pipe, tap, UnaryFunction} from "rxjs";

/***
 * @param label
 * Pipeable operator to add within a .pipe() chain to console log the latest emission
 * Optionally takes a label that will be logged preceding the data
 * Not recommended to leave in production code - convience method for debugging
 * Example usage:
 *     myObservable.pipe(
 *        logIt()
 *     )
 *
 * Replaces: ... tap(a => console.log(a)) ...
 */
export const log = <T>(label: string | number = ''): MonoTypeOperatorFunction<T> => pipe(
  tap((value) => console.log(label, value))
);

/***
 * Wrap an observable in this to log  emission
 * @param observable
 * @param label
 */
export const logger = (observable: Observable<any>, label: string | number = '') => observable.pipe(log(label)).subscribe();
