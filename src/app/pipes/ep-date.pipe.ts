import { Pipe, PipeTransform, NgModule } from '@angular/core';


// The Angular DatePipe is not as flexible as we
// need and it requires us to register each locale
// we intend to use. There's a shelveset that shows
// a workaround for some of this, but it's easier for
// us to rely on the Intl JS library now that it's
// basically standard across browsers.
//
// Shelveset:
// https://eaglepoint.visualstudio.com/Pinnacle/_versionControl/shelveset?ss=Locale%20handling%3Bdakota.methvin%40eaglepoint.com
@Pipe({
    name: 'epDate'
})
export class EpDatePipe implements PipeTransform {

    transform(
        value: Date | string,
        dateStyle?: 'full' | 'long' | 'medium' | 'short',
        timeStyle?: 'full' | 'long' | 'medium' | 'short',
    ) {
        // We want to accept strings in case
        // someone forgot to parse a Date instance
        // from a stringified API object, but we
        // want to work with a Date instance from
        // here on out.
        const date = value instanceof Date
            ? value as Date
            : new Date(value);

        // If we were provided an invalid Date or
        // a string that could not be parse to a
        // valid date, just return whatever we got.
        // This will prevent errors at runtime.
        if (isNaN(date.getTime())) {
            return value;
        }

        // Use the browser's locale (per Chris) and
        // the provided format if applicable. The
        // TypeScript types for Intl.DateTimeFormatOptions
        // are out of date, so we cast the object to
        // "any" to get around the compiler's checks.
        const formatter = new Intl.DateTimeFormat(
            [ ...navigator.languages ],
            { dateStyle, timeStyle } as any
        );

        return formatter.format(date);
    }
}
