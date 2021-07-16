import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {
    InBound,
    InDetail,
    InDetailPagenation,
    InHeader,
    InHeaderPagenation,
} from './in.types';
import {Common} from '@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class InService {

    private _inHeader: BehaviorSubject<InHeader> = new BehaviorSubject(null);
    private _inHeaders: BehaviorSubject<InHeader[]> = new BehaviorSubject(null);
    private _inHeaderPagenation: BehaviorSubject<InHeaderPagenation | null> = new BehaviorSubject(null);
    private _inDetail: BehaviorSubject<InDetail> = new BehaviorSubject(null);
    private _inDetails: BehaviorSubject<InDetail[]> = new BehaviorSubject(null);
    private _inDetailPagenation: BehaviorSubject<InDetailPagenation | null> = new BehaviorSubject(null);
    private _inBounds: BehaviorSubject<InBound[]> = new BehaviorSubject(null);

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
    get inHeader$(): Observable<InHeader>
    {
        return this._inHeader.asObservable();
    }

    /**
     * Getter for headers
     */
    get inHeaders$(): Observable<InHeader[]>
    {
        return this._inHeaders.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get inHeaderPagenation$(): Observable<InHeaderPagenation>
    {
        return this._inHeaderPagenation.asObservable();
    }

    /**
     * Getter for detail
     */
    get inDetail$(): Observable<InDetail>
    {
        return this._inDetail.asObservable();
    }


    /**
     * Getter for details
     */
    get inDetails$(): Observable<InDetail[]>
    {
        return this._inDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get inDetailPagenation$(): Observable<InDetailPagenation>
    {
        return this._inDetailPagenation.asObservable();
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
    get inBounds$(): Observable<InBound[]>
    {
        return this._inBounds.asObservable();
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
    getHeader(page: number = 0, size: number = 10, sort: string = 'ibNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ inHeaderPagenation: InHeaderPagenation; inHeader: InHeader[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/inBound/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._inHeaders.next(response.data);
                        this._inHeaderPagenation.next(response.pageNation);
                        resolve(this._inHeaders);
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 10, sort: string = 'ibLineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ inDetailPagenation: InDetailPagenation; inDetail: InDetail[] }> {

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
        this._inDetails.next([]);

        const pageParam = {
            page: page,
            size: size,
        };
        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/inOut/inBound/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._inHeader.next(search);
                        this._inDetails.next(response.data);
                        this._inDetailPagenation.next(response.pageNation);
                        resolve(this._inDetails);
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
        Observable<{ inDetailPagenation: InDetailPagenation; inDetail: InDetail[] }> {

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
            this._inHeader.next(null);
            this._inDetails.next([]);
            // @ts-ignore
            this._inDetailPagenation.next([]);
        });
    }

    /**
     * Create
     */
    createIn(inBounds: InBound[]): Observable<InBound>
    {
        return this.inBounds$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(inBounds, 'v1/api/inOut/inBound').pipe(
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setInitList() {
        this._inDetails.next([]);
    }

}
