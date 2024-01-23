/**
 * duration number to a formatted string
 * @param duration duration in seconds
 */
function formatDuration(duration: number, padded: boolean = false) {
  let seconds = duration;
  let hours = 0;
  let minutes = 0;
  let paddedMinutes = '00';
  let paddedSeconds = '00';
  if (seconds >= 3600) {
    hours = Math.floor(seconds / 3600);
    seconds %= 3600;
  }
  
  if (seconds >= 60) {
    minutes = Math.floor(seconds / 60);
    seconds %= 60;
    paddedMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  }

  paddedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

  return {hours, minutes: padded ? paddedMinutes : minutes, seconds: padded ? paddedSeconds : seconds};
}

export function formatDurationShort(duration: number): string {
  const {hours, minutes, seconds} = formatDuration(duration, true);
  if (hours === 0) {
    return `${minutes}:${seconds}`
  }

  return `${hours}:${minutes}:${seconds}`;
}

export function formatDurationLong(duration: number): string {
  const {hours, minutes, seconds} = formatDuration(duration);
  if (hours === 0) {
    if (minutes === 0) {
      return `${seconds} sec`;
    }
    return `${minutes} min ${seconds} sec`;
  }

  if (seconds === 0) {
    return `${hours} hrs ${minutes} min`;
  }

  return `${hours} hrs ${minutes} min ${seconds} sec`;
}