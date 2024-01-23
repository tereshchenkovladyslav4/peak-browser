/**
 * Title case function
 * @param str
 * source: https://stackoverflow.com/a/196991
 */
export function toTitleCase(str) {
  return str.replace(/_/g, " ").replace(
    /\b\w+('\w)?/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    }
  );
}
