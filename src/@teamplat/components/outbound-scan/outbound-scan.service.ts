import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Manages, OutBoundDetails} from "./outbound-scan.types";
import {map, switchMap, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class OutboundScanService{
    private _outBoundDetails: BehaviorSubject<OutBoundDetails[]> = new BehaviorSubject(null);
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
            switchMap(products => this._common.sendListDataObjectLoading(manages, pageParam, 'v1/api/udi/udiDi-product/info').pipe(
                map((result) => {
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
