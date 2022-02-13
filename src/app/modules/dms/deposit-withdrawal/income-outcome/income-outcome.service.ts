import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {
    IncomeOutcomeBasic,
    IncomeOutcomeBasicPagenation,
    IncomeOutcomeDetail,
    IncomeOutcomeHeader
} from "./income-outcome.types";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class IncomeOutcomeService {

    private _incomeOutcomeHeaders: BehaviorSubject<IncomeOutcomeHeader[]> = new BehaviorSubject(null);
    private _incomeOutcomeDetails: BehaviorSubject<IncomeOutcomeDetail[]> = new BehaviorSubject(null);
    private _incomeOutcomeBasics: BehaviorSubject<IncomeOutcomeBasic[]> = new BehaviorSubject(null);
    private _incomeOutcomeBasicPagenation: BehaviorSubject<IncomeOutcomeBasicPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _functionService: FunctionService,
                private _common: Common) {

    }

    /**
     * Getter for headers
     */
    get incomeOutcomeBasics$(): Observable<IncomeOutcomeBasic[]>
    {
        return this._incomeOutcomeBasics.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get incomeOutcomeBasicPagenation$(): Observable<IncomeOutcomeBasicPagenation>
    {
        return this._incomeOutcomeBasicPagenation.asObservable();
    }


    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 1, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ incomeOutcomeHeader: IncomeOutcomeHeader[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/incomeOutcome/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._incomeOutcomeHeaders.next(response.data);
                        resolve({incomeOutcomeHeader: response.data});
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 1, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ incomeOutcomeDetail: IncomeOutcomeDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/incomeOutcome/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._incomeOutcomeDetails.next(response.data);
                        resolve({incomeOutcomeDetail: response.data});
                    }
                }, reject);
        });
    }

    /**
     * Post getBasic
     *
     * @returns
     */
    getBasic(page: number = 0, size: number = 40, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{incomeOutcomeBasicPagenation: IncomeOutcomeBasicPagenation; incomeOutcomeBasic: IncomeOutcomeBasic[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/incomeOutcome/basic-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._incomeOutcomeBasics.next(response.data);
                        this._incomeOutcomeBasicPagenation.next(response.pageNation);
                        resolve({incomeOutcomeBasic: response.data, incomeOutcomeBasicPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    basicSave(incomeOutcomeBasics: IncomeOutcomeBasic[]): Observable<IncomeOutcomeBasic>
    {
        return this.incomeOutcomeBasics$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(incomeOutcomeBasics, 'v1/api/incomeOutcome/save-Basic').pipe(
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
