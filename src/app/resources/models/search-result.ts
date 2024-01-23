import { ContentDifficulty } from "../enums/content-difficulty.enum";
import { ContentType, ContentDocumentType, ContentPublisher } from "./content";
import { Library } from "./library";
import { Topic } from "./topic";

export class SearchResult {
    contentId: string;
    contentType: ContentType;
    documentType?: ContentDocumentType;
    title: string;
    description: string;
    imageUrl: string;
    searchScore: number;
    language: string;
    difficulty: ContentDifficulty;
    duration: number; // represent in seconds
    publisher: ContentPublisher;
    libraries: Library[];
    topics: Topic[];
    keywords: string[];
    children: SearchResult[];
    isPastDue?: boolean;
    isBookmarked?: boolean;
    progress?: number;

    constructor(data) {
        Object.assign(this, data);
        this.isPastDue = !!this.isPastDue;
        this.documentType = this.documentType ?? ContentDocumentType.Custom;
        this.isBookmarked = !!this.isBookmarked;
        this.progress = this.progress ?? 0;
        this.libraries = this.libraries ?? [];
        this.topics = this.topics ?? [];
        this.keywords = this.keywords ?? [];
        this.children = this.children ?? [];
    }
}
