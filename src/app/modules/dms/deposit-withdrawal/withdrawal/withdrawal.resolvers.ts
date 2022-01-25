import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {WithdrawalService} from "./withdrawal.service";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WithdrawalResolvers implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _withdrawalService: WithdrawalService,
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
            Promise.all([]).then(
                () => {
                    // @ts-ignore
                    resolve();
                },
                reject
            );
        });
    }
}
