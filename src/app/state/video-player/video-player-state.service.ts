import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import { VideoPlayerComponent } from '../../components/video-player/videoplayer.component';


export const GUID_EMPTY = "00000000-0000-0000-0000-000000000000";

interface State {
  videoViewPagePlayer: VideoPlayerComponent;
  videoPopupPlayer: VideoPlayerComponent;
  isVideoLoaded: boolean;
}

const DEFAULT_STATE: State = {
  videoViewPagePlayer: null,
  videoPopupPlayer: null,
  isVideoLoaded: false
}
@Injectable({
  providedIn: 'root'
})
export class VideoPlayerStateService {

  state$: BehaviorSubject<State> = new BehaviorSubject<State>(DEFAULT_STATE);

  constructor() {

  }


  getViewPagePlayer(): Observable<VideoPlayerComponent> {
    return this.state$.pipe(
      map(state => state.videoViewPagePlayer)
    );
  }

  setViewPagePlayer(player: VideoPlayerComponent) {
    this.updateState({
      ...this.state$.getValue(),
      videoViewPagePlayer: player
    });

  }

  setLoaded(loaded: boolean | null = false) {
    this.updateState({
      ...this.state$.getValue(),
      isVideoLoaded: loaded
    })
  }

  private updateState(state: State) {
    this.state$.next(state);
  }
}
