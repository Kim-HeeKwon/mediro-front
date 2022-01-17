import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {
    ManagesEmail,
    ManagesEmailPagenation,
    Product,
    ProductStatus,
    SuplyReport, SuplyReportPagenation
} from './manages-email.types';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ManagesEmailService {

    private _product: BehaviorSubject<Product> = new BehaviorSubject(null);
    private _productStatus: BehaviorSubject<ProductStatus> = new BehaviorSubject(null);

    private _managesEmail: BehaviorSubject<ManagesEmail[]> = new BehaviorSubject(null);
    private _managesEmailPagenation: BehaviorSubject<ManagesEmailPagenation | null> = new BehaviorSubject(null);

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
    get manages$(): Observable<ManagesEmail[]>
    {
        return this._managesEmail.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get managesPagenation$(): Observable<ManagesEmailPagenation>
    {
        return this._managesEmailPagenation.asObservable();
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
        Promise<{managesPagenation: ManagesEmailPagenation; manages: ManagesEmail[] }> {

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
                        this._managesEmail.next(response.data);
                        this._managesEmailPagenation.next(response.pageNation);
                        resolve({manages: response.data, managesPagenation: response.pageNation});
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
    getUdiDiCodeInfo(managesEmail: ManagesEmail): Observable<ManagesEmail>
    {

        const pageParam = {
            page: 0,
            size: 100,
        };

        return this.manages$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataObjectLoading(managesEmail, pageParam, 'v1/api/udi/udiDi-product/info').pipe(
                map(result =>
                    // Return the new product
                     result
                )
            ))
        );
    }
    /*getUdiDiCodeInfo(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<Manages> {

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

    updateSupplyInfo(managesEmail: ManagesEmail[]): Observable<{managesEmail: ManagesEmail[]}> {

        return this._common.listPutLoading('v1/api/udi/supply-info', managesEmail).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /*deleteSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.listDelete('v1/api/udi/supply-info', manages).pipe(
            switchMap((response: any) => of(response))
        );
    }*/

    deleteSupplyInfo(manages: ManagesEmail[]): Observable<{manages: ManagesEmail[]}> {

        return this._common.sendListDataLoading(manages, 'v1/api/udi/supply-info/delete').pipe(
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
