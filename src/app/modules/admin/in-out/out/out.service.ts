import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {OutBound, OutDetail, OutDetailPagenation, OutHeader, OutHeaderPagenation} from './out.types';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class OutService {
    private _outHeader: BehaviorSubject<OutHeader> = new BehaviorSubject(null);
    private _outHeaders: BehaviorSubject<OutHeader[]> = new BehaviorSubject(null);
    private _outHeaderPagenation: BehaviorSubject<OutHeaderPagenation | null> = new BehaviorSubject(null);
    private _outDetail: BehaviorSubject<OutDetail> = new BehaviorSubject(null);
    private _outDetails: BehaviorSubject<OutDetail[]> = new BehaviorSubject(null);
    private _outDetailPagenation: BehaviorSubject<OutDetailPagenation | null> = new BehaviorSubject(null);
    private _outBounds: BehaviorSubject<OutBound[]> = new BehaviorSubject(null);


    private _showMobile: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Getter for header
     */
    get outHeader$(): Observable<OutHeader>
    {
        return this._outHeader.asObservable();
    }

    /**
     * Getter for headers
     */
    get outHeaders$(): Observable<OutHeader[]>
    {
        return this._outHeaders.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get outHeaderPagenation$(): Observable<OutHeaderPagenation>
    {
        return this._outHeaderPagenation.asObservable();
    }

    /**
     * Getter for detail
     */
    get outDetail$(): Observable<OutDetail>
    {
        return this._outDetail.asObservable();
    }


    /**
     * Getter for details
     */
    get outDetails$(): Observable<OutDetail[]>
    {
        return this._outDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get outDetailPagenation$(): Observable<OutDetailPagenation>
    {
        return this._outDetailPagenation.asObservable();
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
    getHeader(page: number = 0, size: number = 10, sort: string = 'obNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ outHeaderPagenation: OutHeaderPagenation; outHeader: OutHeader[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/outBound/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._outHeaders.next(response.data);
                        this._outHeaderPagenation.next(response.pageNation);
                        resolve(this._outHeaders);
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 10, sort: string = 'obLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ outDetailPagenation: OutDetailPagenation; outDetail: OutDetail[] }> {

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
        this._outDetails.next([]);

        const pageParam = {
            page: page,
            size: size,
        };
        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/outBound/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._outHeader.next(search);
                        this._outDetails.next(response.data);
                        this._outDetailPagenation.next(response.pageNation);
                        resolve(this._outDetails);
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
        Observable<{ outDetailPagenation: OutDetailPagenation; outDetail: OutDetail[] }> {

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
            this._outDetails.next([]);
            // @ts-ignore
            this._outDetailPagenation.next([]);
        });
    }

    /**
     * Create
     */
    createOut(outBounds: OutBound[]): Observable<OutBound>
    {
        return this.outBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(outBounds, 'v1/api/inOut/outBound').pipe(
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setInitList() {
        this._outDetails.next([]);
    }
}

