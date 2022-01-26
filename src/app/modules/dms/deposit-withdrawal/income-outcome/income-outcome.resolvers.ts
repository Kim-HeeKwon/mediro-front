import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";
import {IncomeOutcomeService} from "./income-outcome.service";

@Injectable({
    providedIn: 'root'
})
export class IncomeOutcomeResolvers implements Resolve<any> {

    /**
     * Constructor
     */
    constructor(private _incomeOutcomeService: IncomeOutcomeService,
                private _common: Common
    ) {
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
