import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {ReportBoundService} from "./report-bound.service";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ReportBoundResolvers implements Resolve<any> {

    /**
     * Constructor
     */
    constructor(private _reportBoundService: ReportBoundService,
                private _common: Common) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        return new Promise((resolve, reject) => {

            Promise.all([
                //this._outboundService.getHeader()
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
