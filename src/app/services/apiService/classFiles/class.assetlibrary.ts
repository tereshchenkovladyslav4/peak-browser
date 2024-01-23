export class AssetLibrary {
    public assetLibraryId: string = "";
    public name: string = ""
    public isSubcription: boolean = false;
    public productCollection: AssetLibraryProduct[] = [];
}

export class AssetLibraryProduct {
  public assetLibraryId: string = "";
  public productId: string = "";
  public name: string = "";
  public imageURL: string = "";
}

export class AssetLibraryContent {
  public name: string = "";
  public contentId: string = "";
  public imageUrl: string = "";
  public providedBy: string = "";
  public children: Array<AssetLibraryContent> = [];
  public column: number = 0;
    public isCompleted: boolean = false;
    public completedDate: string = "";
}
export class AssetLibraryContentSummary {
    public learningPaths: Array<AssetLibraryContent> = [];
  public workfows: Array<AssetLibraryContent> = [];
  public cheatSheets: Array<AssetLibraryContent> = [];
  public videos: Array<AssetLibraryContent> = [];
}
export class SubscriptionAssetSummary {
    public workflowCount: number = 0;
  public cheatSheetCount: number = 0;
  public videoCount: number = 0;
  public learningPathCount: number = 0;
}

export class AssetLibraryProductVersion {
  public assetLibraryId: string = "";
  public productId: string = "";
  public productName: string = "";
  public versionId: string = "";
  public versionName: string = "";
  public name: string = "";
  public imageURL: string = "";
  public seq: number = 0;
}
