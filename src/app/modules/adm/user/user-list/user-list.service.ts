import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UserList, UserListPagenation} from "./user-list.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {UserInfo, UserInfoPagenation} from "../user-info/user-info.types";

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
    getUserList(page: number = 0, size: number = 100, sort: string = 'businessName', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: UserInfoPagenation; userInfo: UserInfo[] }> {

        return;
    }
}
