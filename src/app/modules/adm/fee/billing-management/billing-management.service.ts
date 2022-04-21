import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from '../../../../../@teamplat/providers/common/common';
import {BillManagementData, BillManagementPagenation} from './billing-management.types';

@Injectable({
    providedIn: 'root'
})
export class BillingManagementService {

    private _billmanagement: BehaviorSubject<BillManagementData> = new BehaviorSubject(null);
    private _billmanagements: BehaviorSubject<BillManagementData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<BillManagementPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter for product
     */
    get _billmanagement$(): Observable<BillManagementData>
    {
        return this._billmanagement.asObservable();
    }
    /**
     * Getter for products
     */
    get _billmanagements$(): Observable<BillManagementData[]>
    {
        return this._billmanagements.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<BillManagementPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getBillManagement(page: number = 0, size: number = 100, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: BillManagementPagenation; billManagement: BillManagementData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/fee/feeUser/feeUser-list') // url 변경
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._billmanagements.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({billManagement: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

}
