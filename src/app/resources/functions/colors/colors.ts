export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export const LIGHT_COLOR = '#ffffff';
export const DARK_COLOR = '#626262';

/**
 * Determines whether to use the supplied light or dark color based on the contrast with the baseColor
 * @param baseColor
 * @param lightColor
 * @param darkColor
 * @returns
 */
export function getHighContrastColorFromHex(
  baseColor: string,
  lightColor: string = LIGHT_COLOR,
  darkColor: string = DARK_COLOR
): string {
  const { r, g, b } = hexToRgb(baseColor);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
}

export function hexToRgb(hexColor: string): RGB {
  if (!hexColor || !hexColor.startsWith('#')) {
    return { r: 0, g: 0, b: 0 };
  }

  var color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
  return {
    r: parseInt(color.substring(0, 2), 16),
    g: parseInt(color.substring(2, 4), 16),
    b: parseInt(color.substring(4, 6), 16),
  };
}

export function hexToHsl(hexColor: string): HSL {
  if (!hexColor || !hexColor.startsWith('#')) {
    return { h: 0, s: 0, l: 0 };
  }

  return rgbToHsl(hexToRgb(hexColor));
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h *= 360;
  s *= 100;
  l *= 100;

  h = Math.round(h);
  s = Math.round((s + Number.EPSILON) * 10) / 10;
  l = Math.round((l + Number.EPSILON) * 10) / 10;

  return { h, s, l };
}

export function hslToString({ h, s, l }: HSL): string {
  return `hsl(${h} ${s}% ${l}%)`;
}
