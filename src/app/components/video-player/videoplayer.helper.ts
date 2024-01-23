import { VideoLinkType } from './../../resources/models/video-info/video-info';

export abstract class VideoPlayerHelper {
  public static getVideoLinkType(url: string): VideoLinkType {

    if (!url) {
      return VideoLinkType.None;
    }

    var objUrl: URL;

    try {
      objUrl = new URL(url);
    }
    catch {
      return VideoLinkType.Invalid;
    }

    if (objUrl.pathname.endsWith('.mp4')) {
      if (objUrl.protocol.startsWith('http')) {
        return VideoLinkType.EpCloudHostedFile;
      }
      else if (objUrl.protocol.startsWith('file')) {
        return VideoLinkType.LocalFile;
      }
    }
    else if (this.getIsYouTubeUrl(url)) {
      return VideoLinkType.YouTube;
    }
    else if (this.getIsVimeoUrl(url)) {
      return VideoLinkType.Vimeo;
    }

    return VideoLinkType.Invalid;
  }

  private static getIsYouTubeUrl(url: string): boolean {

    // There are seemingly three domains that YouTube use:
    // youtube.com | youtu.be | youtube-nocookie.com
    // We just check for one of these domains for a positive answer.
    // https://stackoverflow.com/a/51848061/7149145

    let result = false;

    if (url) {
      let objUrl = new URL(url);
      var regex = new RegExp(/(?:www\.)*(?:youtu\.be|youtube\.com|youtube-nocookie\.com).*$/);

      result = regex.test(objUrl.hostname);
    }

    return result;
  }

  private static getIsVimeoUrl(url: string): boolean {

    // There are seemingly two domains that Vimeo use:
    // player.vimeo.com | vimeo.com
    // We just check for one of these domains for a positive answer.

    let result = false;

    if (url) {
      let objUrl = new URL(url);
      var regex = new RegExp(/(?:www\.)*(?:player\.vimeo\.com|vimeo\.com).*$/);

      result = regex.test(objUrl.hostname);
    }

    return result;
  }

  public static getVimeoVideoID(url: string): string {

    // Vimeo Urls can be in two formats:
    // https://vimeo.com/783455878 - This is most typical
    // https://vimeo.com/192207770/0faf1dd09d - And this is most atypical, the format is /{videoid}/{hash}
    // https://player.vimeo.com/video/328769500 - From embedded vimeos.
    // https://stackoverflow.com/questions/51414260/vimeo-url-ive-never-seen-before-with-two-different-ids-how-do-i-get-it-to-work

    let result = '';

    if (url) {
      let objUrl = new URL(url);
      let segments = objUrl.pathname.split('/').filter(x => x);

      // Pick the first segment that is numeric:
      for (var i = 0; i < segments.length; i++) {
        if (!isNaN(parseInt(segments[i]))) {
          result = segments[i];
          break;
        }
      }
    }

    return result;
  }

  public static getYouTubeVideoID(url: string): string {

    let result = '';

    if (url) {
      let objUrl = new URL(url);
      result = objUrl.searchParams.get('v');

      if (!result) {
        let segments = objUrl.pathname.split('/');

        if (segments.length > 0) {
          result = segments[segments.length - 1];
        }
      }
    }

    return result;
  }
}
