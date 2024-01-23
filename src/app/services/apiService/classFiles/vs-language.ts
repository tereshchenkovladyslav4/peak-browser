export class Language {
    constructor(public code: string, public name: string) { }
}

export class LanguageSetResponse {
    constructor(public languageSet: Array<Language>) { }
}
