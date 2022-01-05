import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {OutboundService} from "../outbound.service";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OutboundDetailResolvers implements Resolve<any> {
    coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _outboundService: OutboundService,
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
                //this._outboundService.getDetail()
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
