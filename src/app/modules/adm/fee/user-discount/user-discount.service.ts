import {BehaviorSubject, Observable} from "rxjs";
import {UserDiscountData, UserDiscountPagenation} from "./user-discount.types";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UserDiscountService {

    private _userDiscount: BehaviorSubject<UserDiscountData> = new BehaviorSubject(null);
    private _userDiscounts: BehaviorSubject<UserDiscountData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<UserDiscountPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get userDiscount$(): Observable<UserDiscountData>
    {
        return this._userDiscount.asObservable();
    }
    /**
     * Getter for products
     */
    get userDiscounts$(): Observable<UserDiscountData[]>
    {
        return this._userDiscounts.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UserDiscountPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getUserDiscount(page: number = 0, size: number = 100, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UserDiscountPagenation; userDiscount: UserDiscountData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/fee/userDiscount/userDiscount-list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._userDiscounts.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({userDiscount: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    saveUserDiscount(userDiscounts: UserDiscountData[]): Observable<UserDiscountData>
    {
        return this.userDiscounts$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(userDiscounts, 'v1/api/admin/fee/userDiscount/save-UserDiscount').pipe(
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
