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

    private _data: BehaviorSubject<InventoryItem> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
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

    /**
     * Post getItems
     *
     * @returns
     */
    getItems(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: InventoryPagination; products: InventoryItem[] }>{

        let param = {};
        if (this._common.gfn_isNull(search)) {
            param= {
                marketCode: 'KRW-XRP',
                count: 30
            };
        }

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData('', '/v1/api/item/item-info')
                .subscribe((response: any) => {
                    console.log(response.resultD);
                    console.log(response.resultD[0]);

                    this._data = response.resultD[0];
                    resolve(this._data);
                }, reject);
        });
    }
}
