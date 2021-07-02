import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../../@teamplat/providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class PopupService{
    private _getList: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    getDynamicSql(page: number = 0, size: number = 10, sort: string = '', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<any>{
        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendData(search, 'v1/api/common/popup/module-query')
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._getList.next(response.data);
                        resolve(this._getList);
                    }
                }, reject);
        });
    }

    /**
     * Getter
     */
    get getList$(): Observable<any>
    {
        return this._getList.asObservable();
    }
}
