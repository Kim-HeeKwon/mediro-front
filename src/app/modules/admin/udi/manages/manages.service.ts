import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Manages, ManagesPagenation, Product, ProductStatus, SuplyReport, SuplyReportPagenation} from './manages.types';
import {Common} from '../../../../../@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class ManagesService {

    private _product: BehaviorSubject<Product> = new BehaviorSubject(null);
    private _productStatus: BehaviorSubject<ProductStatus> = new BehaviorSubject(null);

    private _manages: BehaviorSubject<Manages[]> = new BehaviorSubject(null);
    private _managesPagenation: BehaviorSubject<ManagesPagenation | null> = new BehaviorSubject(null);

    private _suplyReports: BehaviorSubject<SuplyReport[]> = new BehaviorSubject(null);
    private _suplyReportsPagenation: BehaviorSubject<SuplyReportPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Getter for headers
     */
    get manages$(): Observable<Manages[]>
    {
        return this._manages.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get managesPagenation$(): Observable<ManagesPagenation>
    {
        return this._managesPagenation.asObservable();
    }

    /**
     * Getter for headers
     */
    get suplyReports$(): Observable<SuplyReport[]>
    {
        return this._suplyReports.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get suplyReportsPagenation$(): Observable<SuplyReportPagenation>
    {
        return this._suplyReportsPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{managesPagenation: ManagesPagenation; manages: Manages[] }> {

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
        if(searchParam['offset'] === undefined){
            searchParam['offset'] = '1';
        }

        if(searchParam['limit'] === undefined){
            searchParam['limit'] = '100';
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/udi/supply-info/manages')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._manages.next(response.data);
                        this._managesPagenation.next(response.pageNation);
                        resolve(this._manages);
                    }
                }, reject);
        });
    }

    /**
     * Post get Udi Di Code check
     *
     * @returns
     */

    /**
     * Create
     */
    getUdiDiCodeInfo(manages: Manages): Observable<Manages>
    {

        const pageParam = {
            page: 0,
            size: 100,
        };

        return this.manages$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataObject(manages, pageParam, 'v1/api/udi/udiDi-product/info').pipe(
                map((result) => {
                    // Return the new product
                    return result;
                })
            ))
        );
    }
    /*getUdiDiCodeInfo(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<Manages> {

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
        if(searchParam['offset'] === undefined){
            searchParam['offset'] = '1';
        }

        if(searchParam['limit'] === undefined){
            searchParam['limit'] = '100';
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/udi/udiDi-product/info')
                .subscribe((response: any) => {
                    console.log(response);
                    if (response.status === 'SUCCESS') {
                        this._product.next(response.data[0]);
                    }else{
                        this._product.next(null);
                    }
                    this._productStatus.next(response.status);
                    resolve(this._product);
                }, reject);
        });
    }*/

    updateSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.listPut('v1/api/udi/supply-info', manages).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /*deleteSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.listDelete('v1/api/udi/supply-info', manages).pipe(
            switchMap((response: any) => of(response))
        );
    }*/

    deleteSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.sendListData(manages, 'v1/api/udi/supply-info/delete').pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * Post getSuplyReport
     *
     * @returns
     */
    getSuplyReport(page: number = 0, size: number = 12, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{managesPagenation: SuplyReportPagenation; manages: SuplyReport[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/udi/supply-info/report-summary')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._suplyReports.next(response.data);
                        this._suplyReportsPagenation.next(response.pageNation);
                        resolve(this._suplyReports);
                    }
                }, reject);
        });
    }

    setInitList(): void{
        this._suplyReports.next(null);
    }
}
