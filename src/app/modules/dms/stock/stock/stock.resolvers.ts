import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {StockService} from './stock.service';
import {Observable} from 'rxjs';
import {Common} from '../../../../../@teamplat/providers/common/common';

@Injectable({
    providedIn: 'root'
})
export class StockResolvers implements Resolve<any> {
    /*coinChartWidget: any[];*/

    /**
     * Constructor
     */
    constructor(private _stockService: StockService,
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
                //this._stockService.getHeader()
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
