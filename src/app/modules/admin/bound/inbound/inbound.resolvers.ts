import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {AccountService} from "../../basic-info/account/account.service";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {InboundService} from "./inbound.service";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class InboundResolver implements Resolve<any> {
    coinChartWidget: any[];
    /**
     * Constructor
     */
    constructor(private _inboundService: InboundService,
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
                this._inboundService.getHeader()
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
