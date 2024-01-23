import { Injectable } from '@angular/core';
import { ProdGenApi } from './apiService/prodgen.api';
import { LocalStorageService } from './storage/services/local-storage.service';

/**
 * Async modal dialog service
 * DialogService makes this app easier to test by faking this service.
 * TODO: better modal implementation that doesn't use window.confirm
 */
@Injectable()
export class WidgetLibraryService {
    widgetLibrary: Array<WidgetLibraryEntry> = new Array<WidgetLibraryEntry>();

    selectedAssetLibID: string = "";
    isUsingWidgets: boolean = false;
    // add all the widget library entries here
    constructor(private localStorage: LocalStorageService) {

        let lib: Array <WidgetLibraryEntry> = new Array<WidgetLibraryEntry>();
        // Currently valid Binding Types are Layout and Workgroup
        this.addWidgetToLibrary(lib,
            "My Assets",
            "fa fa-bookmark",
            "Displays a list of content that has been shared to 'My Assets'",
            "MyAssetsWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "My Work Groups",
            "fa fa-users",
            "Displays the Work Groups of which a user is currently a member.",
            "MyWorkgroupsWidgetComponent",
            ["Layout"]);


        this.addWidgetToLibrary(lib,
            "Download Addons",
            "fa fa-download",
            "Download additional add-ons for Pinnacle.",
            "DownloadAddonsWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "User Profile",
            "fa fa-user",
            "Display information about the current user.",
            "ProfilePanelWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Search Assets or Training",
            "fa fa-search",
            "Allows the user to search the platform for content or training.",
            "SearchWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "My Courses",
            "fa fa-graduation-cap",
            "Displays the Courses in which a user is currently enrolled.",
            "MyCoursesWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "My Frequently Used Assets",
            "fa fa-hourglass-half",
            "Displays the user's frequently accessed content.",
            "FrequentlyUsedWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Trending Assets",
            "fa fa-chart-line",
            "Displays currently trending content in your company.",
            "TrendingWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Platform Provider News & Links",
            "fa fa-newspaper",
            "Displays any news items or important links from the platform provider.",
            "PartnerNewsWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Company News & Links",
            "fa fa-newspaper",
            "Displays any news items or important links that have been configured by your company.",
            "CompanyNewsWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Asset Library",
            "fa fa-book",
            "Displays the asset library.",
            "AssetLibraryWidgetComponent",
            ["Layout"]);

        //TESTING
        this.addWidgetToLibrary(lib,
            "RSS Feed",
            "fa fa-rss",
            "Delivers the specified RSS feed.", 
            "RssFeedWidgetComponent",
            ["Layout", "Workgroup"]);
        //TESTING

        this.addWidgetToLibrary(lib,
            "Available Workgroups",
            "fa fa-globe",
            "View a list of Work Groups available for the user to join.",
            "PublicWorkgroupsComponent",
            ["Layout", "Workgroup"]);

        this.addWidgetToLibrary(lib,
            "Enrollment History",
            "fa fa-history",
            "Review course enrollment history for the user.",
            "EnrollmentHistoryWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "External Learning Records",
            "fa fa-user-graduate",
            "Review external learning records history for the user.",
            "ExternalLearningRecordsWidgetComponent",
            ["Layout"]);


        this.addWidgetToLibrary(lib,
            "Related Learning",
            "fa fa-chalkboard",
            "Display additional learning of interest based on courses in which the user is currently enrolled.",
            "RelatedLearningWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Live Events",
            "fa fa-chalkboard-teacher",
            "Displays a calendar or list of upcoming events.",
            "LiveEventsWidgetComponent",
            ["Layout"]);

        this.addWidgetToLibrary(lib,
            "Work Group Usage",
            "fa fa-chart-bar",
            "Explore how Work Group members are using content.",
            "WorkgroupAssetUsageWidgetComponent",
            ["Workgroup"]);

        this.addWidgetToLibrary(lib,
            "Work Group Learning",
            "fa fa-graduation-cap",
            "View the progress and completion of training offered in the Work Group.",
            "WorkgroupCourseCompletionWidgetComponent",
            ["Workgroup"]);

        this.addWidgetToLibrary(lib,
            "Embed Webpage",
            "fa fa-code",
            "Display a secure external webpage on the page.",
            "EmbedWebpageWidgetComponent",
            ["Layout", "Workgroup"]);

        this.addWidgetToLibrary(lib,
            "Button Panel",
            "fa fa-external-link-square-alt",
            "Create a custom button, navigation card or title block.",
            "ButtonPanelWidgetComponent",
            ["Layout", "Workgroup"]);

        this.addWidgetToLibrary(lib,
            "Associated Learning",
            "fa fa-external-link-square-alt",
            "View associated learning materials.",
            "AssociatedLearningWidgetComponent",
            ["Layout", "Workgroup"]);


        this.widgetLibrary = lib.sort((a, b) => { if (a.name < b.name) return -1; return 1; });
    }


    addWidgetToLibrary(lib: Array<WidgetLibraryEntry>,
        name: string,
        imageUrl: string,
        desc: string,
        component: string,
        bindingTypes:Array<string>
    ) {
        let e1 = new WidgetLibraryEntry();
        e1.name = name;
        e1.desc = desc;
        e1.component = component;
        e1.imageUrl = imageUrl;
        e1.bindingTypes = bindingTypes;
        lib.push(e1);
    }

    getWidgetLibrary(bindingTypes: Array<string>): Array<WidgetLibraryEntry> {
        let lib = new Array<WidgetLibraryEntry>();

        if (bindingTypes != null) {
            for (let w of this.widgetLibrary) {
                for (let bt of w.bindingTypes) {
                    if (bindingTypes.findIndex(i => i == bt) != -1) {
                        lib.push(w);
                    }
                }
            }
        }
        return lib;
    }
    setIsUsingWidget(value: boolean) {
        this.isUsingWidgets = value;
        this.localStorage.setItem("usewidgets" + ProdGenApi.getCurrentTenantId(), this.isUsingWidgets.toString());
    }
    getIsUsingWidget(): boolean {
        //if (this.isUsingWidgets != (localStorage.getItem("usewidgets" + ProdGenApi.getCurrentTenantId()).toLowerCase() == "true")) {//these are not equal, we need to hit the API to reconcile 
        //    this.pinnacleService.getSettingByName("USE_WIDGETS").subscribe(res => {
        //        this.isUsingWidgets = (res.settingValue.toString().toLowerCase() == "true");
        //        localStorage.setItem("usewidgets" + ProdGenApi.getCurrentTenantId(), this.isUsingWidgets.toString());
        //        return this.isUsingWidgets;
        //    });
        //}
        //else {
        //    return (localStorage.getItem("usewidgets" + ProdGenApi.getCurrentTenantId()).toLowerCase() == "true");
        //}
        return this.isUsingWidgets;
    }
}


export class WidgetLibraryEntry {
    name: string = "";
    desc: string = "";
    imageUrl: string = "";
    component: string = "";
    bindingTypes: Array<string> = new Array<string>();
}
