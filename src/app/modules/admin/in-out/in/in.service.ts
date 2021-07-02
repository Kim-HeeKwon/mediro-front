import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';
import {InPagination, InventoryInItem} from './in.types';
import {Common} from '@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class InService {

    private _inItem: BehaviorSubject<InventoryInItem> = new BehaviorSubject(null);
    private _inItems: BehaviorSubject<InventoryInItem[]> = new BehaviorSubject(null);
    private _inPagination: BehaviorSubject<InPagination | null> = new BehaviorSubject(null);
    private _showMobile: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for inItem
     */
    get inItem$(): Observable<InventoryInItem>
    {
        return this._inItem.asObservable();
    }


    /**
     * Getter for inItems
     */
    get inItems$(): Observable<InventoryInItem[]>
    {
        return this._inItems.asObservable();
    }

    /**
     * Getter for inPagenation
     */
    get inPagination$(): Observable<InPagination>
    {
        return this._inPagination.asObservable();
    }

    /**
     * Getter for showMobile
     */
    get showMobile$(): Observable<boolean>
    {
        return this._showMobile.asObservable();
    }

    /**
     * set Mobile Page
     */
    setShowMobile(value: boolean): void{
        this._showMobile.next(value);
    }



}
