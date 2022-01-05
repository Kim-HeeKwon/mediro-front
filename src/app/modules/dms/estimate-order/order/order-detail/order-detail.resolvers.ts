import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {OrderService} from "../order.service";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OrderDetailResolvers implements Resolve<any> {
    coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _orderService: OrderService,
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
                //this._orderService.getDetail()
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
