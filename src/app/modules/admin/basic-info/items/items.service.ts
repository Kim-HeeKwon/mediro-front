import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {InventoryItem, InventoryPagination} from './items.types';
import {Common} from '@teamplat/providers/common/common';
import {ActivatedRoute} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ItemsService {

    private _item: BehaviorSubject<InventoryItem> = new BehaviorSubject(null);
    private _items: BehaviorSubject<InventoryItem[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _route: ActivatedRoute,) {
    }

    /**
     * Getter for product
     */
    get item$(): Observable<InventoryItem>
    {
        return this._item.asObservable();
    }


    /**
     * Getter for products
     */
    get items$(): Observable<InventoryItem[]>
    {
        return this._items.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<InventoryPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Get products
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getProducts(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: InventoryPagination; products: InventoryItem[] }> {
        return this._httpClient.get<{ pagination: InventoryPagination; products: InventoryItem[] }>('api/apps/ecommerce/inventory/products', {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                console.log(response);
                //this._pagination.next(response.pagination);
                //this._products.next(response.products);
            })
        );
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getItems(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagination: InventoryPagination; products: InventoryItem[] }>{

        const searchParam = {};

        const pageParam = {
            page: page,
            size: size,
        };

        // 파마미터 설정
        this._route.queryParams.subscribe((params) => {
            if(Object.keys(params).length > 0){
                for (const kk in params) {
                    searchParam[kk] = params[kk];
                }
                console.log(searchParam);
            }else{
                searchParam['order'] = order;
                searchParam['sort'] = sort;

                // 검색조건 Null Check
                if((Object.keys(search).length === 0) === false){
                    // eslint-disable-next-line guard-for-in
                    for (const k in search) {
                        searchParam[k] = search[k];
                    }
                }
            }
        });

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/item/item-info')
                .subscribe((response: any) => {
                    this._items.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve(this._items);
                }, reject);
        });
    }

    /**
     * Get product by id
     */
    getItemsById(itemCd: string): Observable<InventoryItem>
    {
        return this._items.pipe(
            take(1),
            map((products) => {

                // Find the product
                // @ts-ignore
                const product = products.find(item => item.itemCd === itemCd) || null;

                // Update the product
                this._item.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + itemCd + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create Item
     */
    createItem(item: InventoryItem): Observable<InventoryItem>
    {
        return this.items$.pipe(
            take(1),
            switchMap(products => this._common.sendData(item, 'v1/api/basicInfo/item').pipe(
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
     * Delete the item
     *
     * @param InventoryItem
     */
    deleteItem(itemData: InventoryItem): Observable<{response: any}> {
        return this._common.delete('v1/api/basicInfo/item', itemData).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * Update the item
     *
     * @param InventoryItem
     */
    updateItem(itemData: InventoryItem): Observable<{response: any}> {
        return this._common.put('v1/api/basicInfo/item', itemData).pipe(
            switchMap((response: any) => of(response))
        );
    }

    // deleteProduct(id: string): Observable<boolean>
    // {
    //     return this.items$.pipe(
    //         take(1),
    //         switchMap(
    //             products => this._httpClient.delete('api/apps/ecommerce/inventory/product', {params: {id}}).pipe(
    //             map((isDeleted: boolean) => {
    //
    //                 // Find the index of the deleted product
    //                 const index = products.findIndex(item => item.id === id);
    //
    //                 // Delete the product
    //                 products.splice(index, 1);
    //
    //                 // Update the products
    //                 this._products.next(products);
    //
    //                 // Return the deleted status
    //                 return isDeleted;
    //             })
    //             )
    //         )
    //     );
    // }

    // deleteProduct(id: string): Observable<boolean>
    // {
    //     // @ts-ignore
    //     return this._common.sendData(param, 'v1/api/basicInfo/item/item-info')
    //         .subscribe((response: any) => {
    //             console.log(response);
    //             this._items.next(response.data);
    //             this._pagination.next(response.pageNation);
    //             return false;
    //         },(error => {
    //           console.log(error);
    //         }));
    // }
}
