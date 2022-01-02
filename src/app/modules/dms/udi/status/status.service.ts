import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {SupplyStatus, SupplyStatusPagenation} from "./status.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class StatusService {

    // eslint-disable-next-line @typescript-eslint/naming-convention
    private _supplyStatus: BehaviorSubject<SupplyStatus[]> = new BehaviorSubject(null);
    private _suppleyStatusPagenation: BehaviorSubject<SupplyStatusPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Getter for headers
     */
    get supplyStatus$(): Observable<SupplyStatus[]>
    {
        return this._supplyStatus.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get suppleyStatusPagenation$(): Observable<SupplyStatusPagenation>
    {
        return this._suppleyStatusPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 20, sort: string = 'serialkey', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{supplyStatusPagenation: SupplyStatusPagenation; supplyStatus: SupplyStatus[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/udi/supply-info/status')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._supplyStatus.next(response.data);
                        this._suppleyStatusPagenation.next(response.pageNation);
                        resolve(this._supplyStatus);
                    }
                }, reject);
        });
    }

    /**
     * resend
     */
    suplyResend(supplyStatuses: SupplyStatus[]): Observable<SupplyStatus>
    {
        return this.supplyStatus$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(supplyStatuses, 'v1/api/udi/supply-info/resend').pipe(
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
