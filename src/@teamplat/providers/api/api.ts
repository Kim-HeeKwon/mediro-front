import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, filter, scan, tap} from 'rxjs/operators';
import {environment} from 'environments/environment';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class Api {

    private url: string;
    private appUrl: string;
    private payTestUrl: string;

    constructor(public http: HttpClient) {
        this.url = environment.serverUrl; // 운영: https://fashiony.co.kr/fashionyFw/ 개발 http://117.52.87.40/fashionyFw/
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get(endpoint: string, params?: any, reqOpts?: any) {
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    post(endpoint: string, body: any, reqOpts?: any) {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Mediro',
            'sessionOwnrgCd': 'Mediro',
            'sessionUserIp': '0.0.0.0'
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    postFile(endpoint: string, body: any, reqOpts?: any) {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        let req = this.http.post(this.url + endpoint, body);
        return req;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    postToken(endpoint: string, body: any, reqOpts?: any) {

        if (!reqOpts) {
            reqOpts = {
                params: new HttpParams()
            };
        }
        const arrayOfArraysData = [{
            'sessionDtctCd': 'korea',
            'sessionSupplier': 'Nomadrian',
            'sessionOwnrgCd': 'Nomadrian', // NMDN FW
            'sessionUserIp': '0.0.0.0'
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    put(endpoint: string, body: any, reqOpts?: any) {
        return this.http.put(this.url + '/' + endpoint, body, reqOpts);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    delete(endpoint: string, reqOpts?: any) {
        return this.http.delete(this.url + '/' + endpoint, reqOpts);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    patch(endpoint: string, body: any, reqOpts?: any) {
        return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
    }
}
