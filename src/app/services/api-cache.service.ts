import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SessionStorageService } from './storage/services/session-storage.service';


export type HttpRequestOptions = {
    headers?: HttpHeaders;
    observe?: "body";
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: "json";
    withCredentials?: boolean; 
};

export type CacheResponse<T> = {
    retrievedFromCache: boolean,
    data: Observable<T>
};

/**
 * Async modal dialog service
 * DialogService makes this app easier to test by faking this service.
 * TODO: better modal implementation that doesn't use window.confirm
 */
@Injectable()
export class APICacheService {

    //cacheLocation = CacheLocation.localStorage;

    cacheData = new Array<CacheData>();
    public static activeTenantId: string = null;
    public static activeUserId: string = null;

    private cacheLogging = false;

    constructor(
      private http: HttpClient,
      private sessionStorage: SessionStorageService
    ) { }


    // before this can be used, we must have a valid tenant and user
    public static putTenant(tenantId: string) {
        this.activeTenantId = tenantId;
    }

    // before this can be used, we must have a valid tenant and user
    public static putUserId(userId: string) {
        this.activeUserId = userId;
    }


    public httpGetCacheableResponse<T>(url: string, httpOptions: HttpRequestOptions, cacheOptions?: CacheOptions): CacheResponse<T> {
        const cachedData = this.get(url);
        if (cachedData != null) {
            return {
                retrievedFromCache: true,
                data: cachedData as Observable<T>
            };
        }

        const fetchedData = this.http.get<T>(url, { ...httpOptions, observe: 'response' }).pipe(
            // When this observable is eventually subscribed to, make sure that we update the
            // cache with the retrieved value if the request is a success.
            tap((response: HttpResponse<T>) => {
                if (response.status === 200) {
                    this.put(url, response.body, cacheOptions);
                }
            }),
            // Since we're observing the whole request for a success value, pass the body to
            // whoever called this method so they don't have to deal with the request.
            map((response: HttpResponse<T>) => response.body));

        return {
            retrievedFromCache: false,
            data: fetchedData
        };
    }


    /// place data into the cache. The key value should be the API url
    public put(key: string, value: any, cacheOptions: CacheOptions = null) {
        let c = new CacheData();

        if (cacheOptions == null) {
            cacheOptions = new CacheOptions();
        }

        if (cacheOptions.useCache == false) {
            return;
        }

        let complete_key = this.getCompleteKey(key);
        if (complete_key != null) {

            c.key = complete_key;
            c.data = value;
            c.created = new Date(Date.now());
            c.cacheOptions = cacheOptions;

            this.invalidate(key);

            if (cacheOptions.cacheLocation == CacheLocation.memory) {
                this.cacheData.push(c);
            }
            else if (cacheOptions.cacheLocation == CacheLocation.localStorage) {
                try { localStorage.setItem(complete_key, JSON.stringify(c) ); }
                catch (e){ }
            }
            else if (cacheOptions.cacheLocation == CacheLocation.sessionStorage) {
                try { this.sessionStorage.setItem(complete_key, c); }
                catch (e){ }
            }

            if (this.cacheLogging == true) {
                console.log("placed into cache (" + cacheOptions.cacheLocation.toString()+"): " + this.cacheData.length);
                console.log(c);
                console.log("---------------------------------------------------------");
            }
        }

    }

    private getCacheData(complete_key: string): CacheData {

        // look to the memory cache first
        let existing = this.locateEntryInMemory(complete_key);
        if (existing != -1) {
            if (this.isCacheExpired(this.cacheData[existing])) {
                this.invalidate(this.cacheData[existing].key, true);
                return null;
            }
            return this.cacheData[existing];
        }

        // not found in memory, look to the storage cache
        try {
            let cacheData: CacheData = this.sessionStorage.getItem(complete_key);
            if (cacheData != null) {
                cacheData.created = new Date(cacheData.created);
                if (this.isCacheExpired(cacheData)) {
                    this.invalidate(cacheData.key, true);
                    return null;
                }
                return cacheData;
            }
        }
        catch (e){ }

        try {
            let cacheData: CacheData = (JSON.parse(localStorage.getItem(complete_key)));
            if (cacheData != null) {
                cacheData.created = new Date(cacheData.created);
                if (this.isCacheExpired(cacheData)) {
                    this.invalidate(cacheData.key, true);
                    return null;
                }
                return cacheData;
            }
        }
        catch (e){ }

      return null;
    }

