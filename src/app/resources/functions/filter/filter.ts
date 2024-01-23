import {isNumeric} from "../types/is-numeric";

export function  stringifySelectedFiltersQueryParam(selectedFilters: any): string {
  const qs = require('qs');
  const cleanFilters = (filters) => Object.fromEntries(
    Object.entries(filters).map(([k, v]: [string, any]) => {
      if (typeof v === 'object') {
        return [k, cleanFilters(v)]
      } else {
        return [k, v];
      }
      // tidy up the data being written to the url - remove null, false, undefined, {}, etc.; save all numbers (0's, etc.)
    }).filter(([k, v]: [string, any]) => {
      const durationKeys = ['value', 'highValue'];

      if (durationKeys.includes(k)) {
        return true;
      } else if (typeof v === 'object') {
        return !!Object.keys(v).length;
      } else if (Array.isArray(v)) {
        return !!v.length
      } else if (isNumeric(v)) {
        return true;
      } else {
        return !!v;
      }
    })
  )

  return qs.stringify(cleanFilters(selectedFilters), {
    allowDots: true,
    arrayFormat: 'comma',
    // can be extended to perform custom encoding
    encoder: function (str, defaultEncoder, charset, type) {
      if (type === 'key') {
        // Encoded key
        return defaultEncoder(str);
      } else if (type === 'value') {
        // Encoded value
        return defaultEncoder(str);
      }
    }
  });
}

export function parseSelectedFiltersQueryParam(queryParam: string) {
  const qs = require('qs');
  return qs.parse(queryParam, {
    comma: true,
    allowDots: true,
    decoder: function (str, defaultDecoder, charset, type) {
      // Encoded key
      if (type === 'key') {
        return defaultDecoder(str);
        // Encoded value
      } else if (type === 'value') {
        if (str.toLowerCase() === 'true') {
          return true;
        }

        if (str.toLowerCase() === 'false') {
          return false;
        }

        if (isNumeric(str)) {
          return +str;
        }

        return defaultDecoder(str);
      }
    }
  });
}
