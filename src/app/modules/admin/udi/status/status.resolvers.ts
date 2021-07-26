import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {StatusService} from './status.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StatusResolvers implements Resolve<any> {
    coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _statusService: StatusService,
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
                this._statusService.getHeader()
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
