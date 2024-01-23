export interface ScormModel {
    initialized: boolean,
    terminated: boolean,
    committed: boolean,
    lastError: number,
    diagnostic: string,
    cmi: any // This could be ScormCMI or ScormCMI2004 but the browser doesn't use any of it.
}