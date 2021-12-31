import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from 'environments/environment';
import {MatDialog} from "@angular/material/dialog";
import {CommonLoadingBarComponent} from "../../components/common-loding-bar/common-loading-bar.component";

/**
 * Api is a generic REST Api handler. Set your API url first.
 */

@Injectable()
export class Api {

    private url: string;
    private urlBill: string;

    constructor(public http: HttpClient,
                public _matDialog: MatDialog,) {
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
            id: 'loding-bar-matdialog'
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
        req.pipe().subscribe(() => {
            loading.close();
        })
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
        //return this.http.put(this.url + '/' + endpoint, body, reqOpts);
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

    apiDelete(endpoint: string, body: any, reqOpts?: any): Observable<any> {

        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0',
            'sessionUserId': localStorage.getItem('id'),
            'mId': localStorage.getItem('mId')
        }];

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
            },params:{
                'ds_json': '[' + JSON.stringify(body) + ']',
                'ds_session' : JSON.stringify(arrayOfArraysData),
            }
        });
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
                },params:{
                    //'ds_json': encodeURI(JSON.stringify(body)),
                    'ds_json': [JSON.stringify(body)],
                    'ds_session' : JSON.stringify(arrayOfArraysData),
                }
            });
    }

    delete(endpoint: string, reqOpts?: any): Observable<any> {
        return this.http.delete(this.url + '/' + endpoint, reqOpts);
    }

    patch(endpoint: string, body: any, reqOpts?: any): Observable<any> {
        return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
    }
}
