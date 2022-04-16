import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {AccountData, AccountPagenation} from '../account/account.types';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {map, switchMap, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

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
    getAccount(page: number = 0, size: number = 20, sort: string = 'account', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: AccountPagenation; account: AccountData[] }> {

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
                        resolve({account: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * Create Account
     */
    createAccount(accountData: AccountData): Observable<AccountData>
    {
        return this.accounts$.pipe(
            take(1),
            switchMap(products => this._common.sendDataLoading(accountData, 'v1/api/basicInfo/account').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                        // Update the products with the new product
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    /**
     * Create Etc Account
     */
    createEtcAccount(accountData: AccountData): Observable<AccountData>
    {
        return this.accounts$.pipe(
            take(1),
            switchMap(products => this._common.sendDataLoading(accountData, 'v1/api/basicInfo/account/etc').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                        // Update the products with the new product
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    /* Put updateAccount
     * @param accountData
     */
    updateAccount(accountData: AccountData): Observable<{account: AccountData[] }> {

        return this._common.putLoading('v1/api/basicInfo/account', accountData).pipe(
            switchMap((response: any) => of(response))
        );
        // @ts-ignore
        // return new Promise((resolve, reject) => {
        //     this._common.put('v1/api/basicInfo/account', accountData)
        //         .subscribe((response: any) => {
        //             this.getAccount();
        //         }, reject);
        // });
    }
    /* delete deleteAccount
     * @param accountData
     */
    deleteAccount(accountData: AccountData): Observable<{account: AccountData[]}> {

        return this._common.deleteLoading('v1/api/basicInfo/account', accountData).pipe(
            switchMap((response: any) => of(response))
        );
        // @ts-ignore
        // return new Promise((resolve, reject) => {
        //     this._common.delete('v1/api/basicInfo/account', accountData)
        //         .subscribe((response: any) => {
        //             this.getAccount();
        //         }, reject);
        // });
    }

    /**
     * Get product by id
     */
    getAccountsById(account: string, accountType: string): Observable<AccountData>
    {
        return this._accounts.pipe(
            take(1),
            map((products) => {

                // Find the product
                // @ts-ignore
                const product = products.find(accountData => (accountData.account === account &&
                    accountData.accountType === accountType)) || null;

                // Update the product
                this._account.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + account + '!');
                }

                return of(product);
            })
        );
    }
}
