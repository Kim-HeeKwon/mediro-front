import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Common} from '@teamplat/providers/common/common';
import {Observable} from 'rxjs';
import {DashboardsService} from './dashboards.service';


@Injectable({
    providedIn: 'root'
})
export class DashboardsResolvers implements Resolve<any> {
    coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _dashboardsService: DashboardsService,
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
                //this._dashboardsService.getRecallItem()
                this._dashboardsService.getDashboardInfo1(),
                //this._dashboardsService.getDashboardInfo2()
                this._dashboardsService.getDashboardBill(),
                this._dashboardsService.getDashboardUdi(),
                this._dashboardsService.getDashboardStock(),
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
