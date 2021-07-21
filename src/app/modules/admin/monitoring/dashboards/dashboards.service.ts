import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Common} from "@teamplat/providers/common/common";
import {DashboardsPagination, RecallItem} from "./dashboards.types";

@Injectable({
    providedIn: 'root'
})
export class DashboardsService {

    private _recallItem: BehaviorSubject<RecallItem> = new BehaviorSubject(null);
    private _recallItems: BehaviorSubject<RecallItem[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<DashboardsPagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for products
     */
    get reallItems$(): Observable<RecallItem[]>
    {
        return this._recallItems.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<DashboardsPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Post RecallItem
     *
     * @returns
     */
    getRecallItem(page: number = 0, size: number = 8, sort: string = '', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagination: DashboardsPagination; products: RecallItem[] }>{

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
        if((Object.keys(search).length === 0) === false){
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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/scraping/udi-portal/udi-portal-recall-item-list')
                .subscribe((response: any) => {
                    this._recallItems.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve(this._recallItems);
                }, reject);
        });
    }
}
