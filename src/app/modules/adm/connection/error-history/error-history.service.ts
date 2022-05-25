import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {ErrorHistoryData, ErrorHistoryPagenation} from "./error-history.types";

@Injectable({
    providedIn: 'root'
})
export class ErrorHistoryService {

    private _errorHistory: BehaviorSubject<ErrorHistoryData> = new BehaviorSubject(null);
    private _errorHistorys: BehaviorSubject<ErrorHistoryData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<ErrorHistoryPagenation | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter for product
     */
    get _errorHistory$(): Observable<ErrorHistoryData>
    {
        return this._errorHistory.asObservable();
    }
    /**
     * Getter for products
     */
    get _errorHistorys$(): Observable<ErrorHistoryData[]>
    {
        return this._errorHistorys.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<ErrorHistoryPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getErrorHistory(page: number = 0, size: number = 100, sort: string = 'errorCode', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: ErrorHistoryPagenation; errorHistory: ErrorHistoryData[] }> {

        return;
    }
}
