import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {UdiCode, UdiCodePagination} from './udi-code.types';

@Injectable({
    providedIn: 'root'
})
export class UdiCodeService{

    private _udiCode: BehaviorSubject<UdiCode> = new BehaviorSubject(null);
    private _udiCodes: BehaviorSubject<UdiCode[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<UdiCodePagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _route: ActivatedRoute,) {
    }

    /**
     * Getter for product
     */
    get udiCode$(): Observable<UdiCode>
    {
        return this._udiCode.asObservable();
    }


    /**
     * Getter for products
     */
    get udiCodes$(): Observable<UdiCode[]>
    {
        return this._udiCodes.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UdiCodePagination>
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
        Observable<{ pagination: UdiCodePagination; products: UdiCode[] }> {
        return this._httpClient.get<{ pagination: UdiCodePagination; products: UdiCode[] }>('api/apps/ecommerce/inventory/products', {
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
            })
        );
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getUdiCodes(page: number = 0, size: number = 20, sort: string = 'itemNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagination: UdiCodePagination; products: UdiCode[] }>{

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
                    this._udiCodes.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve({products: response.data, pagination: response.pageNation});
                }, reject);
        });
    }

    /**
     * Get product by id
     */
    getUdiCodesById(udiCodeCd: string): Observable<UdiCode>
    {
        return this._udiCodes.pipe(
            take(1),
            map((products) => {

                // Find the product
                // @ts-ignore
                const product = products.find(udiCode => udiCode.itemCd === udiCode) || null;

                // Update the product
                this._udiCode.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + udiCodeCd + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create Item
     */
    createUdiCode(udiCode: UdiCode): Observable<UdiCode>
    {
        return this.udiCodes$.pipe(
            take(1),
            switchMap(products => this._common.sendDataLoading(udiCode, 'v1/api/basicInfo/item').pipe(
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
    deleteUdiCode(udiCodeData: UdiCode): Observable<{response: any}> {
        return this._common.deleteLoading('v1/api/basicInfo/item', udiCodeData).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * Update the item
     *
     * @param InventoryItem
     */
    updateUdiCode(udiCodeData: UdiCode): Observable<{response: any}> {
        return this._common.putLoading('v1/api/basicInfo/item', udiCodeData).pipe(
            switchMap((response: any) => of(response))
        );
    }
}
