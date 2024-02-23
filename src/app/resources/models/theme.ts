import { THEME_TYPE } from '../enums/theme-type';

export const DEFAULT_OPEN_MENU_LOGO: string = 'assets/images/nav-menu/peak-logo-lg.svg';
export const DEFAULT_COLLAPSED_MENU_LOGO: string = 'assets/images/nav-menu/peak-logo-sm.svg';
export const DEFAULT_BACKGROUND_IMAGE: string = 'assets/images/mountains-bg.png';
export const DEFAULT_LIBRARY_IMAGE: string = 'assets/images/default-library-image-2.png';

/**
 * api implementation for Theme
 */
export class ThemeDTO {
  public themeId: string;
  public tenantId: string;
  public partnerId: string;
  public currentColorSchemeId: string;
  public themeType: THEME_TYPE;
  public isCurrentTheme: boolean;
  public name: string;
  public fontFace: string;
  public menuLogoImage: string;
  public menuLogoImageCollapsed: string;
  public menuLogoUrl: string;
  public backgroundImage: string;
  public backgroundImageEnabled: boolean;
  public libraryImage: string;
  public createdDate: Date;
  public modifiedDate: Date;
  public colorSchemes: ColorSchemeDTO[];
}

/**
 * api implementation for ColorScheme
 */
export class ColorSchemeDTO {
  public colorSchemeId: string;
  public themeId: string;
  public themeType: THEME_TYPE;
  public tenantId: string;
  public partnerId: string;
  public name: string;
  public colorNavigation: string;
  public colorPrimary: string;
  public colorSecondary: string;
  public createdDate: Date;
  public modifiedDate: Date;
}

/**
 * client implementation for Theme
 */
export class Theme extends ThemeDTO {
  public static allowedFonts = ['Roboto', 'Source Serif Pro', 'Quicksand', 'Eczar', 'Josefin Sans', 'Playfair Display'];

  public override colorSchemes: ColorScheme[];
}

/**
 * client implementation for ColorScheme
 */
export class ColorScheme extends ColorSchemeDTO {
  public isCustom: boolean;
}

/**
 * Map api theme data to UI theme data
 * @param themeDto theme obj from api
 * @returns theme obj for UI
 */
export function mapThemeData(themeDto: ThemeDTO): Theme {
  return {
    ...themeDto,
    menuLogoImage: !!themeDto?.menuLogoImage ? themeDto?.menuLogoImage : DEFAULT_OPEN_MENU_LOGO,
    menuLogoImageCollapsed: !!themeDto?.menuLogoImageCollapsed
      ? themeDto?.menuLogoImageCollapsed
      : DEFAULT_COLLAPSED_MENU_LOGO,
    backgroundImage: !!themeDto?.backgroundImage ? themeDto?.backgroundImage : DEFAULT_BACKGROUND_IMAGE,
    libraryImage: !!themeDto?.libraryImage ? themeDto?.libraryImage : DEFAULT_LIBRARY_IMAGE,
    fontFace:
      !!themeDto?.fontFace && Theme.allowedFonts.includes(themeDto?.fontFace)
        ? themeDto?.fontFace
        : Theme.allowedFonts[0],
    colorSchemes: themeDto?.colorSchemes?.map((cs) => mapColorSchemeData(cs)),
  };
}

/**
 * Map api color scheme data to UI color scheme data
 * @param colorSchemeDto color scheme obj from api
 * @returns color scheme obj for UI
 */
export function mapColorSchemeData(colorSchemeDto: ColorSchemeDTO): ColorScheme {
  return {
    ...colorSchemeDto,
    isCustom: colorSchemeDto.themeType !== THEME_TYPE.EAGLE_POINT_THEME,
  };
}
