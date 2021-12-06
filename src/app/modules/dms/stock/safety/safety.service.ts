import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Safety, SafetyPagenation} from "./safety.types";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SafetyService{

    private _safety: BehaviorSubject<Safety> = new BehaviorSubject(null)
    private _safetys: BehaviorSubject<Safety[]> = new BehaviorSubject(null);
    private _safetyPagenation: BehaviorSubject<SafetyPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }
    /**
     * Getter for header
     */
    get safety$(): Observable<Safety>
    {
        return this._safety.asObservable();
    }

    /**
     * Getter for headers
     */
    get safetys$(): Observable<Safety[]>
    {
        return this._safetys.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get safetyPagenation$(): Observable<SafetyPagenation>
    {
        return this._safetyPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 20, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ safetyPagenation: SafetyPagenation; safety: Safety[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
        if ((Object.keys(search).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in search) {
                searchParam[k] = search[k];
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/safety/safety-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._safetys.next(response.data);
                        this._safetyPagenation.next(response.pageNation);
                        resolve({safety: response.data, safetyPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    safetySave(safetys: Safety[]): Observable<Safety>
    {
        return this.safetys$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(safetys, 'v1/api/basicInfo/safety/save-Safety').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
