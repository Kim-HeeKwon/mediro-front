import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {TaxService} from "./tax.service";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TaxResolvers implements Resolve<any> {

    coinChartWidget: any[];
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
                //this._taxService.getHeader()
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
