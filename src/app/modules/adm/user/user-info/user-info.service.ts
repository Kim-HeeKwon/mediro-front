import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {UserInfo, UserInfoPagenation} from "./user-info.types";

@Injectable({
    providedIn: 'root'
})
export class UserInfoService{

    private _userInfo: BehaviorSubject<UserInfo> = new BehaviorSubject(null);
    private _userInfos: BehaviorSubject<UserInfo[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<UserInfoPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get userInfo$(): Observable<UserInfo>
    {
        return this._userInfo.asObservable();
    }
    /**
     * Getter for products
     */
    get userInfos$(): Observable<UserInfo[]>
    {
        return this._userInfos.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UserInfoPagenation>
    {
        return this._pagenation.asObservable();
    }

    /**
     * Post getUser
     *
     * @returns
     */
    getUserInfo(page: number = 0, size: number = 100, sort: string = 'businessName', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UserInfoPagenation; userInfo: UserInfo[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/user-info/user-info-list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._userInfos.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({userInfo: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

}
