import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {PopupPagenation} from "../common-popup-items/common-popup-items.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class CommonPopupItemsService{
    private _getList: BehaviorSubject<any> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<PopupPagenation | null> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter
     */
    get getList$(): Observable<any>
    {
        return this._getList.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<PopupPagenation>
    {
        return this._pagenation.asObservable();
    }
    getDynamicSql(page: number = 0, size: number = 1000, sort: string = 'account', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagenation: PopupPagenation; getList: any }>{
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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/common/popup/module-query')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._getList.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve(this._getList);
                    }
                }, reject);
        });
    }

    setInitList(): void{
        this._getList.next(null);
        this._pagenation.next(null);
    }
}
