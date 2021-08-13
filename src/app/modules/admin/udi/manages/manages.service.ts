import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Manages, ManagesPagenation} from './manages.types';
import {Common} from '../../../../../@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class ManagesService {

    private _manages: BehaviorSubject<Manages[]> = new BehaviorSubject(null);
    private _managesPagenation: BehaviorSubject<ManagesPagenation | null> = new BehaviorSubject(null);

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
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{managesPagenation: ManagesPagenation; manages: Manages[] }> {

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
                        this._manages.next(response.data);
                        this._managesPagenation.next(response.pageNation);
                        resolve(this._manages);
                    }
                }, reject);
        });
    }

    updateSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.listPut('v1/api/udi/supply-info', manages).pipe(
            switchMap((response: any) => of(response))
        );
    }

    deleteSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.listDelete('v1/api/udi/supply-info', manages).pipe(
            switchMap((response: any) => of(response))
        );
    }
}
