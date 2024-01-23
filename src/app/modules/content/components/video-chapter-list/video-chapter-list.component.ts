import { Component, OnInit, Input } from '@angular/core';
import { VideoPlayerComponent } from 'src/app/components/video-player/videoplayer.component';
import { VideoChapter } from 'src/app/resources/models/content';
import { VideoPlayerStateService } from 'src/app/state/video-player/video-player-state.service';


@Component({
  selector: 'ep-video-chapter-list',
  templateUrl: './video-chapter-list.component.html',
  styleUrls: ['./video-chapter-list.component.scss']
})
export class VideoChapterListComponent implements OnInit {
  @Input('chapters') chapters: VideoChapter[];
  videoPlayer: VideoPlayerComponent = null;
  selChapterIndex = -1;

  constructor(private videoPlayerStateService: VideoPlayerStateService) {

  }

  ngOnInit(): void {
    if (this.chapters?.length > 0) {
      // default to selecting the first chapter
      this.videoPlayerStateService.getViewPagePlayer()?.subscribe(res => {
        this.videoPlayer = res;
        this.videoPlayer.timeUpdateEvent.subscribe(res => { this.onVideoTimeUpdate(res); });
        this.onVideoTimeUpdate(null);
      });
    }
  }


  onSelChapter(index: number) {
    this.selChapterIndex = index;
    this.videoPlayer?.seekPosition(this.chapters[index].position);
    this.videoPlayer?.seekChapter(index);
  }

  onVideoTimeUpdate(event: any) {
    let curChap = -1;
    if (this.chapters?.length > 0 && this.videoPlayer.ablePlayer != null) {
      let pos: number = this.videoPlayer?.ablePlayer?.media?.currentTime;

      if (pos) {

        for (let i = 0; i < this.chapters?.length; i++) {
          if (pos >= this.chapters[i].position) {
            curChap = i;
          }
          else {
            break;
          }
        }
      }
    }
    this.selChapterIndex = curChap;
  }

}
