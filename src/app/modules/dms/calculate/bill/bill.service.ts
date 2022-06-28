import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Bill, BillPagenation} from "./bill.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import * as moment from "moment";
import {map, switchMap, take} from "rxjs/operators";
import {environment} from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class BillService {

    private _bill: BehaviorSubject<Bill> = new BehaviorSubject(null);
    private _bills: BehaviorSubject<Bill[]> = new BehaviorSubject(null);
    private _billPagenation: BehaviorSubject<BillPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get bill$(): Observable<Bill>
    {
        return this._bill.asObservable();
    }

    /**
     * Getter for headers
     */
    get bills$(): Observable<Bill[]>
    {
        return this._bills.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get billPagenation$(): Observable<BillPagenation>
    {
        return this._billPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'billing', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{billPagenation: BillPagenation; bill: Bill[] }> {

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

        if(searchParam['start'] === undefined){
            if(searchParam['end'] === undefined){
                searchParam['start'] = moment().utc(false).add(-7, 'day').endOf('day').toISOString();
                searchParam['end'] =  moment().utc(false).startOf('day').toISOString();
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/calculate/bill/bill-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._bills.next(response.data);
                        this._billPagenation.next(response.pageNation);
                        resolve({bill: response.data, billPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * 세금계산서
     */
    invoice(bills: Bill[], invoice: boolean): Observable<Bill>
    {
        return this.bill$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataChgUrlLoading(bills, environment.serverTaxUrl + 'v1/api/calculate/tax/invoice', invoice).pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    /**
     * save
     */
    saveTaxGbn(bills: Bill[]): Observable<Bill>
    {
        return this.bills$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(bills, 'v1/api/calculate/bill/save-taxGbn').pipe(
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
