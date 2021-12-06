import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Observable} from "rxjs";
import {AcceptableService} from "./acceptable.service";

@Injectable({
    providedIn: 'root'
})
export class AcceptableResolvers implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _acceptableService: AcceptableService,
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
                //this._acceptableService.getHeader()
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
