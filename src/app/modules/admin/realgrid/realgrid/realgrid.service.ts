import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {AccountData, AccountPagenation} from "../../basic-info/account/account.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class RealgridService {
    private _account: BehaviorSubject<AccountData> = new BehaviorSubject(null);
    private _accounts: BehaviorSubject<AccountData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<AccountPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get account$(): Observable<AccountData>
    {
        return this._account.asObservable();
    }
    /**
     * Getter for products
     */
    get accounts$(): Observable<AccountData[]>
    {
        return this._accounts.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<AccountPagenation>
    {
        return this._pagenation.asObservable();
    }
    // @ts-ignore
    /**
     * Post getAccount
     *
     * @returns
     */
    getAccount(page: number = 0, size: number = 10, sort: string = 'account', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagenation: AccountPagenation; account: AccountData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/account/account-list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._accounts.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve(this._accounts);
                    }
                }, reject);
        });
    }
}
