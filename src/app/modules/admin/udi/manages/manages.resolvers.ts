import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Common} from '@teamplat/providers/common/common';
import {Observable} from 'rxjs';
import {ManagesService} from './manages.service';

@Injectable({
    providedIn: 'root'
})
export class ManagesResolvers implements Resolve<any> {
    coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _managesService: ManagesService,
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
                //this._managesService.getHeader()
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
