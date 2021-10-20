import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {StockService} from "../../../stock/stock/stock.service";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {TaxService} from "../tax.service";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TaxDetailResolvers implements Resolve<any> {

    /**
     * Constructor
     */
    constructor(private _taxService: TaxService,
                private _common: Common) {
    }

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {

            Promise.all([
            ]).then(
                () => {
                    // @ts-ignore
                    resolve();
                },
                reject
            );
        });
    }
}