    // get data from the cache. The key value should be the API url
    public get(key: string): any {
        let complete_key = this.getCompleteKey(key);

        if (complete_key != null) {
            let cacheData = this.getCacheData(complete_key);
            if (cacheData != null) {

                if (this.cacheLogging == true) {
                    console.log("retrieved from cache");
                    console.log(complete_key);
                    console.log(cacheData.data);
                    console.log("---------------------------------------------------------");
                }
                return of(cacheData.data);
            }
        }
        return null;
    }

    // determine if the cache is expired based on the cache entry's max age
    private isCacheExpired(cacheData: CacheData): boolean {
        let createTime = cacheData.created.getTime();
        let maxAge = cacheData.cacheOptions.maxAge * 60000;
        let curTime = Date.now();

        if ((createTime + maxAge) < curTime ) {
            return true;
        }
        return false;
    }

    // invalidate any cache entries where the key contains the specified filter string
    public invalidateContaining(filter: string) {
        let prefix = this.getCompleteKey("");

        // first do local storage
        for (let i = 0; i < sessionStorage.length; i++) {
            if (this.sessionStorage.key(i).indexOf(prefix) == 0 &&
                this.sessionStorage.key(i).indexOf(filter) != -1) {

                this.invalidate(this.sessionStorage.key(i), true);
            }
        }


        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).indexOf(prefix) == 0 &&
                localStorage.key(i).indexOf(filter) != -1) {

                this.invalidate(localStorage.key(i), true);
            }
        }

        // now do memory
        for (let i = 0; i < this.cacheData.length; i++) {
            if (this.cacheData[i].key.indexOf(prefix) == 0 &&
                this.cacheData[i].key.indexOf(filter) != -1) {

                this.invalidate(this.cacheData[i].key, true);
            }
        }
    }

    private invalidateIfNewer(key: string, date: Date) {
        let complete_key = this.getCompleteKey(key);
        if (complete_key != null) {
            let data = this.getCacheData(complete_key);
            if (data != null) {
                if (date > data.created) {
                    this.invalidate(complete_key, true);
                }
            }
        }
    }

    public invalidate(key: string, isCompleteKey = false) {
        let complete_key = key;

        if (isCompleteKey == false) {
            complete_key = this.getCompleteKey(key);
        }

        if (complete_key != null) {
            // first do memory
            let existing = this.locateEntryInMemory(complete_key);
            if (existing != -1) {
                this.cacheData.splice(existing,1);
            }

            // also invalidate from storage if exists
            localStorage.removeItem(complete_key);

            this.sessionStorage.removeItem(complete_key);

            if (this.cacheLogging == true) {
                console.log("cache item invalidated: " + this.cacheData.length);
                console.log(complete_key);
                console.log("---------------------------------------------------------");
            }

        }
    }

    private getCompleteKey(key: string): string {
        let complete_key = null;
        if (APICacheService.activeTenantId != null && APICacheService.activeUserId != null) {
            complete_key = APICacheService.activeTenantId + "_" + APICacheService.activeUserId + "_" + key;
        }

        return complete_key;
    }

    private locateEntryInMemory(complete_key: string): number {
        
        return this.cacheData.findIndex(i => i.key == complete_key);
    }

}

export class CacheData {
    key: string;
    data: any;
    created: Date;
    cacheOptions: CacheOptions;
}

export class CacheOptions {

    // Create and return a CacheOptions object
    // with the optional parameters 
    // (default to the same values as constructing
    // a new instance)
    public static with({
        maxAge = 60,
        executeOnRetrieval = null,
        executeOnInvalidate = null,
        cacheLocation = CacheLocation.localStorage,
        useCache = true
    }: {
            maxAge?: number,
            executeOnRetrieval?: any,
            executeOnInvalidate?: any,
            cacheLocation?: CacheLocation,
            useCache?: boolean
        }): CacheOptions {

        let cacheOptions = new CacheOptions();
        cacheOptions.maxAge = maxAge;
        cacheOptions.executeOnRetrieval = executeOnRetrieval;
        cacheOptions.executeOnInvalidate = executeOnInvalidate;
        cacheOptions.cacheLocation = cacheLocation;
        cacheOptions.useCache = useCache;

        return cacheOptions;
    }


    maxAge: number = 60; // minutes
    executeOnRetrieval: any = null; // if cache data found...do this
    executeOnInvalidate: any = null; // if cache is invalidated, ...do this
    cacheLocation: CacheLocation = CacheLocation.localStorage;
    useCache: boolean = true;
}

export enum CacheLocation {
    sessionStorage,
    localStorage,
    memory
}
