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

        return;
    }

    /**
     * save
     */
    saveDiscount(discount: DiscountData[]): Observable<DiscountData>
    {
        return;
    }
}
