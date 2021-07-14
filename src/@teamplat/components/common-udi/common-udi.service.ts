import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../providers/common/common';
import {UdiPagenation} from './common-udi.types';

@Injectable({
    providedIn: 'root'
})
export class CommonUdiService{
    private _getList: BehaviorSubject<any> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<UdiPagenation | null> = new BehaviorSubject(null);
    private _status: BehaviorSubject<any> = new BehaviorSubject(null);
    private _msg: BehaviorSubject<any> = new BehaviorSubject(null);

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
     * Getter
     */
    get getStatus$(): Observable<any>
    {
        return this._status.asObservable();
    }
    /**
     * Getter
     */
    get getMsg$(): Observable<any>
    {
        return this._msg.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UdiPagenation>
    {
        return this._pagenation.asObservable();
    }
    getUdi(page: number = 0, size: number = 100, sort: string = '', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagenation: UdiPagenation; getList: any }>{

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/udi/' + search.mediroUrl)
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._status.next(response.status);
                        this._getList.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve(this._getList);
                    }else{
                        this._status.next(response.status);
                        this._msg.next(response.msg);
                    }
                }, reject);
        });
    }

    setInitList(): void{
        this._getList.next(null);
    }
}
