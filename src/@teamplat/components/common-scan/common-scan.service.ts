import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class CommonScanService{
    private _getList: BehaviorSubject<any> = new BehaviorSubject(null);
    private _status: BehaviorSubject<any> = new BehaviorSubject(null);
    private _msg: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter
     */
    get getList$(): Observable<any>
    {
        return this._getList.asObservable();
    }

    /**
     * Getter
     */
    get getStatus$(): Observable<any>
    {
        return this._status.asObservable();
    }
    /**
     * Getter
     */
    get getMsg$(): Observable<any>
    {
        return this._msg.asObservable();
    }

    setInitList(): void{
        this._getList.next(null);
    }
}
