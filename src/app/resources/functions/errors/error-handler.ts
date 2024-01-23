import { throwError } from "rxjs";

export function errorHandler(response: any) {
  const error = response.error;
  const keys = Object.keys(error);
  const key = keys[0];
  let message = error[key];

  if (response.status === 0) {
    console.log(this.translationService.getTranslationFileData('general-toast-area.server-error-toast-message'));
  }

  if (error[key] instanceof Array) {
    message = error[key][0];
  }

  return throwError({ messages: message, error });
}
