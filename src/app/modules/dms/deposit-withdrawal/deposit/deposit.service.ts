import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {BehaviorSubject, Observable} from "rxjs";
import {Deposit, DepositPagenation} from "./deposit.types";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class DepositService {

    private _deposit: BehaviorSubject<Deposit> = new BehaviorSubject(null);
    private _deposits: BehaviorSubject<Deposit[]> = new BehaviorSubject(null);
    private _depositPagenation: BehaviorSubject<DepositPagenation | null> = new BehaviorSubject(null);

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
    get deposit$(): Observable<Deposit>
    {
        return this._deposit.asObservable();
    }

    /**
     * Getter for headers
     */
    get deposits$(): Observable<Deposit[]>
    {
        return this._deposits.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get depositPagenation$(): Observable<DepositPagenation>
    {
        return this._depositPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 40, sort: string = 'depositDate', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ depositPagenation: DepositPagenation; deposit: Deposit[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/depositWithdrawal/deposit/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._deposits.next(response.data);
                        this._depositPagenation.next(response.pageNation);
                        resolve({deposit: response.data, depositPagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * save
     */
    saveDeposit(deposits: Deposit[]): Observable<Deposit>
    {
        return this.deposits$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(deposits, 'v1/api/depositWithdrawal/deposit/save-Deposit').pipe(
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
