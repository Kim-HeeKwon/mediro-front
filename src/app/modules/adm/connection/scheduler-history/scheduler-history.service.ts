import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {SchedulerHistoryData, SchedulerHistoryPagenation} from "./scheduler-history.types";

@Injectable({
    providedIn: 'root'
})
export class SchedulerHistoryService {

    private _schedulerHistory: BehaviorSubject<SchedulerHistoryData> = new BehaviorSubject(null);
    private _schedulerHistorys: BehaviorSubject<SchedulerHistoryData[]> = new BehaviorSubject(null);
    private _pagenation: BehaviorSubject<SchedulerHistoryPagenation | null> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter for product
     */
    get _schedulerHistory$(): Observable<SchedulerHistoryData>
    {
        return this._schedulerHistory.asObservable();
    }
    /**
     * Getter for products
     */
    get _schedulerHistorys$(): Observable<SchedulerHistoryData[]>
    {
        return this._schedulerHistorys.asObservable();
    }
    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<SchedulerHistoryPagenation>
    {
        return this._pagenation.asObservable();
    }

    // @ts-ignore
    /**
     * Post getUser
     *
     * @returns
     */
    getSchedulerHistory(page: number = 0, size: number = 100, sort: string = 'schedulerDate', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagenation: SchedulerHistoryPagenation; schedulerHistory: SchedulerHistoryData[] }> {

        return;
    }
}
