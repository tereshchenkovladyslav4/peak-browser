import { DownloadState } from '../../enums/download-state/download-state.enum';

export interface Download {
  content: Blob | null;
  progress: number;
  state: DownloadState;
  uuid?: number;
  name?: string;
}
