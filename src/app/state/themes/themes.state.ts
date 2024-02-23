import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ColorScheme, Theme } from 'src/app/resources/models/theme';
import { ThemeActions } from './themes.actions';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { EMPTY, catchError, delay, map, of, tap, throwError, timeout } from 'rxjs';
import { Guid } from 'src/app/resources/models/guid';
import { getHighContrastColorFromHex, hexToHsl } from 'src/app/resources/functions/colors/colors';

const DEFAULT_CSS_VARS: { [key: string]: string } = {
  '--navigation-color-hue': '222',
  '--navigation-color-saturation': '21%',
  '--navigation-color-lightness': '21%',
  '--high-contrast-navigation-color': 'white',
  '--primary-color-hue': '149',
  '--primary-color-saturation': '58%%',
  '--primary-color-lightness': '53%%',
  '--high-contrast-primary-color': 'white',
  '--secondary-color-hue': '222',
  '--secondary-color-saturation': '100%',
  '--secondary-color-lightness': '69%',
  '--high-contrast-secondary-color': 'white',
  '--font-family': ' sans-serif',
};

export interface ThemeStateModel {
  theme: Theme;
  colorScheme: ColorScheme;
  isThemeLoading: boolean;
}

const DEFAULT_STATE: ThemeStateModel = {
  theme: null,
  colorScheme: null,
  isThemeLoading: true,
};

@State<ThemeStateModel>({
  name: 'themes',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class ThemeState {
  constructor(private organizationService: OrganizationService) {}

  // SELECTORS
  @Selector()
  static menuLogoImage(state: ThemeStateModel) {
    return state.theme.menuLogoImage;
  }

  @Selector()
  static menuLogoImageCollapsed(state: ThemeStateModel) {
    return state.theme.menuLogoImageCollapsed;
  }

  @Selector()
  static menuLogoUrl(state: ThemeStateModel) {
    return state.theme.menuLogoUrl;
  }

  @Selector()
  static backgroundImage(state: ThemeStateModel) {
    return state.theme.backgroundImageEnabled ? state.theme.backgroundImage : undefined;
  }

  @Selector()
  static libraryImage(state: ThemeStateModel) {
    return state.theme.libraryImage;
  }

  @Selector()
  static colorScheme(state: ThemeStateModel) {
    return state.colorScheme;
  }

  @Selector()
  static isThemeLoading(state: ThemeStateModel) {
    return state.isThemeLoading;
  }

  // ACTIONS
  @Action(ThemeActions.GetThemes, { cancelUncompleted: true })
  getThemes({ patchState }: StateContext<ThemeStateModel>) {
    patchState({ isThemeLoading: true });
    return this.organizationService.getTheme().pipe(
      tap((theme: Theme) => {
        if (!theme) {
          console.error('no theme retreieved');
          return;
        }

        if (!theme.colorSchemes?.length) {
          console.error('no color schemes found in theme');
          return;
        }

        const colorScheme = theme.colorSchemes[0];
        this.injectTheme(theme, colorScheme);
        patchState({ theme, colorScheme, isThemeLoading: false });
      }),
      catchError((error) => {
        console.error('get themes error: ', error);
        patchState({ isThemeLoading: false });
        return EMPTY;
      })
    );
  }

  @Action(ThemeActions.ResetThemeDefaults)
  resetThemeDefaults({ patchState }: StateContext<ThemeStateModel>) {
    patchState({ ...DEFAULT_STATE });
    this.setCssProperties(DEFAULT_CSS_VARS);
  }

  /**
   * Inject theme and color scheme data into root stylesheet
   * @param theme theme that has properties to inject into root stylesheet
   * @param colorScheme color scheme that has properties to inject into root stylesheet
   */
  private injectTheme(theme: Theme, colorScheme: ColorScheme): void {
    // validate
    if (!this.isThemeValid(theme)) {
      return;
    }

    // theme
    const navigationColorHsl = hexToHsl(colorScheme.colorNavigation);
    const primaryColorHsl = hexToHsl(colorScheme.colorPrimary);
    const secondaryColorHsl = hexToHsl(colorScheme.colorSecondary);

    this.setCssProperties({
      '--navigation-color-hue': navigationColorHsl.h.toString(),
      '--navigation-color-saturation': navigationColorHsl.s.toString() + '%',
      '--navigation-color-lightness': navigationColorHsl.l.toString() + '%',
      '--high-contrast-navigation-color': getHighContrastColorFromHex(colorScheme.colorNavigation),
      '--primary-color-hue': primaryColorHsl.h.toString(),
      '--primary-color-saturation': primaryColorHsl.s.toString() + '%',
      '--primary-color-lightness': primaryColorHsl.l.toString() + '%',
      '--high-contrast-primary-color': getHighContrastColorFromHex(colorScheme.colorPrimary),
      '--secondary-color-hue': secondaryColorHsl.h.toString(),
      '--secondary-color-saturation': secondaryColorHsl.s.toString() + '%',
      '--secondary-color-lightness': secondaryColorHsl.l.toString() + '%',
      '--high-contrast-secondary-color': getHighContrastColorFromHex(colorScheme.colorSecondary),
      '--font-family': theme.fontFace,
    });
  }

  private setCssProperties(cssVars: { [key: string]: string }): void {
    const root = document.documentElement;
    if (!root) {
      console.error('Unable to retrieve root element');
      return;
    }

    root.style.setProperty('--navigation-color-hue', cssVars['--navigation-color-hue']);
    root.style.setProperty('--navigation-color-saturation', cssVars['--navigation-color-saturation']);
    root.style.setProperty('--navigation-color-lightness', cssVars['--navigation-color-lightness']);
    root.style.setProperty('--high-contrast-navigation-color', cssVars['--high-contrast-navigation-color']);
    root.style.setProperty('--primary-color-hue', cssVars['--primary-color-hue']);
    root.style.setProperty('--primary-color-saturation', cssVars['--primary-color-saturation']);
    root.style.setProperty('--primary-color-lightness', cssVars['--primary-color-lightness']);
    root.style.setProperty('--high-contrast-primary-color', cssVars['--high-contrast-primary-color']);
    root.style.setProperty('--secondary-color-hue', cssVars['--secondary-color-hue']);
    root.style.setProperty('--secondary-color-saturation', cssVars['--secondary-color-saturation']);
    root.style.setProperty('--secondary-color-lightness', cssVars['--secondary-color-lightness']);
    root.style.setProperty('--high-contrast-secondary-color', cssVars['--high-contrast-secondary-color']);
    root.style.setProperty('--font-family', cssVars['--font-family']);
  }

  private isThemeValid(theme: Theme): boolean {
    if (!theme) {
      return false;
    }

    if (theme.currentColorSchemeId === Guid.Empty) {
      return false;
    }

    return true;
  }
}
