import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable, Optional} from '@angular/core';
import {Observable, of, Subject, throwError, timer} from 'rxjs';
import {environment} from 'environments/environment';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CommonLoadingBarComponent} from "../../components/common-loding-bar/common-loading-bar.component";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, finalize, takeUntil, takeWhile, tap} from "rxjs/operators";
import {SessionStore} from "../../../app/core/session/state/session.store";
import {FunctionService} from "../../services/function";
import {TeamPlatConfirmationService} from "../../services/confirmation";

/**
 * Api is a generic REST Api handler. Set your API url first.
 */

@Injectable()
export class Api {

    private url: string;
    private urlBill: string;
    private _authenticated: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(public http: HttpClient,
                public _matDialog: MatDialog,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _functionService: FunctionService,
                private _sessionStore: SessionStore,) {
        this.url = environment.serverUrl;
        this.urlBill = environment.serverTaxUrl;
    }

    get(endpoint: string, params?: any, reqOpts?: any): Observable<any> {
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }

        // Support easy query params for GET requests
        if (params) {
            reqOpts.params = new HttpParams();
            for (let k in params) {
                reqOpts.params = reqOpts.params.set(k, params[k]);
            }
        }

        return this.http.get(this.url + '/' + endpoint, reqOpts);
    }

    post(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];

        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });
            //.pipe(catchError(this.handleError('error', this._functionService)));
        //loading.close();

        return req;
    }


    postChgUrl(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post('' + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postList(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postListLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionBusinessName': localStorage.getItem('businessName'),
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            }).pipe(catchError(this.handleError('error', this._functionService)));
        //loading.close();
        return req;
    }

    postListChgUrl(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post('' + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postListChgUrlLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);

        const req = this.http.post('' + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });
        //loading.close();
        return req;
    }

    postObjectList(endpoint: string, body: any, body2: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_pageNation=[' + JSON.stringify(body2) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postObjectListLoading(endpoint: string, body: any, body2: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_pageNation=[' + JSON.stringify(body2) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });


        //loading.close();
        return req;
    }


    postWithExcel(excelType: string, endpoint: string, body: any, body2: any, excelJson: any, reqOpts?: any) {
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'excelType': excelType,
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_pageNation=[' + JSON.stringify(body2) + ']&'
            + 'ds_session=' + JSON.stringify(arrayOfArraysData) + '&'
            + 'ds_excelJson=[' + JSON.stringify(excelJson) + ']'
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postWithPage(endpoint: string, body: any, body2: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_pageNation=[' + JSON.stringify(body2) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postWithPageLoading(endpoint: string, body: any, body2: any, reqOpts?: any): Observable<any> {
        // const freechek = this.freeCheck();
        // if(!freechek){
        //     return of(false);
        // }
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });
        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];

        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_pageNation=[' + JSON.stringify(body2) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });
        this.backLogin(arrayOfArraysData[0].mId);

        return req;
    }

    postWithPageChgUrl(endpoint: string, body: any, body2: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post('' + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_pageNation=[' + JSON.stringify(body2) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR'
                }
            });

        return req;
    }

    postFile(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const req = this.http.post(this.url + endpoint, body);
        return req;
    }

    postToken(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Nomadrian',
            'sessionOwnrgCd': 'Nomadrian', // NMDN FW
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.post(this.url + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }
            });

        return req;
    }

    put(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        return this.http.put(this.url + '/' + endpoint, body, reqOpts);
    }

    apiPut(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        return this.http.put(this.url + '/' + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }
            });
    }

    apiPutLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.put(this.url + '/' + endpoint, 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }
            });
        //loading.close();
        return req;
    }

    apiListPut(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        return this.http.put(this.url + '/' + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }
            });
        //return this.http.put(this.url + '/' + endpoint, body, reqOpts);
    }

    apiListPutLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.put(this.url + '/' + endpoint, 'ds_json=' + JSON.stringify(body) + '&' + 'ds_session=' + JSON.stringify(arrayOfArraysData)
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }
            });
        //loading.close();
        return req;
    }


    apiDelete(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        //this.toBody = 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData))
        return this.http.delete(this.url + '/' + endpoint
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }, params: {
                    'ds_json': '[' + JSON.stringify(body) + ']',
                    'ds_session': JSON.stringify(arrayOfArraysData),
                }
            });
    }

    apiDeleteLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        //this.toBody = 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData))
        const req = this.http.delete(this.url + '/' + endpoint
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }, params: {
                    'ds_json': '[' + JSON.stringify(body) + ']',
                    'ds_session': JSON.stringify(arrayOfArraysData),
                }
            });
        //loading.close();
        return req;
    }

    apiListDelete(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        //this.toBody = 'ds_json=[' + JSON.stringify(body) + ']&' + 'ds_session=' + JSON.stringify(arrayOfArraysData))
        return this.http.delete(this.url + '/' + endpoint
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }, params: {
                    //'ds_json': encodeURI(JSON.stringify(body)),
                    'ds_json': [JSON.stringify(body)],
                    'ds_session': JSON.stringify(arrayOfArraysData),
                }
            });
    }

    apiListDeleteLoading(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        const loading = this._matDialog.open(CommonLoadingBarComponent, {
            id: 'loadingBar'
        });

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];
        this.backLogin(arrayOfArraysData[0].mId);
        const req = this.http.delete(this.url + '/' + endpoint
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Access-Control-Allow-Origin': '*',
                    'Accept': 'application/json, text/plain, */*; q=0.01',
                    'Accept-Language': 'ko-KR',
                    'Authorization': 'Bearer ' + body.accessToken,
                }, params: {
                    //'ds_json': encodeURI(JSON.stringify(body)),
                    'ds_json': [JSON.stringify(body)],
                    'ds_session': JSON.stringify(arrayOfArraysData),
                }
            });

        //loading.close();
        return req;
    }

    delete(endpoint: string, reqOpts?: any): Observable<any> {
        return this.http.delete(this.url + '/' + endpoint, reqOpts);
    }

    patch(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
    }

    backLogin(mbId: any): void {
        if (mbId === null) {
            this.signOut().subscribe(()=> {
                // this._router.navigateByUrl('/signed-in');
                console.log('api 사용');
                window.location.reload();
                this._matDialog.closeAll();
            });
        }
    }

    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('email');
        localStorage.removeItem('mId');
        localStorage.removeItem('id');
        localStorage.removeItem('businessName');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    private handleError<T>(operation = 'error', f?: T, result?: T) {
        return (error: any): Observable<T> => {

            // @ts-ignore
            f.cfn_loadingBarClear();
            // @ts-ignore
            f.cfn_alert('네트워크가 불안정 합니다. <br> 다시 시도하세요.');

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    private freeCheck(): boolean{

        let check = true;

        if(this._sessionStore.getValue().freeYn !== undefined){
            if(this._sessionStore.getValue().freeYn === 'N'){
                check = false;
                const confirmation = this._teamPlatConfirmationService.open({
                    title: '',
                    message: '무료 서비스가 종료 되었습니다. <br> 정기 서비스를 신청해주세요.',
                    actions: {
                        confirm: {
                            show : true,
                            label: '정기 서비스 이동'
                        },
                        cancel : {
                            show : false,
                            label: '닫기'
                        }
                    }
                });
                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this._matDialog.closeAll();
                            this._router.navigateByUrl('/pages/settings');
                            // Show the alert
                        }
                    });
            }
        }
        return check;

    }

}
