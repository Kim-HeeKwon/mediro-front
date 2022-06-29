import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {ReportBoundData, ReportBoundPagenation} from "./report-bound.types";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})

export class ReportBoundService {
    private _reportBoundData: BehaviorSubject<ReportBoundData> = new BehaviorSubject(null);
    private _reportBoundDatas: BehaviorSubject<ReportBoundData[]> = new BehaviorSubject(null);
    private _reportBoundDataPagenation: BehaviorSubject<ReportBoundPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _functionService: FunctionService,
                private _common: Common) {
    }

    /**
     * Getter for header
     */
    get reportBoundData$(): Observable<ReportBoundData> {
        return this._reportBoundData.asObservable();
    }

    /**
     * Getter for headers
     */
    get reportBoundDatas$(): Observable<ReportBoundData[]> {
        return this._reportBoundDatas.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get reportBoundPagenation$(): Observable<ReportBoundPagenation> {
        return this._reportBoundDataPagenation.asObservable();
    }

    getSearch(page: number = 0, size: number = 20, sort: string = 'orderNo', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ reportBoundPagenation: ReportBoundPagenation; reportBoundData: ReportBoundData[] }> {

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

        searchParam['status'] = this._functionService.cfn_multipleComboValueGet(searchParam['status']);

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/report/bound/list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._reportBoundDatas.next(response.data);
                        this._reportBoundDataPagenation.next(response.pageNation);
                        resolve({reportBoundData: response.data, reportBoundPagenation: response.pageNation});
                    }
                }, reject);
        });
    }
}
