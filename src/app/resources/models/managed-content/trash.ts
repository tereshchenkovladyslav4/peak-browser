import { UserMicro } from '../user';

export class GetAllTrashResponse {
  trash: TrashedContent[];
}

export class TrashedContent {
  contentId: string;
  contentName: string;
  contentType: string;
  trashedDate: string;
    trashedBy: UserMicro;
  selected: boolean;
  showtrashedDate: string;
  atTime: string;
  contentIcon: string;
  pathName: string;
}


export class ValidateItemsCanBeTrashedResponse {
  results: TrashValidationResult[];
}

export class TrashValidationResult {
  contentId: string;
  canBeTrashed: boolean;
  violations: TrashViolation[];
}
export class TrashViolation {
  id: string;
  title: string;
  violationType: string;
}
