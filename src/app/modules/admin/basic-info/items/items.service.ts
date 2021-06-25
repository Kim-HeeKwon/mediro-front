import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {InventoryItem, InventoryPagination} from './items.types';
import {Common} from '@teamplat/providers/common/common';

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
    constructor(private _httpClient: HttpClient, private _common: Common) {
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
        console.log('click!!');
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

    // @ts-ignore
    /**
     * Post getItems
     *
     * @returns
     */
    getItems(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: InventoryPagination; products: InventoryItem[] }>{

        console.log(order);
        console.log(sort);
        console.log(search);

        const param = {
            search: search,
            order: order,
            sort: sort,
        };

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(param, pageParam, 'v1/api/basicInfo/item/item-info')
                .subscribe((response: any) => {
                    console.log(response);
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
}
