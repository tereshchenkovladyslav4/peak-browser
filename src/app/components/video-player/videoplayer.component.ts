import { Component, OnDestroy, Renderer2, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { VideoPlayerStateService } from '../../state/video-player/video-player-state.service';
import { VideoLinkType, VideoInfo } from './../../resources/models/video-info/video-info';
import { VideoPlayerHelper } from './videoplayer.helper';
import { Observable, Subject, Subscription, map } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

declare var AblePlayer: any;
declare var $: any;
declare function makeAblePlayerReady(): void;
declare function html2canvas(any);

@Component({
  selector: 'video-player',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    SpinnerComponent,
    AsyncPipe
  ]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input('videoInfo') videoInfo: VideoInfo;
  @Input('transcriptDiv') transcriptDiv: string = "";
  @Input('autoPlay') autoPlay: boolean = false;
  @Input('isEditMode') isEditMode: boolean = false;
  // optional - to update the state service when underlying ableplayer loads
  // values 'view_page' 'popup'
  @Input('videoPlayerStateServiceType') videoPlayerStateServiceType: string = null;

  @Output() loadedEvent = new EventEmitter<any>();
  @Output() playEvent = new EventEmitter<any>();
  @Output() pauseEvent = new EventEmitter<any>();
  @Output() endEvent = new EventEmitter<any>();
  @Output() timeUpdateEvent = new EventEmitter<any>();

  @Output() durationCaptured = new EventEmitter<VideoDurationCapturedArgs>();

  ablePlayerTranscriptDiv: string = "video-transcript-new";
  isPlaying: boolean = false;
  autoscrollTranscript: boolean = false;

  ablePlayer: any = null;
  durationSeconds: number = 0;
  durationMinutes: number = 0;

  destroyed: boolean = false;

  videoLoaded$: Observable<boolean>;
  videoLoadIntervalId: number; 
  localVideoLoaded$ = new Subject<any>();

  private subscription = new Subscription();

  //#region YouTube API Duration Variables
  public YT: any;
  public player: any;
  //#endregion

  constructor(private renderer: Renderer2,
              private videoPlayerState: VideoPlayerStateService) {

  }
  
  ngOnInit(): void {
    this.subscription.add(this.localVideoLoaded$.subscribe(e => this.updateStateService(true)));
    this.setInitVideo();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.subscription.unsubscribe();
  }

  private setInitVideo() {
    this.videoPlayerState.setLoaded(null); // set null so spinner shows
    this.videoInfo.videoLinkType = VideoPlayerHelper.getVideoLinkType(this.videoInfo.url);
    this.initNewVideo();
    this.setVideoLoaded();
  }

  initNewVideo() {
    let tempUrl = this.videoInfo.transcriptUrl;
    this.videoInfo.transcriptUrl = "";

    

    setTimeout(() => {
      this.videoInfo.transcriptUrl = tempUrl;
      this.loadVideo();

    }, 10);
  }

  setVideoLoaded() {
    this.videoLoaded$ = this.videoPlayerState.state$.pipe(map(state => state.isVideoLoaded));
  }

  removeExistingAblePlayerPreferences() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      if (name == "Able-Player")
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  loadVideo() {

    let transcriptTrack = "";
    let bookmarkTrack = "";
    let transcriptDiv = "";

    this.removeExistingAblePlayerPreferences();
    if (this.videoInfo.chaptersUrl.length > 0) {
      bookmarkTrack = `<track kind= "chapters" src= "` + this.videoInfo.chaptersUrl + `" />`;
    }

    let transcriptObject = document.getElementById(this.transcriptDiv);
    if (transcriptObject) {
      transcriptObject.innerHTML = `<div id="` + this.ablePlayerTranscriptDiv + `" style="height:inherit"></div>`;
    }

    if (this.videoInfo.transcriptUrl.length > 0) {
      transcriptTrack = `<track kind= "captions" src= "` + this.videoInfo.transcriptUrl + `" />`;
      transcriptDiv = ` data-transcript-div="` + this.ablePlayerTranscriptDiv + `" `
    }

    let autoplay = " "
    if (this.autoPlay) {
      autoplay = ` autoplay="true" `;
    }

    let standardFileAttribute = "";
    let streamingVideoAttribute = "";
    let streamingVideoDescriptionAttribute = "";

    switch (this.videoInfo.videoLinkType) {
      case VideoLinkType.EpCloudHostedFile:
      case VideoLinkType.LocalFile:
        this.videoInfo.contentType = 'video/mp4';
        this.videoInfo.streamingVideoId = '';
        standardFileAttribute = `<source id="vid-source" src="${this.videoInfo.url}" type="${this.videoInfo.contentType}" />`;
        break;

      case VideoLinkType.Vimeo:
        this.videoInfo.contentType = 'video/vimeo';
        this.videoInfo.streamingVideoId = VideoPlayerHelper.getVimeoVideoID(this.videoInfo.url);
        streamingVideoAttribute = `data-vimeo-id="${this.videoInfo.streamingVideoId}"`;
        streamingVideoDescriptionAttribute = `data-vimeo-desc-id="${this.videoInfo.streamingVideoDescriptionId}"`;
        break;

      case VideoLinkType.YouTube:
        this.videoInfo.contentType = 'video/youtube';
        this.videoInfo.streamingVideoId = VideoPlayerHelper.getYouTubeVideoID(this.videoInfo.url);
        streamingVideoAttribute = `data-youtube-id="${this.videoInfo.streamingVideoId}"`;
        streamingVideoDescriptionAttribute = `data-youtube-desc-id="${this.videoInfo.streamingVideoDescriptionId}"`;
        break;
    }

    try {
      let newInnerHtml =
        `<video id="able-video-main"
              data-able-player 
              data-skin="2020" 
              data-speed-icons="arrows" 
              style="width: 100%; max-height: 75vh; aspect-ratio: 16/9;" 
              data-hide-controls
              data-captions-position="overlay"
              preload="auto"
              oncontextmenu="return false;"
              ${autoplay}
              ${streamingVideoAttribute}
              ${streamingVideoDescriptionAttribute}
              ${transcriptDiv}>
            ${standardFileAttribute}
            ${transcriptTrack}
            ${bookmarkTrack}
        </video>`;

      document.getElementById("video-div").innerHTML = newInnerHtml;
    } catch (err) { }

    const vidElm = document.getElementById("able-video-main") as HTMLVideoElement;

    // works for non-vimeo & non-youtube videos
    if (this.videoInfo.videoLinkType === VideoLinkType.EpCloudHostedFile || this.videoInfo.videoLinkType === VideoLinkType.LocalFile) {
      vidElm.addEventListener('loadeddata', (event) => {
        // set video loaded state when video element's data is loaded
        this.localVideoLoaded$.next(true);
        this.loadedEvent.emit(this.ablePlayer);
      });
    }

    let component = this;
    setTimeout(() => this.addEventHandlers(vidElm), 1000);

    $(vidElm).each(function (index, element) {
      if ($(element).data('able-player') !== undefined) {
        component.ablePlayer = new AblePlayer($(this), $(element));
        // console.log(component.ablePlayer);

        // vimeo loaded - WILL BE UPDATED NEXT
        if (component.videoInfo?.videoLinkType === VideoLinkType.Vimeo) {
          setTimeout(() => {
            const vimeoPlayer = component.ablePlayer.vimeoPlayer;
            if (vimeoPlayer) {
              console.log(vimeoPlayer);
              console.log('vimeo ready');
              component.localVideoLoaded$.next(true);
              console.log(component.ablePlayer);
              component.loadedEvent.emit(component.ablePlayer);
            } else {
              console.log('NO VIMEO')
            }
          }, 1000);
        }

        // youtube loaded - WILL BE UPDATED NEXT
        if (component.videoInfo?.videoLinkType === VideoLinkType.YouTube) {
          setTimeout(() => {
            const youtubePlayer = component.ablePlayer.youTubePlayer;
            if (youtubePlayer) {
              console.log(youtubePlayer);
              console.log('youtube ready');
              component.localVideoLoaded$.next(true);
              component.loadedEvent.emit(component.ablePlayer);
            } else {
              console.log('NO YOUTUBE')
            }
          }, 1000);
        }

        setTimeout(() => component.setupTranscriptWindowWhenLoaded(), 1000);
        setTimeout(() => component.setVideoSizeWhenLoaded(), 1000);

        if (component.isEditMode) {
          // Start the Get Duration Process but give the player time to load up the video:
          setTimeout(() => component.getVideoDuration(), 1000);
        }
      }
    });
  }

  // WORKING ON VIMEO AND YOUTUBE NEXT (Today: 09/11/23)
  // private setVimeoLoaded(func: Function) {
  //   const maxTimeout = 10_000; // ms
  //   const delay = 250; // ms

  //   const intervalId = window.setInterval(() => {
  //     const vimeoPlayer = this.ablePlayer.vimeoPlayer;
  //     if (vimeoPlayer) {
  //       console.log(vimeoPlayer);
  //       console.log('vimeo ready');
  //       // component.localVideoLoaded$.next(true);
  //     } else {
  //       console.log('NO VIMEO')
  //     }
  //   }, delay)

  // }

  // private setYoutubeLoaded() {

  // }

  private setupTranscriptWindowWhenLoaded() {

    if (this.destroyed) {
      return;
    }

    if (!this.ablePlayer) {
      // console.log(`Player Not Created: Setup transcript window again shortly`);
      setTimeout(() => this.setupTranscriptWindowWhenLoaded(), 1000);
      return;
    }


    this.autoscrollTranscript = this.ablePlayer.autoScrollTranscript;

    // adjust the look of the transcript window
    if (this.videoInfo.transcriptUrl.length > 0) {
      let t_elm = document.getElementsByClassName('able-transcript-area');

      if (t_elm.length > 0) {
        if (document.getElementsByClassName('able-transcript-area') != null) {
          let ht_elm = t_elm[0] as HTMLElement;
          ht_elm.style.paddingBottom = "0px";
          ht_elm.style.borderColor = "#b5b5b5";
        }
      }
      if (document.getElementsByClassName('able-window-toolbar').length > 0) {
        let t_elm = document.getElementsByClassName('able-window-toolbar')[0] as HTMLElement;
        t_elm.style.display = "none";
      }
    }
  }

  updateStateService(videoLoaded: boolean = false) {
    switch (this.videoPlayerStateServiceType) {
      case "view_page":
        this.videoPlayerState.setViewPagePlayer(this);
        this.videoPlayerState.setLoaded(videoLoaded);
        break;
      case "popup":
        break;

    }
  }

  private setVideoSizeWhenLoaded() {

    if (this.destroyed) {
      return;
    }

    if (!this.ablePlayer) {
      // console.log(`Player Not Created: Set size again shortly`);
      setTimeout(() => this.setVideoSizeWhenLoaded(), 1000);
      return;
    }

    // At this point we know the player is created so we can fix up some of its CSS which causes display issues:
    $(".able").attr('style', 'z-index:1'); // Default is 5000 which means it shows on top of modals.
    $(".able-seekbar").attr('style', 'z-index:2'); // Default is 6900.

    if (this.videoInfo.videoLinkType === VideoLinkType.EpCloudHostedFile || this.videoInfo.videoLinkType === VideoLinkType.LocalFile) {
      // Stop the video from being shown in its native resolution (can't find out how to stop ableplayer from doing this):
      $(".able-wrapper").attr('style', 'width:auto'); // Default is 6900.
    }

    // if (this.videoPlayerStateServiceType != null) {
    //   this.updateStateService(true);
    // }
  }

  getVideoDuration() {

    // NOTE: ablePlayer.getDuration isn't necessarily a supported function to call externally but
    //       after days of trying, this is the simplest & cleanest solution to get the duration.

    if (this.destroyed) {
      return;
    }

    if (!this.ablePlayer) {
      // console.log(`Player Not Created: Get duration again shortly...`);
      setTimeout(() => this.getVideoDuration(), 1000);
      return;
    }

    let component = this;

    try {
      component.ablePlayer.getDuration().then(function (durationSeconds) {
        if (durationSeconds) {
          // console.log(`Duration: ${durationSeconds}`);

          component.durationSeconds = durationSeconds;
          component.durationMinutes = Math.ceil(durationSeconds / 60);

          var eventArgs = new VideoDurationCapturedArgs();
          eventArgs.totalSeconds = component.durationSeconds;
          eventArgs.roundedMinutes = component.durationMinutes;
          component.durationCaptured.emit(eventArgs);
        }
        else {
          // console.log(`No Duration: Trying again...`);
          setTimeout(() => component.getVideoDuration(), 100);
        }
      });
    } catch (err) {
      // console.log(`Get Duration Error: Trying again... `);
      setTimeout(() => component.getVideoDuration(), 250);
    }
  }

  updateAblePlayerChaptersButton() {
    if (document.getElementsByClassName('able-button-handle-chapters') != null) {

      let t_elm = document.getElementsByClassName('able-button-handler-chapters')[0] as HTMLElement;

      if (this.videoInfo.chaptersUrl.length > 0) {
        t_elm.style.display = "inline-block";
      }
      else {
        t_elm.style.display = "none";
      }
    }
  }

  // position in seconds to seek in the current video
  seekChapter(chapterIndex: number) {
    this.ablePlayer.seekToChapter(chapterIndex+1); 
  }

  // position in seconds
  seekPosition(position: number) {
    this.ablePlayer?.seekTo(position);
  }

  setTranscriptAutoScroll(scroll: boolean) {
    this.autoscrollTranscript = scroll;
    if (this.ablePlayer) {
      this.ablePlayer.handleTranscriptLockToggle(scroll);
    }
  }

  getTranscriptAutoScroll(): boolean {
    return this.autoscrollTranscript;
  }

  onPlay(event: any) {
    this.playEvent.emit(event);
  }

  onPause(event: any) {
    this.pauseEvent.emit(event);
  }

  onEnded(event: any) {
    this.endEvent.emit(event);
  }

  onTimeUpdate(event: any) {
    this.timeUpdateEvent.emit(event);
  }

  addEventHandlers(vidElm: HTMLVideoElement) {
    if (vidElm != null) {
      this.renderer.listen(vidElm, 'play', (event) => {
        if (this.isPlaying == false) {
          this.onPlay(event);
          this.isPlaying = true;
        }
      });

      this.renderer.listen(vidElm, 'timeupdate', (event) => {
        this.onTimeUpdate(event);
      });

      this.renderer.listen(vidElm, 'pause', (event) => {
        this.isPlaying = false;
        this.onPause(event);
      });

      vidElm.addEventListener('ended', (event) => {
        this.isPlaying = false;
        this.onEnded(event);
      });
    }
  }

  getFrameImage(frameId: string, canvasId: string) {
    let canvasElm = document.getElementById(canvasId) as HTMLCanvasElement;
    let frameElm = document.getElementById(frameId) as HTMLIFrameElement;

    let contentsDoc = frameElm.contentWindow.document;
    const body = contentsDoc.getElementsByTagName("body")[0];

    let frameContents = document.getElementById("frame-contents") as HTMLElement;
    frameContents.innerHTML = body.innerHTML;

    html2canvas(document.querySelector("#" + frameId)).then(canvas => {

      //create a new canvas
      var context = canvasElm.getContext('2d');

      //set dimensions
      //newCanvas.width = oldCanvas.width;
      //newCanvas.height = oldCanvas.height;

      //apply the old canvas to the new one
      context.drawImage(canvas, 0, 0);

      //return the new canvas
      //return newCanvas;


      //canvasElm.appendChild(canvas);
    });
  }

  getHTMLImage(elmId: string, canvasId: string) {
    let canvasElm = document.getElementById(canvasId) as HTMLCanvasElement;

    html2canvas(document.querySelector("#" + elmId)).then(canvas => {

      //create a new canvas
      var context = canvasElm.getContext('2d');

      //set dimensions
      //newCanvas.width = oldCanvas.width;
      //newCanvas.height = oldCanvas.height;

      //apply the old canvas to the new one
      context.drawImage(canvas, 0, 0);

      //return the new canvas
      //return newCanvas;


      //canvasElm.appendChild(canvas);
    });



    //var canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    //var elm = document.getElementById(elmId) as HTMLElement;

    //let html = elm.outerHTML;

    //this.render_html_to_canvas(html, canvas.getContext("2d"), 0, 0, elm.clientWidth, elm.clientHeight);
  }


  private render_html_to_canvas(html, ctx, x, y, width, height) {
    var xml = this.html_to_xml(html);
    xml = xml.replace(/\#/g, '%23');
    var data = "data:image/svg+xml;charset=utf-8," + '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
      '<foreignObject width="100%" height="100%">' +
      xml +
      '</foreignObject>' +
      '</svg>';

    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, x, y);
    }
    img.src = data;
  }

  private html_to_xml(html) {
    var doc = document.implementation.createHTMLDocument('');
    doc.write(html);

    // You must manually set the xmlns if you intend to immediately serialize     
    // the HTML document to a string as opposed to appending it to a
    // <foreignObject> in the DOM
    doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);

    // Get well-formed markup
    html = (new XMLSerializer).serializeToString(doc.body);
    return html;
  }

  getImageAt(seconds: number, canvasId: string) {
    var canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    var video = document.getElementById("able-video-main") as HTMLVideoElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight); // for drawing the video element on the canvas

    /** Code to merge image **/

    const playImage = new Image();
    playImage.src = 'path to image asset';

    playImage.onload = () => {
      const startX = (video.videoWidth / 2) - (playImage.width / 2);
      const startY = (video.videoHeight / 2) - (playImage.height / 2);
      canvas.getContext('2d').drawImage(playImage, startX, startY, playImage.width, playImage.height);

      canvas.toBlob((blob) => { // Canvas element gives a callback to listen to the event after blob is prepared from canvas
        const img = new Image();
        img.src = window.URL.createObjectURL(blob); // window object with static function of URL class that can be used to get URL from blob
      });
    };
  }
}

export class VideoDurationCapturedArgs {
  public totalSeconds: number
  public roundedMinutes: number
}
