import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Common} from '@teamplat/providers/common/common';
import {ItemSearchPagination, UdiItem, UdiSearchItem} from './item-search.types';

@Injectable({
    providedIn: 'root'
})
export class ITemSearchService{
    private _udiItemList: BehaviorSubject<UdiItem[]> = new BehaviorSubject<UdiItem[]>(null);
    private _pagination: BehaviorSubject<ItemSearchPagination | null> = new BehaviorSubject(null);
    private _itemHeaderList: BehaviorSubject<any | null> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter
     */
    get udiItemList$(): Observable<UdiItem[]>
    {
        return this._udiItemList.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagination$(): Observable<ItemSearchPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for itemHeaderList$
     */
    get itemHeaderList$(): Observable<any>
    {
        return this._itemHeaderList.asObservable();
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getUdiSearchItems(page: number = 0, size: number = 10, sort: string = 'itemName', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagination: ItemSearchPagination; products: UdiSearchItem[] }>{

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/scraping/udi-portal/udi-portal-item-list')
                .subscribe((response: any) => {
                    if(response.data.length > 0){
                        const itemHeader: any = [];
                        // eslint-disable-next-line guard-for-in
                        for(const key in response.data[0]) {
                            itemHeader.push(key);
                        }
                        this._itemHeaderList.next(itemHeader);
                    }
                    this._udiItemList.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve(this._udiItemList);
                }, reject);
        });
    }

    setInitList(): void{
        this._udiItemList.next(null);
    }

}
