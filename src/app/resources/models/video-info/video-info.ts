export enum VideoLinkType {
  None,
  Invalid,
  LocalFile,
  EpCloudHostedFile,
  YouTube,
  Vimeo
}

export class VideoInfo {
  public url: string = "";
  public contentType: string = "";
  public durationSeconds: number = 0;
  public durationMinutes: number = 0;
  public transcriptUrl: string = "";
  public chaptersUrl: string = "";
  public streamingVideoId: string = "";
  public streamingVideoDescriptionId: string = "";
  public videoLinkType: VideoLinkType = VideoLinkType.None;
  public isExternalVideo: boolean = false;
}

