import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Acceptable, AcceptablePagenation} from "./acceptable.types";

@Injectable({
    providedIn: 'root'
})
export class AcceptableService{

    private _acceptable: BehaviorSubject<Acceptable> = new BehaviorSubject(null)
    private _acceptables: BehaviorSubject<Acceptable[]> = new BehaviorSubject(null);
    private _acceptablePagenation: BehaviorSubject<AcceptablePagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }
    /**
     * Getter for header
     */
    get acceptable$(): Observable<Acceptable>
    {
        return this._acceptable.asObservable();
    }

    /**
     * Getter for headers
     */
    get acceptables$(): Observable<Acceptable[]>
    {
        return this._acceptables.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get acceptablePagenation$(): Observable<AcceptablePagenation>
    {
        return this._acceptablePagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ acceptablePagenation: AcceptablePagenation; acceptable: Acceptable[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/acceptable/acceptable-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._acceptables.next(response.data);
                        this._acceptablePagenation.next(response.pageNation);
                        resolve({acceptable: response.data, acceptablePagenation: response.pageNation});
                    }
                }, reject);
        });
    }
}
