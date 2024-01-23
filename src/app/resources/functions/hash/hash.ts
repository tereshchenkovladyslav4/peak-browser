export function hashObject(object) {
  return Math.abs(hash(JSON.stringify(object)));
}

/**
 * Hashing function
 * @param s
 * source: https://stackoverflow.com/a/7616484
 */
export function hash(s) {
  let hash = 0;

  if (!s.length) {
    return hash;
  }

  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}
