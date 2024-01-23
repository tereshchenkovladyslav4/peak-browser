import {Library} from "../../resources/models/library";
import {Injectable} from "@angular/core";
import {BaseState, BaseStateService, setDefaultValues} from "../base-state";
import {map} from "rxjs/operators";

interface State extends BaseState {
  libraries: Library[];
}

const DEFAULT_STATE: State = setDefaultValues({
  libraries: null
});

@Injectable({
  providedIn: 'root'
})
export class LibraryStateService extends BaseStateService<State> {

  constructor() {
    super(DEFAULT_STATE);
  }

  updateLibraries(libraries: Library[]) {
    this.updateState({
      ...this.state$.getValue(),
      libraries: libraries
    });
  }

  selectLibraries() {
    return this.selectState(state => state.libraries);
  }

  selectLibrary(id) {
    return this.selectState(state => state.libraries?.find(library => library.libraryId === id) || null);
  }
}
