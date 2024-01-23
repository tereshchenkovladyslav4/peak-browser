import { Library } from "../../resources/models/library";
export namespace LibraryActions {

  export class CurrentLibrariesFromApi {
    static readonly type = '[Library] Get All Libraries From API';
  }

  export class UpdateLibraries {
    static readonly type = '[Library] Update Libraries';
    constructor(public libraries: Library) {}
  }

}
