import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {
    SalesOrder,
    SalesOrderDetail,
    SalesOrderDetailPagenation,
    SalesOrderHeader,
    SalesOrderHeaderPagenation
} from './salesorder.types';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SalesorderService {
    private _salesorderHeader: BehaviorSubject<SalesOrderHeader> = new BehaviorSubject(null);
    private _salesorderHeaders: BehaviorSubject<SalesOrderHeader[]> = new BehaviorSubject(null);
    private _salesorderHeaderPagenation: BehaviorSubject<SalesOrderHeaderPagenation | null> = new BehaviorSubject(null);
    private _salesorderDetail: BehaviorSubject<SalesOrderDetail> = new BehaviorSubject(null);
    private _salesorderDetails: BehaviorSubject<SalesOrderDetail[]> = new BehaviorSubject(null);
    private _salesorderDetailPagenation: BehaviorSubject<SalesOrderDetailPagenation | null> = new BehaviorSubject(null);
    private _salesorders: BehaviorSubject<SalesOrder[]> = new BehaviorSubject(null);

    /**
     * Getter for Header
     */
    get salesorderHeader$(): Observable<SalesOrderHeader>
    {
        return this._salesorderHeader.asObservable();
    }
    /**
     * Getter for Header
     */
    get salesorderHeaders$(): Observable<SalesOrderHeader[]>
    {
        return this._salesorderHeaders.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get salesorderHeaderPagenation$(): Observable<SalesOrderHeaderPagenation>
    {
        return this._salesorderHeaderPagenation.asObservable();
    }

    /**
     * Getter for Detail
     */
    get salesorderDetails$(): Observable<SalesOrderDetail[]>
    {
        return this._salesorderDetails.asObservable();
    }
    /**
     * Getter for Detail Pagenation
     */
    get salesorderDetailPagenation$(): Observable<SalesOrderDetailPagenation>
    {
        return this._salesorderDetailPagenation.asObservable();
    }

    /**
     * Getter
     */
    get salesorders$(): Observable<SalesOrder[]>
    {
        return this._salesorders.asObservable();
    }
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ salesorderHeaderPagenation: SalesOrderHeaderPagenation; salesorderHeader: SalesOrderHeader[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/salesorder/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._salesorderHeaders.next(response.data);
                        this._salesorderHeaderPagenation.next(response.pageNation);
                        resolve(this._salesorderHeaders);
                    }
                }, reject);
        });
    }
    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ salesorderDetailPagenation: SalesOrderDetailPagenation; salesorderDetail: SalesOrderDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/salesorder/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._salesorderDetails.next(response.data);
                        this._salesorderDetailPagenation.next(response.pageNation);
                        resolve(this._salesorderDetails);
                    }
                }, reject);
        });
    }

    /**
     * Post getNew
     *
     * @returns
     */
    getNew(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ salesorderDetailPagenation: SalesOrderDetailPagenation; salesorderDetail: SalesOrderDetail[] }> {

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
            this._salesorderDetails.next([]);
            // @ts-ignore
            this._salesorderDetailPagenation.next([]);
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt(salesorder: SalesOrder[]): Observable<{salesorder: SalesOrder[]}> {
        return this._common.put('v1/api/salesorder/salesorder-total-amt', salesorder).pipe(
            switchMap((response: any) => of(response))
        );
    }
    /**
     * Create
     */
    createSalesOrder(salesorder: SalesOrder[]): Observable<SalesOrder>
    {
        return this.salesorders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(salesorder, 'v1/api/salesorder').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    updateSalesOrder(salesorder: SalesOrder[]): Observable<{salesorder: SalesOrder[] }> {

        return this._common.listPut('v1/api/salesorder', salesorder).pipe(
            switchMap((response: any) => of(response))
        );
    }
    deleteSalesOrder(salesorder: SalesOrder[]): Observable<{salesorder: SalesOrder[]}> {

        return this._common.listDelete('v1/api/salesorder', salesorder).pipe(
            switchMap((response: any) => of(response))
        );
        // @ts-ignore
        // return new Promise((resolve, reject) => {
        //     this._common.delete('v1/api/basicInfo/account', accountData)
        //         .subscribe((response: any) => {
        //             this.getAccount();
        //         }, reject);
        // });
    }

}
