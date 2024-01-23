import { PipeTransform, Pipe, NgModule } from '@angular/core';

@Pipe({
  name: 'epNumberToTimestamp'
})
export class EpNumberToTimestampPipe implements PipeTransform {

  transform(seconds: number, leadingZeroes: 'secondsonly' | 'secondsandminutes' = 'secondsandminutes') {

    // Handle the cases where we're passed bad data.
    if (seconds === null || seconds === undefined || typeof seconds !== 'number' || seconds < 0) {
      return leadingZeroes === 'secondsonly' ? '0:00' : '00:00';
    }

    // Calculate numeric representations by assuming the
    // input is a number of seconds and that we won't be
    // dealing with anything on the scale of days or larger.
    const currentTime = Math.round(seconds);
    const rawHours = Math.floor(currentTime / 3600);
    const rawMinutes = Math.floor((currentTime % 3600) / 60);
    const rawSeconds = Math.floor(currentTime % 60);

    // Convert the numeric representations into string parts
    // so we can concatenate a timestamp.
    const hoursPart = rawHours > 0
      ? `${rawHours}:`
      : '';
    const minutesPart = leadingZeroes === 'secondsandminutes' && rawMinutes < 10
      ? `0${rawMinutes}:`
      : `${rawMinutes}:`;
    const secondsPart = rawSeconds < 10
      ? `0${rawSeconds}`
      : `${rawSeconds}`;

    return `${hoursPart}${minutesPart}${secondsPart}`;
  }
}
