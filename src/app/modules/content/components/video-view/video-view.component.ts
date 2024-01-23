import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VideoInfo } from '../../../../resources/models/video-info/video-info';
import { Video } from '../../../../resources/models/content';
import { VideoPlayerStateService } from '../../../../state/video-player/video-player-state.service'
import { VideoPlayerComponent } from '../../../../components/video-player/videoplayer.component';
import {SharedModule} from "../../../shared/shared.module";
import {NgStyle} from "@angular/common";

@Component({
  selector: 'ep-video-view',
  templateUrl: './video-view.component.html',
  styleUrls: ['./video-view.component.scss'],
  imports: [
    SharedModule,
    NgStyle,
    VideoPlayerComponent
  ],
  standalone: true
})
export class VideoViewComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() videoContent: Video = null;
  @Input() customStyles?: any = {};
  @ViewChild('videoPlayerViewPage') videoPlayer: VideoPlayerComponent
  
  @Output() loadedEvent = new EventEmitter<any>();
  @Output() playEvent = new EventEmitter<any>();
  @Output() pauseEvent = new EventEmitter<any>();
  @Output() endEvent = new EventEmitter<any>();
  @Output() timeUpdateEvent = new EventEmitter<any>();

  videoInfo: VideoInfo;

  constructor(private videoPlayerState: VideoPlayerStateService) {
    
  }

  ngOnInit() {
    this.setVideoInfo();
  }

  ngAfterViewInit() {
    this.videoPlayerState.setViewPagePlayer(this.videoPlayer);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // so videos load when switching between course content while consuming a LP
    if (changes['videoContent']) {
      this.setVideoInfo();
    }
  }

  private setVideoInfo() {
    this.videoInfo = new VideoInfo();
    this.videoInfo.url = this.videoContent.videoUrl;
    this.videoInfo.transcriptUrl = this.videoContent.transcriptUrl;
    this.videoInfo.chaptersUrl =  this.videoContent.chaptersUrl;
    this.videoInfo.contentType = "video/mp4";
    this.videoInfo.isExternalVideo = !this.videoInfo.url.toLowerCase().includes('http') || !this.videoInfo.url.toLowerCase().includes('.mp4');
  }

  onLoaded(event) {
    this.loadedEvent.emit(event);
  }

  onPlay(event) {
    this.playEvent.emit(event);
  }

  onTimeUpdate(event) {
    this.timeUpdateEvent.emit(event);
  }

  onPause(event) {
    this.pauseEvent.emit(event);
  }

  onEnded(event) {
    this.endEvent.emit(event);
  }
}
