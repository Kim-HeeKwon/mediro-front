import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {DiscountData, DiscountPagenation} from "./discount.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {map, switchMap, take} from "rxjs/operators";
@Injectable({
    providedIn: 'root'
})
export class DiscountService {

    private _discount: BehaviorSubject<DiscountData> = new BehaviorSubject(null);
    private _discounts: BehaviorSubject<DiscountData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<DiscountPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get discount$(): Observable<DiscountData>
    {
        return this._discount.asObservable();
    }
    /**
     * Getter for products
     */
    get discounts$(): Observable<DiscountData[]>
    {
        return this._discounts.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<DiscountPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getDiscount(page: number = 0, size: number = 100, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: DiscountPagenation; discount: DiscountData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/fee/discount/discount-list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._discounts.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({discount: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    saveDiscount(discounts: DiscountData[]): Observable<DiscountData>
    {
        return this.discounts$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(discounts, 'v1/api/admin/fee/discount/save-Discount').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
