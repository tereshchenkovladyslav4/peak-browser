import { formatDurationLong, formatDurationShort } from './content';

describe('formatDurationShort function', () => {
  test('formats duration short without padding', () => {
    const result = formatDurationShort(3665); // 1 hour, 1 minute, and 5 seconds

    expect(result).toBe('1:01:05');
  });

  test('formats duration short with only seconds', () => {
    const result = formatDurationShort(30); // 30 seconds

    expect(result).toBe('00:30');
  });
});

describe('formatDurationLong function', () => {
  test('formats long duration without padding', () => {
    const result = formatDurationLong(3665); // 1 hour, 1 minute, and 5 seconds

    expect(result).toBe('1 hrs 1 min 5 sec');
  });

  test('formats long duration with only seconds', () => {
    const result = formatDurationLong(30); // 30 seconds

    expect(result).toBe('30 sec');
  });

  test('formats long duration with only minutes', () => {
    const result = formatDurationLong(120); // 2 minutes

    expect(result).toBe('2 min 0 sec');
  });

  test('formats long duration with only hours and minutes', () => {
    const result = formatDurationLong(7200); // 2 hours

    expect(result).toBe('2 hrs 0 min');
  });
});
