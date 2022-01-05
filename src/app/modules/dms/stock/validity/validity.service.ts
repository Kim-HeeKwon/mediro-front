import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Validity, ValidityPagenation} from './validity.types';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../../../../@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class ValidityService{
    private _validity: BehaviorSubject<Validity> = new BehaviorSubject(null);
    private _validitys: BehaviorSubject<Validity[]> = new BehaviorSubject(null);
    private _validityPagenation: BehaviorSubject<ValidityPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get validity$(): Observable<Validity>
    {
        return this._validity.asObservable();
    }

    /**
     * Getter for headers
     */
    get validitys$(): Observable<Validity[]>
    {
        return this._validitys.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get validityPagenation$(): Observable<ValidityPagenation>
    {
        return this._validityPagenation.asObservable();
    }
    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{validityPagenation: ValidityPagenation; validity: Validity[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/stock/validity/validity-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._validitys.next(response.data);
                        this._validityPagenation.next(response.pageNation);
                        resolve({validity: response.data, validityPagenation: response.pageNation});
                    }
                }, reject);
        });
    }
}
