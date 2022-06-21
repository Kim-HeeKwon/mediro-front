import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Common} from '@teamplat/providers/common/common';
import {DashboardInfo1, DashboardsPagination, RecallItem} from './dashboards.types';

@Injectable({
    providedIn: 'root'
})
export class DashboardsService {

    private _recallItem: BehaviorSubject<RecallItem> = new BehaviorSubject(null);
    private _recallItems: BehaviorSubject<RecallItem[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<DashboardsPagination | null> = new BehaviorSubject(null);

    //DashbaordInfo1
    private _ibInfo: BehaviorSubject<DashboardInfo1> = new BehaviorSubject(null);
    private _obInfo: BehaviorSubject<DashboardInfo1> = new BehaviorSubject(null);
    private _poInfo: BehaviorSubject<DashboardInfo1> = new BehaviorSubject(null);
    private _qtInfo: BehaviorSubject<DashboardInfo1> = new BehaviorSubject(null);
    private _soInfo: BehaviorSubject<DashboardInfo1> = new BehaviorSubject(null);

    private _udiInfo: BehaviorSubject<any> = new BehaviorSubject(null);
    private _billInfo: BehaviorSubject<any> = new BehaviorSubject(null);
    private _stockInfo: BehaviorSubject<any> = new BehaviorSubject(null);
    private _bill: BehaviorSubject<any> = new BehaviorSubject(null);
    private _supplyStatus: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for products
     */
    get reallItems$(): Observable<RecallItem[]>
    {
        return this._recallItems.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<DashboardsPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for DashboardInfo
     */
    get ibInfo$(): Observable<DashboardInfo1>
    {
        return this._ibInfo.asObservable();
    }

    get obInfo$(): Observable<DashboardInfo1>
    {
        return this._obInfo.asObservable();
    }

    get poInfo$(): Observable<DashboardInfo1>
    {
        return this._poInfo.asObservable();
    }

    get qtInfo$(): Observable<DashboardInfo1>
    {
        return this._qtInfo.asObservable();
    }

    get soInfo$(): Observable<DashboardInfo1>
    {
        return this._soInfo.asObservable();
    }

    get udiInfo$(): Observable<any>
    {
        return this._udiInfo.asObservable();
    }

    get billInfo$(): Observable<any>
    {
        return this._billInfo.asObservable();
    }

    get stockInfo$(): Observable<any>
    {
        return this._stockInfo.asObservable();
    }

    get bill$(): Observable<any>
    {
        return this._bill.asObservable();
    }

    get supplyStatus$(): Observable<any>
    {
        return this._supplyStatus.asObservable();
    }


    /**
     * Post RecallItem
     *
     * @returns
     */
    getRecallItem(page: number = 0, size: number = 8, sort: string = '', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagination: DashboardsPagination; products: RecallItem[] }>{

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
        if((Object.keys(search).length === 0) === false){
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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/scraping/udi-portal/udi-portal-recall-item-list')
                .subscribe((response: any) => {
                    this._recallItems.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve(this._recallItems);
                }, reject);
        });
    }

    /**
     * Post DashboardInfo1
     *
     * @returns
     */
    getDashboardInfo1(): Observable<{order: any[]}> {

        const param = {'name':'dashboardInfo1'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-info1')
                .subscribe((response: any) => {
                    this._ibInfo.next(response.data.filter(option => option.type === 'IB'));
                    this._obInfo.next(response.data.filter(option => option.type === 'OB'));
                    this._poInfo.next(response.data.filter(option => option.type === 'PO'));
                    this._qtInfo.next(response.data.filter(option => option.type === 'QT'));
                    this._soInfo.next(response.data.filter(option => option.type === 'SO'));
                    this._billInfo.next(response.data.filter(option => option.type === 'BILL'));
                    resolve(response);
                }, reject);
        });
    }

    /**
     * Post DashboardInfo2
     *
     * @returns
     */
    getDashboardInfo2(): Observable<{order: any[]}> {

        const param = {'name':'dashboardInfo2'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-info2')
                .subscribe((response: any) => {
                    //console.log(response);
                    this._udiInfo.next(response.data[0]);
                    resolve(response[0]);
                }, reject);
        });
    }
    /**
     * Post bill
     *
     * @returns
     */
    getDashboardBill(): Observable<{order: any[]}> {

        const param = {'name':'bill'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-bill')
                .subscribe((response: any) => {
                    //console.log(response);
                    this._bill.next(response.data);
                    resolve(response.data);
                }, reject);
        });
    }
    /**
     * Post Udi
     *
     * @returns
     */
    getDashboardUdi(): Observable<{order: any[]}> {

        const param = {'name':'udi'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-udi')
                .subscribe((response: any) => {
                    //console.log(response);
                    this._udiInfo.next(response.data);
                    resolve(response.data);
                }, reject);
        });
    }

    /**
     * Post Stock
     *
     * @returns
     */
    getDashboardStock(): Observable<{order: any[]}> {

        const param = {'name':'stock'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-stock')
                .subscribe((response: any) => {
                    this._stockInfo.next(response.data);
                    resolve(response.data);
                }, reject);
        });
    }

    /**
     * Post Stock
     *
     * @returns
     */
    getDashboardStockNull(): Observable<{order: any[]}> {

        const param = {'name':'stock'};

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(param, '/v1/api/dashboard/dashboard-stock-null')
                .subscribe((response: any) => {
                    //console.log(response);
                    this._stockInfo.next(response.data);
                    resolve(response.data);
                }, reject);
        });
    }

}
