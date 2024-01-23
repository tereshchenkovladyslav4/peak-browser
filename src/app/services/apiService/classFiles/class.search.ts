import { ContentType_T } from "./class.content";

export class FacetValue {
    name: string = "";
    fieldValue: string = "";
    count: number = 0;
    isActive: boolean = false;
    indentLevel: number = 0;
}

export class SearchFacet {
    name: string = "";
    field: string = "";
    values: Array<FacetValue> = [];
}

export class SearchResult {
    name: string = "";
    desc: string = "";
    contentid: string = "";
    subid: string = "";
    score: number = 0;
    path: string = "";
    contentType: ContentType_T = ContentType_T.cheatsheet;
    url: string = "";
    imageUrl: string = "";
    videoTime: string = "";
    wf_name: string = "";
    pr_name: string = "";
    task_name: string = "";
    lp_name: string = "";
    wfid: string = "";
    prid: string = "";
    taskid: string = "";
    lpid: string = "";
    indent: number = 0;
    hasChildren: boolean = false;
    orig_rank: number = 0;
    products: Array<string> = new Array<string>();
    biscustom: boolean = false;
    doc_extension: string = "";
    publisher: string = "";
    isCompleted: boolean = false;
    completedDate: string = "";
}

export class SearchResults {
    results: Array<SearchResult> = [];
    facets: Array<SearchFacet> = [];
}

export class SearchConnector {
  public connectorId: string = "";
  public userId: string = "";
  public appName: string = ""; 
  public searchTerm: string = "";
}

