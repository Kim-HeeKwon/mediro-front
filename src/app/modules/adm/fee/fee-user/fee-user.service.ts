import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {FeeUserData, FeeUserPagenation} from "./fee-user.types";

@Injectable({
    providedIn: 'root'
})
export class FeeUserService {

    private _feeUser: BehaviorSubject<FeeUserData> = new BehaviorSubject(null);
    private _feeUsers: BehaviorSubject<FeeUserData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<FeeUserPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get feeUser$(): Observable<FeeUserData>
    {
        return this._feeUser.asObservable();
    }
    /**
     * Getter for products
     */
    get feeUsers$(): Observable<FeeUserData[]>
    {
        return this._feeUsers.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<FeeUserPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getFeeUser(page: number = 0, size: number = 100, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: FeeUserPagenation; feeUser: FeeUserData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/fee/feeUser/feeUser-list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._feeUsers.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({feeUser: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

}
