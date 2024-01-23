import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { map, Observable, take } from 'rxjs';
import { deepEquals } from '../../resources/functions/object/deep-equals';
import { Library } from '../../resources/models/library';
import { LibrariesService } from '../../services/libraries/libraries.service';
import { LibraryService } from '../../services/library/library.service';
import { FilterActions } from '../filter/filter.actions';
import { FilterState } from '../filter/filter.state';
import { LibraryActions } from './library.actions';

export interface LibraryState {
  libraries: Library[];
  isLoaded: boolean;
}

const DEFAULT_LIBRARY_STATE = {
  libraries: [],
  isLoaded: false
} as LibraryState;

@State<LibraryState>({
  name: 'Libraries',
  defaults: DEFAULT_LIBRARY_STATE
})
@Injectable()
export class LibraryState {

  constructor(private libraryService: LibrariesService,
    private store: Store) { }

  @Action(LibraryActions.CurrentLibrariesFromApi)
  CurrentLibrariesFromApi(libraryState: StateContext<LibraryState>) {
    const { isLoaded } = libraryState.getState();

    if (isLoaded)
      return;
    
    this.libraryService
      .fetchLibraries()
      .pipe(
        take(1)
      ).subscribe(libraries => {
        this.store.dispatch(new FilterActions.UpdateData(libraries));
        libraryState.patchState({ libraries, isLoaded: true });
      })
  }

  @Selector()
  static getLibraryContents(libraries: Library[], id: string) {
    return libraries.find(library => library.libraryId === id).contentTopics
  }

  @Selector()
  static getLibrary(
    libraryState: StateContext<Library[]>,
    id: string) {
    return libraryState
      .getState()
      .find(library => library.libraryId === id);
  }

  @Selector()
  static getLibraries(state: LibraryState): Library[] {
    return state.libraries;
  }

  @Selector()
  static getIsLoaded(state: LibraryState): boolean {
    return state.isLoaded;
  }
}
