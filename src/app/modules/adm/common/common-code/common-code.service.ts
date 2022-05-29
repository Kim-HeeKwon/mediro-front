import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {CommonCodeData, CommonCodePagenation} from "./common-code.types";

@Injectable({
    providedIn: 'root'
})
export class CommonCodeService {

    private _commonCode: BehaviorSubject<CommonCodeData> = new BehaviorSubject(null);
    private _commonCodes: BehaviorSubject<CommonCodeData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<CommonCodePagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get commonCode$(): Observable<CommonCodeData>
    {
        return this._commonCode.asObservable();
    }
    /**
     * Getter for products
     */
    get commonCodes$(): Observable<CommonCodeData[]>
    {
        return this._commonCodes.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<CommonCodePagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getCommonCode(page: number = 0, size: number = 100, sort: string = 'descr', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: CommonCodePagenation; commonCode: CommonCodeData[] }> {
        return ;
    }


    /**
     * save
     */
    saveCommonCode(commonCodes: CommonCodeData[]): Observable<CommonCodeData>
    {
        return;
    }
}
