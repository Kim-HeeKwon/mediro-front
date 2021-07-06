import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {EstimateDetail, EstimateDetailPagenation, EstimateHeader, EstimateHeaderPagenation} from './estimate.types';

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

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }
    /**
     * Getter for product
     */
    get estimateHeader$(): Observable<EstimateHeader>
    {
        return this._estimateHeader.asObservable();
    }
    /**
     * Getter for Estimate Header
     */
    get estimateHeaders$(): Observable<EstimateHeader[]>
    {
        return this._estimateHeaders.asObservable();
    }
    /**
     * Getter for EstimateHeader Pagenation
     */
    get estimateHeaderPagenation$(): Observable<EstimateHeaderPagenation>
    {
        return this._estimateHeaderPagenation.asObservable();
    }

    /**
     * Getter for Estimate Header
     */
    get estimateDetails$(): Observable<EstimateDetail[]>
    {
        return this._estimateDetails.asObservable();
    }
    /**
     * Getter for EstimateHeader Pagenation
     */
    get estimateDetailPagenation$(): Observable<EstimateDetailPagenation>
    {
        return this._estimateDetailPagenation.asObservable();
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
}
