import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Pagenation,} from "../common-udi-account/common-udi-account.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {FunctionService} from "../../services/function";
import {retry} from "rxjs/operators";
import {UdiPagenation} from "../common-udi/common-udi.types";

@Injectable({
    providedIn: 'root'
})
export class CommonUdiAccountService {
    private _getList: BehaviorSubject<any> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<Pagenation | null> = new BehaviorSubject(null);
    private _status: BehaviorSubject<any> = new BehaviorSubject(null);
    private _msg: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _functionService: FunctionService,) {
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<Pagenation>
    {
        return this._pagenation.asObservable();
    }

    getAccount(page: number = 0, size: number = 100, sort: string = '', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: Pagenation; getList: [] }>{

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

        searchParam[search['searchType']] = search['searchText'];

        const pageParam = {
            page: page,
            size: size,
        };
        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNationLoading(searchParam, pageParam, 'v1/api/udi/entrps/company-info')
                .pipe(retry(2))
                .subscribe((response: any) => {
                    this._functionService.cfn_loadingBarClear();
                    if(response.status === 'SUCCESS'){
                        this._getList.next(response.data);
                        this._pagenation.next(response.pageNation);
                        // @ts-ignore
                        resolve({list: response.data});
                    }else{
                        this._status.next(response);
                        this._msg.next(response.msg);
                    }
                }, reject);

        });
    }
}
