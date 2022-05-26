import {BehaviorSubject, Observable} from "rxjs";
import {UserDiscountData, UserDiscountPagenation} from "./user-discount.types";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";

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

        return;
    }

    /**
     * save
     */
    saveUserDiscount(userDiscount: UserDiscountData[]): Observable<UserDiscountData>
    {
        return;
    }
}
