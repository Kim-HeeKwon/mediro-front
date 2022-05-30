import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {CommonCodeData, CommonCodePagenation, DetailCommonCodeData} from "./common-code.types";

@Injectable({
    providedIn: 'root'
})
export class CommonCodeService {

    private _commonCode: BehaviorSubject<CommonCodeData> = new BehaviorSubject(null);
    private _commonCodes: BehaviorSubject<CommonCodeData[]> = new BehaviorSubject(null);
    private _detailCommonCode: BehaviorSubject<DetailCommonCodeData> = new BehaviorSubject(null);
    private _detailCommonCodes: BehaviorSubject<DetailCommonCodeData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<CommonCodePagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get commonCode$(): Observable<CommonCodeData>
    {
        return this._commonCode.asObservable();
    }
    /**
     * Getter for products
     */
    get commonCodes$(): Observable<CommonCodeData[]>
    {
        return this._commonCodes.asObservable();
    }

    get detailCommonCode$(): Observable<DetailCommonCodeData>
    {
        return this._detailCommonCode.asObservable();
    }

    get detailCommonCodes$(): Observable<DetailCommonCodeData[]>
    {
        return this._detailCommonCodes.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<CommonCodePagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getCommonCode(page: number = 0, size: number = 100, sort: string = 'descr', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: CommonCodePagenation; commonCode: CommonCodeData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/common/code/commonCode-header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._commonCodes.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({commonCode: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }


    /**
     * save
     */
    saveCommonCode(commonCodes: CommonCodeData[]): Observable<CommonCodeData>
    {
        return;
    }

    saveDetailCommonCode(detailCommonCodes: DetailCommonCodeData[]): Observable<DetailCommonCodeData>
    {
        return;
    }
}
