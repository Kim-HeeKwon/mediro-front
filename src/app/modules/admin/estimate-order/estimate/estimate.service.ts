import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {
    Estimate,
    EstimateDetail,
    EstimateDetailPagenation,
    EstimateHeader,
    EstimateHeaderPagenation
} from './estimate.types';
import {map, switchMap, take} from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class EstimateService {
    private _estimateHeader: BehaviorSubject<EstimateHeader> = new BehaviorSubject(null);
    private _estimateHeaders: BehaviorSubject<EstimateHeader[]> = new BehaviorSubject(null);
    private _estimateHeaderPagenation: BehaviorSubject<EstimateHeaderPagenation | null> = new BehaviorSubject(null);
    private _estimateDetail: BehaviorSubject<EstimateDetail> = new BehaviorSubject(null);
    private _estimateDetails: BehaviorSubject<EstimateDetail[]> = new BehaviorSubject(null);
    private _estimateDetailPagenation: BehaviorSubject<EstimateDetailPagenation | null> = new BehaviorSubject(null);
    private _estimates: BehaviorSubject<Estimate[]> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }
    /**
     * Getter for Header
     */
    get estimateHeader$(): Observable<EstimateHeader>
    {
        return this._estimateHeader.asObservable();
    }
    /**
     * Getter for Header
     */
    get estimateHeaders$(): Observable<EstimateHeader[]>
    {
        return this._estimateHeaders.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get estimateHeaderPagenation$(): Observable<EstimateHeaderPagenation>
    {
        return this._estimateHeaderPagenation.asObservable();
    }

    /**
     * Getter for Detail
     */
    get estimateDetails$(): Observable<EstimateDetail[]>
    {
        return this._estimateDetails.asObservable();
    }
    /**
     * Getter for Detail Pagenation
     */
    get estimateDetailPagenation$(): Observable<EstimateDetailPagenation>
    {
        return this._estimateDetailPagenation.asObservable();
    }

    /**
     * Getter
     */
    get estimates$(): Observable<Estimate[]>
    {
        return this._estimates.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ estimateHeaderPagenation: EstimateHeaderPagenation; estimateHeader: EstimateHeader[] }> {

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


        if(searchParam['start'] === undefined){
            if(searchParam['end'] === undefined){
                searchParam['start'] = moment().add(-7, 'day').endOf('day').toISOString();
                searchParam['end'] =  moment().startOf('day').toISOString();
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/estimate/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._estimateHeaders.next(response.data);
                        this._estimateHeaderPagenation.next(response.pageNation);
                        resolve(this._estimateHeaders);
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
        Observable<{ estimateDetailPagenation: EstimateDetailPagenation; estimateDetail: EstimateDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/estimate/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._estimateDetails.next(response.data);
                        this._estimateDetailPagenation.next(response.pageNation);
                        resolve(this._estimateDetails);
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
        Observable<{ estimateDetailPagenation: EstimateDetailPagenation; estimateDetail: EstimateDetail[] }> {

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
            this._estimateDetails.next([]);
            // @ts-ignore
            this._estimateDetailPagenation.next([]);
        });
    }

    /**
     * Create
     */
    createEstimate(estimate: Estimate[]): Observable<Estimate>
    {
        return this.estimates$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(estimate, 'v1/api/estimateOrder/estimate').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    updateEstimate(estimate: Estimate[]): Observable<{estimate: Estimate[] }> {

        return this._common.listPut('v1/api/estimateOrder/estimate', estimate).pipe(
            switchMap((response: any) => of(response))
        );
    }
    deleteEstimate(estimate: Estimate[]): Observable<{estimate: Estimate[]}> {

        return this._common.listDelete('v1/api/estimateOrder/estimate', estimate).pipe(
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
    totalAmt(estimate: Estimate[]): Observable<{estimate: Estimate[]}> {
        return this._common.put('v1/api/estimateOrder/estimate/estimate-total-amt', estimate).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * 발송
     */
    estimateSend(estimates: Estimate[]): Observable<Estimate>
    {
        return this.estimates$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(estimates, 'v1/api/estimateOrder/estimate/send').pipe(
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
     * 확정
     */
    estimateConfirm(estimates: Estimate[]): Observable<Estimate>
    {
        return this.estimates$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(estimates, 'v1/api/estimateOrder/estimate/confirm').pipe(
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
     * 취소
     */
    estimateCancel(estimates: Estimate[]): Observable<Estimate>
    {
        return this.estimates$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(estimates, 'v1/api/estimateOrder/estimate/cancel').pipe(
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
