import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {ServiceChargeData, ServiceChargePagenation} from "./service-charge.types";


@Injectable({
    providedIn: 'root'
})
export class ServiceChargeService {

    private _serviceCharge: BehaviorSubject<ServiceChargeData> = new BehaviorSubject(null);
    private _serviceCharges: BehaviorSubject<ServiceChargeData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<ServiceChargePagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get serviceCharge$(): Observable<ServiceChargeData>
    {
        return this._serviceCharge.asObservable();
    }
    /**
     * Getter for products
     */
    get serviceCharges$(): Observable<ServiceChargeData[]>
    {
        return this._serviceCharges.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<ServiceChargePagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getServiceCharge(page: number = 0, size: number = 100, sort: string = 'priority', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: ServiceChargePagenation; serviceCharge: ServiceChargeData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/service/serviceCharge/serviceCharge-list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._serviceCharges.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({serviceCharge: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

}
