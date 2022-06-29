import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {ReportBillData, ReportBillPagenation} from "./report-bill.types";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class ReportBillService {
    private _reportBillData: BehaviorSubject<ReportBillData> = new BehaviorSubject(null);
    private _reportBillDatas: BehaviorSubject<ReportBillData[]> = new BehaviorSubject(null);
    private _reportBillDataPagenation: BehaviorSubject<ReportBillPagenation | null> = new BehaviorSubject(null);

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
    get reportBillData$(): Observable<ReportBillData> {
        return this._reportBillData.asObservable();
    }

    /**
     * Getter for headers
     */
    get reportBillDatas$(): Observable<ReportBillData[]> {
        return this._reportBillDatas.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get reportBillPagenation$(): Observable<ReportBillPagenation> {
        return this._reportBillDataPagenation.asObservable();
    }

    getSearch(page: number = 0, size: number = 20, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ reportBillPagenation: ReportBillPagenation; reportBillData: ReportBillData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/report/bill/list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._reportBillDatas.next(response.data);
                        this._reportBillDataPagenation.next(response.pageNation);
                        resolve({reportBillData: response.data, reportBillPagenation: response.pageNation});
                    }
                }, reject);
        });
    }
}
