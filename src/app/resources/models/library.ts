import { ContentItem, FolderStructureContent, LibraryContent } from './content';
import { UserMicro } from './user';
import { GroupSummary } from './group';
import { SyncTopic } from './topic';


export class LibrarySummary {
    public libraryId: string;
    public name: string;
    public nameEndsWithCopy: boolean;
    public nameWithoutLastCopy: string;
}

export class Library extends LibrarySummary
{
    public imageUrl: string;
    public bannerImageUrl: string;
    public lastModified: Date;
    public lastModifiedBy: UserMicro;
    public syncedTopics: Array<SyncTopic>;
    public publishDate: Date;
    public description: string;
    public contentLastAdded: Date;
    contentCount: number;
    static copy = (library: Library) => {
        const newLibrary: Library = new Library();
        newLibrary.libraryId = library.libraryId;
        newLibrary.name = library.name;
        newLibrary.imageUrl = library.imageUrl;
        newLibrary.bannerImageUrl = library.bannerImageUrl;
        newLibrary.lastModified = library.lastModified;
        newLibrary.lastModifiedBy = library.lastModifiedBy;
        newLibrary.syncedTopics = library.syncedTopics.map(syncedTopic => SyncTopic.copy(syncedTopic));
        newLibrary.publishDate = library.publishDate;
        newLibrary.description = library.description;
        newLibrary.contentLastAdded = library.contentLastAdded;
        newLibrary.contentCount = library.contentCount;
        return newLibrary;
    }
  contentTopics?: any;
}


export class LibraryShareSettings {
    public mode: LibraryShareMode;

    public groups: Array<GroupSummary>;

        /// <summary>
        /// If <see cref="Mode"/> is <see cref="LibraryShareMode.AllUsers"/>, then
        /// 'true' means the library is shared with all users and 'false' means the
        /// library isn't shared with any users. If <see cref="Mode"/> is
        /// <see cref="LibraryShareMode.Groups"/>, then this field doesn't mean anything.
        /// </summary>
    public isShared: boolean;
}


export enum LibraryShareMode {
    Groups,
    AllUsers
}



//Responses

export class GetLibraryContentFromLibraryIdResponse {
    public content: Array<LibraryContent>;
    public shareSettings: LibraryShareSettings;
}

export class AddLibraryContentResponse {
    public contentIdsAdded: Array<string>;
    public contentIdsNotAdded: Array<string>;
}

export class RemoveLibraryContentResponse {
    public contentIdsRemoved: Array<string>;
    public contentIdsNotRemoved: Array<string>;
}

export class GetAllLibrariesResponse {
    public libraries: Array<Library>;
}

export class CreateLibraryRequest {
    public name: string;
    public imageUrl: string;
    public bannerImageUrl: string;
    public duplicateFromExistingLibrary: boolean;
    public existingLibraryId: string;
    public description: string;
    constructor(name: string, imageUrl: string, bannerImageUrl: string, duplicateFromExistingLibrary: boolean, existingLibraryId: string, description: string) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.bannerImageUrl = bannerImageUrl;
        this.duplicateFromExistingLibrary = duplicateFromExistingLibrary;
        this.existingLibraryId = existingLibraryId;
        this.description = description;
    }
    static createNew(name: string, imageUrl: string, description: string): CreateLibraryRequest {
        return new CreateLibraryRequest(name, imageUrl, null, false, "", description);
    }
    static createFromExisting(name: string, imageUrl: string, creatingFromLibraryId: string, description: string): CreateLibraryRequest {
        return new CreateLibraryRequest(name, imageUrl, null, true, creatingFromLibraryId, description);
    }
    static duplicateLibrary(libraryToDuplicate: Library, duplicateLibraryName: string): CreateLibraryRequest {
        return new CreateLibraryRequest(duplicateLibraryName, libraryToDuplicate.imageUrl, libraryToDuplicate.bannerImageUrl, true, libraryToDuplicate.libraryId, libraryToDuplicate.description);
    }
}

export class CreateLibraryResponse {
    public newLibrary: Library;
}

export class UpdateLibraryDetailsRequest {
    public name: string;
    public imageUrl: string;
    public bannerImageUrl: string;
    public description: string;
    constructor(name: string, imageUrl: string, bannerImageUrl: string, description: string) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.bannerImageUrl = bannerImageUrl;
        this.description = description;
    }
}

export class UpdateLibraryDetailsResponse {
    public modifiedLibrary: Library;
}

export class GetAllSubscriptionLibrariesResponse {
    public libraries: Array<Library>;
}

export class GetLibraryContentResponse {
    public content: Array<LibraryContent>;
    public shareSettings: LibraryShareSettings;
}

export class ModifyLibraryShareSettingsRequest {
    public newMode: LibraryShareMode;
    public newGroupIds: Array<string>;
    public isShared: boolean;
    constructor(newMode: LibraryShareMode, newGroupIds: Array<string>, isShared: boolean) {
        this.newMode = newMode;
        this.newGroupIds = newGroupIds;
        this.isShared = isShared;
    }
}
export class ModifyLibraryShareSettingsResponse {
    public settings: LibraryShareSettings;
}

export class GetLibraryShareSettingsResponse {
    public shareSettings: LibraryShareSettings;
}

export class GetLibraryResponse {
    public library: Library;
}
