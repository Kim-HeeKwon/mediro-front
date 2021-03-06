import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {
    InBound,
    InBoundDetail,
    InBoundDetailPagenation,
    InBoundHeader,
    InBoundHeaderPagenation
} from "./inbound.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import * as moment from "moment";
import {map, switchMap, take} from "rxjs/operators";
import {FunctionService} from "../../../../../@teamplat/services/function";

@Injectable({
    providedIn: 'root'
})
export class InboundService {
    private _inBoundHeader: BehaviorSubject<InBoundHeader> = new BehaviorSubject(null);
    private _inBoundHeaders: BehaviorSubject<InBoundHeader[]> = new BehaviorSubject(null);
    private _inBoundHeaderPagenation: BehaviorSubject<InBoundHeaderPagenation | null> = new BehaviorSubject(null);
    private _inBoundDetail: BehaviorSubject<InBoundDetail> = new BehaviorSubject(null);
    private _inBoundDetails: BehaviorSubject<InBoundDetail[]> = new BehaviorSubject(null);
    private _inBoundDetailPagenation: BehaviorSubject<InBoundDetailPagenation | null> = new BehaviorSubject(null);
    private _inBounds: BehaviorSubject<InBound[]> = new BehaviorSubject(null);

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
    get inBoundHeader$(): Observable<InBoundHeader>
    {
        return this._inBoundHeader.asObservable();
    }

    /**
     * Getter for headers
     */
    get inBoundHeaders$(): Observable<InBoundHeader[]>
    {
        return this._inBoundHeaders.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get inBoundHeaderPagenation$(): Observable<InBoundHeaderPagenation>
    {
        return this._inBoundHeaderPagenation.asObservable();
    }

    /**
     * Getter for detail
     */
    get inBoundDetail$(): Observable<InBoundDetail>
    {
        return this._inBoundDetail.asObservable();
    }


    /**
     * Getter for details
     */
    get inBoundDetails$(): Observable<InBoundDetail[]>
    {
        return this._inBoundDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get inBoundDetailPagenation$(): Observable<InBoundDetailPagenation>
    {
        return this._inBoundDetailPagenation.asObservable();
    }
    /**
     * Getter
     */
    get inBounds$(): Observable<InBound[]>
    {
        return this._inBounds.asObservable();
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 20, sort: string = 'ibNo', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ inBoundHeaderPagenation: InBoundHeaderPagenation; inBoundHeader: InBoundHeader[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/inBound/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._inBoundHeaders.next(response.data);
                        this._inBoundHeaderPagenation.next(response.pageNation);
                        resolve({inBoundHeader: response.data, inBoundHeaderPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 40, sort: string = 'ibLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ inBoundDetailPagenation: InBoundDetailPagenation; inBoundDetail: InBoundDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/inBound/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._inBoundHeader.next(search);
                        this._inBoundDetails.next(response.data);
                        this._inBoundDetailPagenation.next(response.pageNation);
                        resolve(this._inBoundDetails);
                    }
                }, reject);
        });
    }

    /**
     * Post getNew
     *
     * @returns
     */
    getNew(page: number = 0, size: number = 10, sort: string = 'ibLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ inBoundDetailPagenation: InBoundDetailPagenation; inBoundDetail: InBoundDetail[] }> {

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
            this._inBoundDetails.next([]);
            // @ts-ignore
            this._inBoundDetailPagenation.next([]);
        });
    }
    /**
     * inbound
     */
    inBoundConfirm(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(inBounds, 'v1/api/inOut/inBound/confirm').pipe(
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
     * inbound (??????)
     */
    inBoundDetailConfirm(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/confirm-detail').pipe(
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
     * Cancel
     */
    inBoundCancel(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/cancel').pipe(
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
     * back
     */
    inBoundBack(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/back').pipe(
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
    inBoundClose(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/close').pipe(
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
    saveIn(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/save-InBound').pipe(
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
    createIn(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
    updateIn(inBound: InBound[]): Observable<{inBound: InBound[] }> {

        return this._common.listPut('v1/api/inOut/inBound', inBound).pipe(
            switchMap((response: any) => of(response))
        );
    }
    deleteIn(inBound: InBound[]): Observable<{inBound: InBound[]}> {

        return this._common.listDelete('v1/api/inOut/inBound', inBound).pipe(
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
    getInBoundsById(ibNo: string): Observable<InBoundHeader>
    {
        return this._inBoundHeaders.pipe(
            take(1),
            map((products) => {

                // Find the product
                // @ts-ignore
                const product = products.find(inbound => inbound.ibNo === ibNo) || null;

                // Update the product
                this._inBoundHeader.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + ibNo + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * inBound - barcode N
     */
    inBoundBarcodeN(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/inBound-barcode-n').pipe(
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
    inBoundBarcodeY(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(inBounds, 'v1/api/inOut/inBound/inBound-barcode-y').pipe(
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
