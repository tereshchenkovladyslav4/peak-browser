/***
 * Deep compare
 * https://stackoverflow.com/a/44649659
 * @param x
 * @param y
 */
export function deepEquals(x, y) {
  if (x === y) {
    return true; // if both x and y are null or undefined and exactly the same
  } else if (!(x instanceof Object) || !(y instanceof Object)) {
    return false; // if they are not strictly equal, they both need to be Objects
  } else if (x.constructor !== y.constructor) {
    // they must have the exact same prototype chain, the closest we can do is
    // test their constructor.
    return false;
  } else {
    for (const p in x) {
      if (!x.hasOwnProperty(p)) {
        continue; // other properties were tested using x.constructor === y.constructor
      }
      if (!y.hasOwnProperty(p)) {
        return false; // allows to compare x[ p ] and y[ p ] when set to undefined
      }
      if (x[p] === y[p]) {
        continue; // if they have the same strict value or identity then they are equal
      }
      if (typeof (x[p]) !== 'object') {
        return false; // Numbers, Strings, Functions, Booleans must be strictly equal
      }
      if (!deepEquals(x[p], y[p])) {
        return false;
      }
    }
    for (const p in y) {
      if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
        return false;
      }
    }
    return true;
  }
}
