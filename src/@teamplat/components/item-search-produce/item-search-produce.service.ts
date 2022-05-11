import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UdiModels, UdiModelsPagination} from "./item-search-produce.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {FunctionService} from "../../services/function";

@Injectable({
    providedIn: 'root'
})
export class ItemSearchProduceService {

    private _udiModelsList: BehaviorSubject<UdiModels[]> = new BehaviorSubject<UdiModels[]>(null);
    private _pagination: BehaviorSubject<UdiModelsPagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common,
                private _functionService: FunctionService,) {
    }

    /**
     * Getter
     */
    get udiModelsList$(): Observable<UdiModels[]>
    {
        return this._udiModelsList.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagination$(): Observable<UdiModelsPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getUdiModels(page: number = 1, size: number = 100, sort: string = 'itemName', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UdiModelsPagination; udiModels: UdiModels[] }>{

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

        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNationLoading(searchParam, pageParam,'/v1/api/udi/models/list')
                .subscribe((response: any) => {
                    this._pagination.next(response.pageNation);
                    resolve({pagenation: response.pageNation , udiModels: response.data});
                }, reject);

        });
    }
}
