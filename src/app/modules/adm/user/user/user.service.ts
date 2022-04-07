import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {BehaviorSubject, Observable} from "rxjs";
import {UserData, UserPagenation} from "./user.types";
import {map, switchMap, take} from "rxjs/operators";


@Injectable({
    providedIn: 'root'
})
export class UserService {

    private _user: BehaviorSubject<UserData> = new BehaviorSubject(null);
    private _users: BehaviorSubject<UserData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<UserPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get user$(): Observable<UserData>
    {
        return this._user.asObservable();
    }
    /**
     * Getter for products
     */
    get users$(): Observable<UserData[]>
    {
        return this._users.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UserPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getUser(page: number = 0, size: number = 100, sort: string = 'businessName', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UserPagenation; user: UserData[] }> {

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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/admin/user/user-list')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._users.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({user: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }

    /**
     * update
     */
    saveUserInfo(users: UserData[]): Observable<UserData>
    {
        return this.users$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(users, 'v1/api/admin/user/save-user-info').pipe(
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
