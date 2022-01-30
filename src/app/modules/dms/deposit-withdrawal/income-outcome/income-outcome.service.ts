import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {IncomeOutcomeDetail} from "./income-outcome.types";
import {HttpClient} from "@angular/common/http";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class IncomeOutcomeService {

    private _incomeOutcomeDetails: BehaviorSubject<IncomeOutcomeDetail[]> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _functionService: FunctionService,
                private _common: Common) {

    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 1, sort: string = 'accountNm', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Promise<{ incomeOutcomeDetail: IncomeOutcomeDetail[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/incomeOutcome/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._incomeOutcomeDetails.next(response.data);
                        resolve({incomeOutcomeDetail: response.data});
                    }
                }, reject);
        });
    }
}
