import { THEME_TYPE } from 'src/app/resources/enums/theme-type';

export namespace ThemeActions {
  export class GetThemes {
    static readonly type = '[App Component] Get theme';
  }

  export class ResetThemeDefaults {
    static readonly type = '[App Bar Component] Reset theme defaults';
  }
}
