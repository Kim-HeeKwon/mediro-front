import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {Manages} from "./manages-new.types";

@Injectable({
    providedIn: 'root'
})
export class ManagesNewService {

    private _manages: BehaviorSubject<Manages[]> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }
    /**
     * Getter for headers
     */
    get manages$(): Observable<Manages[]>
    {
        return this._manages.asObservable();
    }
    /**
     * Create
     */
    getUdiDiCodeInfo(manages: Manages): Observable<Manages>
    {

        const pageParam = {
            page: 0,
            size: 100,
        };

        return this.manages$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataObject(manages, pageParam, 'v1/api/udi/udiDi-product/info').pipe(
                map((result) => {
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    createSupplyInfo(manages: Manages[]): Observable<{manages: Manages[]}> {

        return this._common.sendListData(manages, 'v1/api/udi/supply-info').pipe(
            switchMap((response: any) => of(response))
        );
    }
}
