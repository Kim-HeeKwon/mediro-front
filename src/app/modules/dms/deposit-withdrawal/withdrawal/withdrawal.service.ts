import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Withdrawal, WithdrawalPagenation} from "./withdrawal.types";
import {Deposit} from "../deposit/deposit.types";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class WithdrawalService {


    private _withdrawal: BehaviorSubject<Withdrawal> = new BehaviorSubject(null);
    private _withdrawals: BehaviorSubject<Withdrawal[]> = new BehaviorSubject(null);
    private _withdrawalPagenation: BehaviorSubject<WithdrawalPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _functionService: FunctionService,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get withdrawal$(): Observable<Withdrawal>
    {
        return this._withdrawal.asObservable();
    }

    /**
     * Getter for headers
     */
    get withdrawals$(): Observable<Withdrawal[]>
    {
        return this._withdrawals.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get withdrawalPagenation$(): Observable<WithdrawalPagenation>
    {
        return this._withdrawalPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'withdrawalDate', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ withdrawalPagenation: WithdrawalPagenation; withdrawal: Withdrawal[] }> {

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

        // if(searchParam['start'] === undefined){
        //     if(searchParam['end'] === undefined){
        //         searchParam['start'] = moment().utc(false).add(-7, 'day').endOf('day').toISOString();
        //         searchParam['end'] =  moment().utc(false).startOf('day').toISOString();
        //     }
        // }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/depositWithdrawal/withdrawal/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._withdrawals.next(response.data);
                        this._withdrawalPagenation.next(response.pageNation);
                        resolve({withdrawal: response.data, withdrawalPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    saveWithdrawal(withdrawals: Withdrawal[]): Observable<Withdrawal>
    {
        return this.withdrawals$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(withdrawals, 'v1/api/depositWithdrawal/withdrawal/save-Withdrawal').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    closeWithdrawal(withdrawals: Withdrawal[]): Observable<Withdrawal>
    {
        return this.withdrawals$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(withdrawals, 'v1/api/depositWithdrawal/withdrawal/close-Withdrawal').pipe(
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
