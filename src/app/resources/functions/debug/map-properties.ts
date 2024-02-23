/**
 * Appends mapped property strings to a debug object that is a shallow copy of the original object
 * @param obj object you'd like use as a template for mapping
 * @param mappings key-value list of properties and their associated mappings for the obj provided
 * @returns an object with the same properties as the original object with a new object containing a property for each key-value provided in mappings
 */
export function mapPropertiesDebug<T>(obj: T, mappings: [key: keyof T, mappedStr: string][]): Object {
  if (!obj || !mappings || !mappings?.length) {
    return obj;
  }

  const debugObjKey = '__EP_DEBUG__';
  const debugObjClone = { ...obj, [debugObjKey]: {} };

  mappings.forEach(([key, mappedStr]: [keyof T, string]) => {
    const keyStr = String(key);

    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'undefined') {
      debugObjClone[debugObjKey][keyStr] = mappedStr;
    } else {
      debugObjClone[debugObjKey][keyStr] = 'Unknown';
    }
  });

  return debugObjClone;
}
