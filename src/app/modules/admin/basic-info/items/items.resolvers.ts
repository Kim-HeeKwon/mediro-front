import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {ItemsService} from './items.service';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ItemsResolver implements Resolve<any> {
    // coinChartWidget: any[];

    /**
     * Constructor
     */
    constructor(private _itemsService: ItemsService,
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

            Promise.all([]).then(
                () => {
                    console.log('resolver start!!');
                    this._itemsService.getItems();
                    // @ts-ignore
                    resolve();
                },
                reject
            );
        });
    }
}
