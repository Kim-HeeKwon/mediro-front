import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {SafetyService} from "./safety.service";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SafetyResolvers implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _safetyService: SafetyService,
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
                this._safetyService.getHeader()
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
