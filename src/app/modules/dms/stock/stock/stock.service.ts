import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Stock, StockAdj, StockHistory, StockHistoryPagenation, StockPagenation} from './stock.types';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {filter, map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StockService{
    private _stock: BehaviorSubject<Stock> = new BehaviorSubject(null);
    private _stockAdjs: BehaviorSubject<StockAdj[]> = new BehaviorSubject(null);
    private _stocks: BehaviorSubject<Stock[]> = new BehaviorSubject(null);
    private _stockPagenation: BehaviorSubject<StockPagenation | null> = new BehaviorSubject(null);
    private _stockHistory: BehaviorSubject<StockHistory> = new BehaviorSubject(null);
    private _stockHistorys: BehaviorSubject<StockHistory[]> = new BehaviorSubject(null);
    private _stockHistoryPagenation: BehaviorSubject<StockHistoryPagenation | null> = new BehaviorSubject(null);
    private _rtnList: BehaviorSubject<any> = new BehaviorSubject(null);
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
     * Getter for header
     */
    get stockAdjs$(): Observable<StockAdj[]>
    {
        return this._stockAdjs.asObservable();
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
     * Getter for header
     */
    get stockHistory$(): Observable<StockHistory>
    {
        return this._stockHistory.asObservable();
    }

    /**
     * Getter for headers
     */
    get stockHistorys$(): Observable<StockHistory[]>
    {
        return this._stockHistorys.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get stockHistoryPagenation$(): Observable<StockHistoryPagenation>
    {
        return this._stockHistoryPagenation.asObservable();
    }

    /**
     * Getter for products
     */
    get rtnList$(): Observable<any[]>
    {
        return this._rtnList.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ stockPagenation: StockPagenation; stock: Stock[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // ???????????? Null Check
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
                        resolve({stock: response.data, stockPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * Get product by id
     */
    getStockHistoryById(itemCd: string): Observable<Stock>
    {
        return this._stocks.pipe(
            take(1),
            map((products) => {

                const product = products.find(stock => stock.itemCd === itemCd) || null;

                // Update the product
                this._stock.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + itemCd + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getStockHistory(page: number = 0, size: number = 40, sort: string = 'seq', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ stockHistoryPagenation: StockHistoryPagenation; stockHistory: StockHistory[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // ???????????? Null Check
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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/stock/stockHistory-list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._stock.next(search);
                        this._stockHistorys.next(response.data);
                        //console.log(response.pageNation);
                        this._stockHistoryPagenation.next(response.pageNation);
                        resolve({stockHistory: response.data, stockHistoryPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    stockHistoryDestory(): void {
        this._stockHistorys.next(null);
        this._stockHistoryPagenation.next(null);
    }

    /**
     *
     * @param manages
     */
    stockAdjustment(stockAdj: StockAdj): Observable<StockAdj>
    {

        const pageParam = {
            page: 0,
            size: 100,
        };

        return this.stockAdjs$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataObjectLoading(stockAdj, pageParam, 'v1/api/basicInfo/stock/stock-adj').pipe(
                map((result) => {
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    uploadStock(rtnList: any[]): Observable<any>
    {
        return this.rtnList$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(rtnList, 'v1/api/basicInfo/stock/upload-stock').pipe(
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
