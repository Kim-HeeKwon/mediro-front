import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {CommonPopupData, CommonPopupPagenation, DetailCommonPopupData} from "./common-popup.types";

@Injectable({
    providedIn: 'root'
})
export class CommonPopupService {

    private _commonPopup: BehaviorSubject<CommonPopupData> = new BehaviorSubject(null);
    private _commonPopups: BehaviorSubject<CommonPopupData[]> = new BehaviorSubject(null);
    private _detailCommonPopup: BehaviorSubject<DetailCommonPopupData> = new BehaviorSubject(null);
    private _detailCommonPopups: BehaviorSubject<DetailCommonPopupData[]> = new BehaviorSubject(null);
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

    get detailCommonPopup$(): Observable<DetailCommonPopupData>
    {
        return this._detailCommonPopup.asObservable();
    }

    get detailCommonPopups$(): Observable<DetailCommonPopupData[]>
    {
        return this._detailCommonPopups.asObservable();
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
        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
        if ((Object.keys(search).length === 0) === false) {
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
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/common/popup/header-list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._commonPopups.next(response.data);
                        this._pagenation.next(response.pageNation);
                        resolve({commonPopup: response.data, pagenation: response.pageNation});
                    }
                }, reject);
        });
    }


    /**
     * save
     */
    saveCommonPopup(commonPopups: CommonPopupData[]): Observable<CommonPopupData>
    {
        return;
    }

    saveDetailCommonPopup(detailCommonPopups: DetailCommonPopupData[]): Observable<DetailCommonPopupData>
    {
        return;
    }
}
