import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Stock, StockPagenation} from "./stock.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class StockService{
    private _stock: BehaviorSubject<Stock> = new BehaviorSubject(null);
    private _stocks: BehaviorSubject<Stock[]> = new BehaviorSubject(null);
    private _stockPagenation: BehaviorSubject<StockPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get stock$(): Observable<Stock>
    {
        return this._stock.asObservable();
    }

    /**
     * Getter for headers
     */
    get stocks$(): Observable<Stock[]>
    {
        return this._stocks.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get stockPagenation$(): Observable<StockPagenation>
    {
        return this._stockPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{ stockPagenation: StockPagenation; stock: Stock[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/stock/stock-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._stocks.next(response.data);
                        this._stockPagenation.next(response.pageNation);
                        resolve(this._stocks);
                    }
                }, reject);
        });
    }
}
