import {Manages} from "../../../../../../@teamplat/components/outbound-scan/outbound-scan.types";
import {BehaviorSubject, Observable} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {ManagesPackage} from "./manages-package.types";

@Injectable({
    providedIn: 'root'
})
export class ManagesPackageService {
    private _manages: BehaviorSubject<ManagesPackage[]> = new BehaviorSubject(null);

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
    getUdiDiCodeInfo(manages: ManagesPackage): Observable<ManagesPackage> {

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
