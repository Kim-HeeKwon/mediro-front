import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {CommonPopupData, CommonPopupPagenation} from "./common-popup.types";

@Injectable({
    providedIn: 'root'
})
export class CommonPopupService {

    private _commonPopup: BehaviorSubject<CommonPopupData> = new BehaviorSubject(null);
    private _commonPopups: BehaviorSubject<CommonPopupData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<CommonPopupPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }

    /**
     * Getter for product
     */
    get commonPopup$(): Observable<CommonPopupData>
    {
        return this._commonPopup.asObservable();
    }
    /**
     * Getter for products
     */
    get commonPopups$(): Observable<CommonPopupData[]>
    {
        return this._commonPopups.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<CommonPopupPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getCommonPopup(page: number = 0, size: number = 100, sort: string = 'extPopupNm', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: CommonPopupPagenation; commonPopup: CommonPopupData[] }> {
        return ;
    }


    /**
     * save
     */
    saveCommonPopup(commonPopups: CommonPopupData[]): Observable<CommonPopupData>
    {
        return;
    }
}
