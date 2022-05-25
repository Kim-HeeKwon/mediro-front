import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {ConnectionHistoryData, ConnectionHistoryPagenation} from "./connection-history.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class ConnectionHistoryService {

    private _connectionHistory: BehaviorSubject<ConnectionHistoryData> = new BehaviorSubject(null);
    private _connectionHistorys: BehaviorSubject<ConnectionHistoryData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<ConnectionHistoryPagenation | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter for product
     */
    get _connectionHistory$(): Observable<ConnectionHistoryData>
    {
        return this._connectionHistory.asObservable();
    }
    /**
     * Getter for products
     */
    get _connectionHistorys$(): Observable<ConnectionHistoryData[]>
    {
        return this._connectionHistorys.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<ConnectionHistoryPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getConnectionHistory(page: number = 0, size: number = 100, sort: string = 'connectDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: ConnectionHistoryPagenation; connectionHistory: ConnectionHistoryData[] }> {

        return;
    }
}
