import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import { InitialData } from 'app/app.types';
import { Api } from '../@teamplat/providers/api/api';
import { CodeStore } from './core/common-code/state/code.store';
import { PopupStore } from './core/common-popup/state/popup.store';
import {SessionStore} from "./core/session/state/session.store";

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InitialData>
    {
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._httpClient.get<any>('api/common/messages'),
            this._httpClient.get<any>('api/common/navigation'),
            this._httpClient.get<any>('api/common/notifications'),
            this._httpClient.get<any>('api/common/shortcuts'),
            this._httpClient.get<any>('api/common/user'),
        ]).pipe(
            map(([messages, navigation, notifications, shortcuts, user]) => ({
                    messages,
                    navigation: {
                        compact   : navigation.compact,
                        default   : navigation.default,
                        futuristic: navigation.futuristic,
                        horizontal: navigation.horizontal
                    },
                    notifications,
                    shortcuts,
                    user,
                })
            )
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class InitialCommonCodeDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _api: Api,
                private _codeStore: CodeStore)
    {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {

        return this.commonCodeFunction();
    }

    commonCodeFunction(): Observable<any>{
        return this._api.post('/v1/api/common/code/commonCode-list', '').pipe(
            switchMap((response: any) => {
                if (response.status !== 'SUCCESS'){
                    return throwError(response.message);
                }
                const commonCodeData = {
                    data : response.data
                };
                this._codeStore.update(commonCodeData);

                return of(response);
            })
        );
    }

}

@Injectable({
    providedIn: 'root'
})
export class InitialCommonPopupDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _api: Api,
                private _popupStore: PopupStore)
    {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this.commonPopupFunction();
    }

    commonPopupFunction(): Observable<any>{
        return this._api.post('/v1/api/common/popup/module-column', '').pipe(
            switchMap((response: any) => {
                if (response.status !== 'SUCCESS'){
                    return throwError(response.message);
                }
                const commonPopupData = {
                    data : response.data
                };
                this._popupStore.update(commonPopupData);

                return of(response);
            })
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class InitialSysConfigDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _api: Api)
    {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        const rtn = this.sysConfigFunction();

        rtn.toPromise().then((ex) => {

            const orgversion = localStorage.getItem('vesion');

            if(orgversion !== ex.data.VAL){
                window.location.reload();
                localStorage.setItem('vesion', ex.data.VAL);
            }
        });
        return rtn;
    }

    sysConfigFunction(): Observable<any>{
        return this._api.post('/v1/api/common/sys-config/version', '').pipe(
            switchMap((response: any) => {
                //console.log(response);
                if (response.status !== 'SUCCESS'){
                    return throwError(response.message);
                }

                return of(response);
            })
        );
    }
}
