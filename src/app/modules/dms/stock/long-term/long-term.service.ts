import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {LongTerm, LongTermDetail, LongTermDetailPagenation, LongTermPagenation} from "./long-term.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Validity, ValidityDetail, ValidityPagenation} from "../validity/validity.types";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class LongTermService{
    private _longTerm: BehaviorSubject<LongTerm> = new BehaviorSubject(null);
    private _longTerms: BehaviorSubject<LongTerm[]> = new BehaviorSubject(null);
    private _longTermPagenation: BehaviorSubject<LongTermPagenation | null> = new BehaviorSubject(null);
    private _longTermDetail: BehaviorSubject<LongTermDetail> = new BehaviorSubject(null);
    private _longTermDetails: BehaviorSubject<LongTermDetail[]> = new BehaviorSubject(null);
    private _longTermDetailPagenation: BehaviorSubject<LongTermDetailPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get longTerm$(): Observable<LongTerm>
    {
        return this._longTerm.asObservable();
    }

    /**
     * Getter for headers
     */
    get longTerms$(): Observable<LongTerm[]>
    {
        return this._longTerms.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get longTermPagenation$(): Observable<LongTermPagenation>
    {
        return this._longTermPagenation.asObservable();
    }

    /**
     * Getter for header
     */
    get longTermDetail$(): Observable<LongTermDetail>
    {
        return this._longTermDetail.asObservable();
    }

    /**
     * Getter for headers
     */
    get longTermDetails$(): Observable<LongTermDetail[]>
    {
        return this._longTermDetails.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get longTermDetailPagenation$(): Observable<LongTermDetailPagenation>
    {
        return this._longTermDetailPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{longTermPagenation: LongTermPagenation; longTerm: LongTerm[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/stock/longTerm/longTerm-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._longTerms.next(response.data);
                        this._longTermPagenation.next(response.pageNation);
                        resolve({longTerm: response.data, longTermPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 40, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{longTermDetailPagenation: LongTermDetailPagenation; longTermDetail: LongTermDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/stock/longTerm/longTerm-detail')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._longTermDetails.next(response.data);
                        this._longTermDetailPagenation.next(response.pageNation);
                        resolve({longTermDetail: response.data, longTermDetailPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    saveLongTerm(longTermDetails: LongTermDetail[]): Observable<LongTermDetail>
    {
        return this.longTermDetails$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(longTermDetails, 'v1/api/basicInfo/stock/longTerm/save-LongTerm').pipe(
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
