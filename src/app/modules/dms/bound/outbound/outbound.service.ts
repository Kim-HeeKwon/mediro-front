import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {
    OutBound,
    OutBoundDetail,
    OutBoundDetailPagenation,
    OutBoundHeader,
    OutBoundHeaderPagenation
} from "./outbound.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import * as moment from "moment";
import {map, switchMap, take} from "rxjs/operators";
import {InBound} from "../inbound/inbound.types";
import {FunctionService} from "../../../../../@teamplat/services/function";

@Injectable({
    providedIn: 'root'
})
export class OutboundService{
    private _outBoundHeader: BehaviorSubject<OutBoundHeader> = new BehaviorSubject(null);
    private _outBoundHeaders: BehaviorSubject<OutBoundHeader[]> = new BehaviorSubject(null);
    private _outBoundHeaderPagenation: BehaviorSubject<OutBoundHeaderPagenation | null> = new BehaviorSubject(null);
    private _outBoundDetail: BehaviorSubject<OutBoundDetail> = new BehaviorSubject(null);
    private _outBoundDetails: BehaviorSubject<OutBoundDetail[]> = new BehaviorSubject(null);
    private _outBoundDetailPagenation: BehaviorSubject<OutBoundDetailPagenation | null> = new BehaviorSubject(null);
    private _outBounds: BehaviorSubject<OutBound[]> = new BehaviorSubject(null);

    private _showMobile: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
    get outBoundHeader$(): Observable<OutBoundHeader>
    {
        return this._outBoundHeader.asObservable();
    }

    /**
     * Getter for headers
     */
    get outBoundHeaders$(): Observable<OutBoundHeader[]>
    {
        return this._outBoundHeaders.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get outBoundHeaderPagenation$(): Observable<OutBoundHeaderPagenation>
    {
        return this._outBoundHeaderPagenation.asObservable();
    }

    /**
     * Getter for detail
     */
    get outBoundDetail$(): Observable<OutBoundDetail>
    {
        return this._outBoundDetail.asObservable();
    }


    /**
     * Getter for details
     */
    get outBoundDetails$(): Observable<OutBoundDetail[]>
    {
        return this._outBoundDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get outBoundDetailPagenation$(): Observable<OutBoundDetailPagenation>
    {
        return this._outBoundDetailPagenation.asObservable();
    }

    /**
     * Getter for showMobile
     */
    get showMobile$(): Observable<boolean>
    {
        return this._showMobile.asObservable();
    }

    /**
     * Getter
     */
    get outBounds$(): Observable<OutBound[]>
    {
        return this._outBounds.asObservable();
    }

    /**
     * set Mobile Page
     */
    setShowMobile(value: boolean): void{
        this._showMobile.next(value);
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 20, sort: string = 'obNo', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ outBoundHeaderPagenation: OutBoundHeaderPagenation; outBoundHeader: OutBoundHeader[] }> {

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

        // if(searchParam['start'] === undefined){
        //     if(searchParam['end'] === undefined){
        //         searchParam['start'] = moment().utc(false).add(-7, 'day').endOf('day').toISOString();
        //         searchParam['end'] =  moment().utc(false).startOf('day').toISOString();
        //     }
        // }

        searchParam['status'] = this._functionService.cfn_multipleComboValueGet(searchParam['status']);

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/outBound/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._outBoundHeaders.next(response.data);
                        this._outBoundHeaderPagenation.next(response.pageNation);
                        resolve({outBoundHeader: response.data, outBoundHeaderPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 40, sort: string = 'obLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ outBoundDetailPagenation: OutBoundDetailPagenation; outBoundDetail: OutBoundDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/outBound/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._outBoundHeader.next(search);
                        this._outBoundDetails.next(response.data);
                        this._outBoundDetailPagenation.next(response.pageNation);
                        resolve(this._outBoundDetails);
                    }
                }, reject);
        });
    }

    /**
     * Post getNew
     *
     * @returns
     */
    getNew(page: number = 0, size: number = 10, sort: string = 'obLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ outBoundDetailPagenation: OutBoundDetailPagenation; outBoundDetail: OutBoundDetail[] }> {

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
            this._outBoundDetails.next([]);
            // @ts-ignore
            this._outBoundDetailPagenation.next([]);
        });
    }

    /**
     * save
     */
    saveOut(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/save-OutBound').pipe(
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
     * Create
     */
    createOut(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
    updateOut(outBound: OutBound[]): Observable<{outBound: OutBound[] }> {

        return this._common.listPut('v1/api/inOut/outBound', outBound).pipe(
            switchMap((response: any) => of(response))
        );
    }
    deleteOut(outBound: OutBound[]): Observable<{outBound: OutBound[]}> {

        return this._common.listDelete('v1/api/inOut/outBound', outBound).pipe(
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

    /**
     * Get product by id
     */
    getOutBoundsById(obNo: string): Observable<OutBoundHeader>
    {
        return this._outBoundHeaders.pipe(
            take(1),
            map((products) => {

                // Find the product
                // @ts-ignore
                const product = products.find(outBound => outBound.obNo === obNo) || null;

                // Update the product
                this._outBoundHeader.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + obNo + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Cancel
     */
    outBoundCancel(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/cancel').pipe(
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
     * Update
     */
    outBoundUpdate(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/update').pipe(
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
     * outBound
     */
    outBoundConfirm(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(outBounds, 'v1/api/inOut/outBound/confirm').pipe(
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
     * outBound (상세)
     */
    outBoundDetailConfirm(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/confirm-detail').pipe(
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
     * outBound - barcode N
     */
    outBoundBarcodeN(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/outBound-barcode-n').pipe(
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
     * outBound - barcode Y
     */
    outBoundBarcodeY(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/outBound-barcode-y').pipe(
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
     * Close
     */
    outBoundClose(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(outBounds, 'v1/api/inOut/outBound/close').pipe(
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
