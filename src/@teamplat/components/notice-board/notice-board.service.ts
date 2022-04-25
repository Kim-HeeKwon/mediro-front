import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Notice, Pagination} from "./notice-board.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {ActivatedRoute} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class NoticeBoardService {

    private _list: BehaviorSubject<Notice> = new BehaviorSubject(null);
    private _lists: BehaviorSubject<Notice[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _route: ActivatedRoute,) {
    }

    /**
     * Getter for product
     */
    get list$(): Observable<Notice>
    {
        return this._list.asObservable();
    }


    /**
     * Getter for products
     */
    get lists$(): Observable<Notice[]>
    {
        return this._lists.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<Pagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getNoticeBoard(page: number = 0, size: number = 40, sort: string = 'no', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ pagination: Pagination; products: Notice[] }>{

        const searchParam = {};

        const pageParam = {
            page: page,
            size: size,
        };

        // 파마미터 설정
        this._route.queryParams.subscribe((params) => {
            if(Object.keys(params).length > 0){
                for (const kk in params) {
                    searchParam[kk] = params[kk];
                }
                console.log(searchParam);
            }else{
                searchParam['order'] = order;
                searchParam['sort'] = sort;

                // 검색조건 Null Check
                if((Object.keys(search).length === 0) === false){
                    // eslint-disable-next-line guard-for-in
                    for (const k in search) {
                        searchParam[k] = search[k];
                    }
                }
            }
        });

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/noticeBoard')
                .subscribe((response: any) => {
                    this._lists.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve(this._lists);
                }, reject);
        });
    }
}
