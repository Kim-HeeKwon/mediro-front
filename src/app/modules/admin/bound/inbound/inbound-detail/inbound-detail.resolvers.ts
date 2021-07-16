import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {InboundService} from "../inbound.service";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class InboundDetailResolvers implements Resolve<any> {
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
                //this._inboundService.getDetail()
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
