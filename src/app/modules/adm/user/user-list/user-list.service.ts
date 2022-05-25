import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UserList, UserListPagenation} from "./user-list.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class UserListService{

    private _userList: BehaviorSubject<UserList> = new BehaviorSubject(null);
    private _userLists: BehaviorSubject<UserList[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<UserListPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get userList$(): Observable<UserList>
    {
        return this._userList.asObservable();
    }
    /**
     * Getter for products
     */
    get userLists$(): Observable<UserList[]>
    {
        return this._userLists.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UserListPagenation>
    {
        return this._pagenation.asObservable();
    }

    /**
     * Post getUser
     *
     * @returns
     */
    getUserList(page: number = 0, size: number = 100, sort: string = 'addDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UserListPagenation; userList: UserList[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/user-list/list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._userLists.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({userList: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }
}
