import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {ItemPrice, ItemPriceHistory, ItemPriceHistoryPagenation, ItemPricePagenation} from './item-price.types';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ItemPriceService{
    private _itemPrice: BehaviorSubject<ItemPrice> = new BehaviorSubject(null);
    private _itemPrices: BehaviorSubject<ItemPrice[]> = new BehaviorSubject(null);
    private _itemPricePagenation: BehaviorSubject<ItemPricePagenation | null> = new BehaviorSubject(null);
    private _itemPriceHistory: BehaviorSubject<ItemPriceHistory> = new BehaviorSubject(null);
    private _itemPriceHistorys: BehaviorSubject<ItemPriceHistory[]> = new BehaviorSubject(null);
    private _itemPriceHistoryPagenation: BehaviorSubject<ItemPriceHistoryPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get itemPrice$(): Observable<ItemPrice>
    {
        return this._itemPrice.asObservable();
    }

    /**
     * Getter for headers
     */
    get itemPrices$(): Observable<ItemPrice[]>
    {
        return this._itemPrices.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get itemPricePagenation$(): Observable<ItemPricePagenation>
    {
        return this._itemPricePagenation.asObservable();
    }

    /**
     * Getter for details
     */
    get itemPriceHistorys$(): Observable<ItemPriceHistory[]>
    {
        return this._itemPriceHistorys.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get itemPriceHistoryPagenation$(): Observable<ItemPricePagenation>
    {
        return this._itemPriceHistoryPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 20, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ itemPricePagenation: ItemPricePagenation; itemPrice: ItemPrice[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/itemPrice/itemPrice-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._itemPrices.next(response.data);
                        this._itemPricePagenation.next(response.pageNation);
                        resolve({itemPrice: response.data, itemPricePagenation: response.pageNation});
                    }
                }, reject);
        });
    }


    /**
     * Create
     */
    createItemPrice(itemPrice: ItemPrice): Observable<ItemPrice>
    {
        return this.itemPrices$.pipe(
            take(1),
            switchMap(products => this._common.sendDataLoading(itemPrice, 'v1/api/basicInfo/itemPrice').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                        // Update the products with the new product
                        // this._items.next([newProduct.data, ...products]);
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
    /**
     * Updatec
     */
    updateItemPrice(itemPriceHistory: ItemPriceHistory[]): Observable<{itemPriceHistory: ItemPriceHistory[] }> {

        return this._common.listPutLoading('v1/api/basicInfo/itemPrice', itemPriceHistory).pipe(
            switchMap((response: any) => of(response))
        );
    }

    deleteItemPrice(itemPrice: ItemPrice[]): Observable<{itemPrice: ItemPrice[] }> {

        return this._common.listDeleteLoading('v1/api/basicInfo/itemPrice', itemPrice).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getHistory(page: number = 0, size: number = 20, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ itemPriceHistoryPagenation: ItemPriceHistoryPagenation; itemPriceHistorys: ItemPriceHistory[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/itemPriceHistory/itemPriceHistory-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._itemPrice.next(search);
                        this._itemPriceHistorys.next(response.data);
                        this._itemPriceHistoryPagenation.next(response.pageNation);
                        resolve({itemPriceHistorys: response.data, itemPriceHistoryPagenation : response.pageNation});
                    }
                }, reject);
        });
    }

    getItemPriceHistorysById(account: string, itemCd: string, type: string): Observable<ItemPrice>
    {
        return this._itemPrices.pipe(
            take(1),
            map((products) => {
                const product = products.find(itemPrice => (itemPrice.account === account &&
                    itemPrice.itemCd === itemCd &&
                    itemPrice.type === type)) || null;

                // Update the product
                // @ts-ignore
                this._itemPrices.next(products);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + 'price' + '!');
                }

                return of(product);
            })
        );
    }
}
