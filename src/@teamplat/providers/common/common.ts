import {Injectable} from '@angular/core';
import {Api} from '../api/api';
import {map, share} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class Common {

    constructor(public api: Api) {
    }

    sendData(accountInfo: any, url: string, loding?: boolean): Observable<any> {
        return this.api.post(url, accountInfo, loding).pipe(share()); // seq;
    }

    sendDataLoading(accountInfo: any, url: string): Observable<any> {
        return this.api.postLoading(url, accountInfo).pipe(share()); // seq;
    }

    sendDataLoadingNoCancel(accountInfo: any, url: string): Observable<any> {
        return this.api.postLoadingNoCancel(url, accountInfo).pipe(share()); // seq;
    }

    sendDataChgUrl(accountInfo: any, url: string): Observable<any> {
        return this.api.postChgUrl(url, accountInfo).pipe(share()); // seq;
    }

    sendListData(accountInfo: any, url: string): Observable<any> {
        return this.api.postList(url, accountInfo).pipe(share()); // seq;
    }

    sendListDataLoading(accountInfo: any, url: string): Observable<any> {
        return this.api.postListLoading(url, accountInfo).pipe(share()); // seq;
    }

    sendListDataChgUrl(accountInfo: any, url: string): Observable<any> {
        return this.api.postListChgUrl(url, accountInfo).pipe(share()); // seq;
    }

    sendListDataChgUrlLoading(accountInfo: any, url: string, invoice?: boolean): Observable<any> {
        return this.api.postListChgUrlLoading(url, accountInfo, invoice).pipe(share()); // seq;
    }

    sendListDataObject(info: any, pageParam: any, url: string): Observable<any> {
        return this.api.postObjectList(url, info, pageParam).pipe(share()); // seq;
    }

    sendListDataObjectLoading(info: any, pageParam: any, url: string): Observable<any> {
        return this.api.postObjectListLoading(url, info, pageParam).pipe(share()); // seq;
    }

    sendDataWithPageNation(param: any, pageParam: any,url: string, stock?: boolean): Observable<any> {
        return this.api.postWithPage(url, param, pageParam, stock).pipe(share()); // seq;
    }
    sendDataWithPageNationReport(param: any, pageParam: any,url: string): Observable<any> {
        return this.api.postWithPageReport(url, param, pageParam).pipe(share()); // seq;
    }

    sendDataWithPageNationLoading(param: any, pageParam: any,url: string): Observable<any> {
        return this.api.postWithPageLoading(url, param, pageParam).pipe(share()); // seq;
    }

    sendDataWithPageNationChgUrl(param: any, pageParam: any,url: string): Observable<any> {
        return this.api.postWithPageChgUrl(url, param, pageParam).pipe(share()); // seq;
    }

    sendDataExcel(param: any, pageParam: any, excelJson: any, url: string, excelType: string): Observable<any> {
        return this.api.postWithExcel(excelType, url, param, pageParam, excelJson).pipe(share()); // seq;
    }

    put(url: string, param: any): Observable<any> {
        return this.api.apiPut(url, param).pipe(share()); // seq;
    }

    putLoading(url: string, param: any): Observable<any> {
        return this.api.apiPutLoading(url, param).pipe(share()); // seq;
    }

    listPut(url: string, param: any): Observable<any> {
        return this.api.apiListPut(url, param).pipe(share()); // seq;
    }

    listPutLoading(url: string, param: any): Observable<any> {
        return this.api.apiListPutLoading(url, param).pipe(share()); // seq;
    }

    delete(url: string, param: any): Observable<any> {
        return this.api.apiDelete(url, param).pipe(share()); // seq;
    }

    deleteLoading(url: string, param: any): Observable<any> {
        return this.api.apiDeleteLoading(url, param).pipe(share()); // seq;
    }

    listDelete(url: string, param: any): Observable<any> {
        return this.api.apiListDelete(url, param).pipe(share()); // seq;
    }

    listDeleteLoading(url: string, param: any): Observable<any> {
        return this.api.apiListDeleteLoading(url, param).pipe(share()); // seq;
    }

    sendFile(accountInfo: any, url: string): Observable<any> {
        return this.api.postFile(url, accountInfo).pipe(share()); // seq;
    }

    // NULL ??????
    // tslint:disable-next-line:typedef
    gfn_isNull(val) {
        // tslint:disable-next-line:triple-equals
        if (val == null || val == '' || val == undefined || val == 'undefined' || val == 'null' || val == {} || val == '{}') {

            if (val == 'null' || val == null) {
                return true;
            }
            if (typeof val == 'object') {
                if (val.length == 0) {
                    return true;
                }
            }
            return true;
        }
        return false;
    }

    /*
    * NULL ??? ""??? ?????????
    */
    // tslint:disable-next-line:typedef
    gfn_nullConvert(val, str) {
        if ((typeof val == 'number') && (val == 0)) {
            val = String(val);
        }	// number?????? 0?????? "0"??? ??????

        if (val == null || val == '' || val == undefined || val == 'null' || String(val) == 'NaN') {

            return this.gfn_isNull(str) ? '' : str;
        }
        return val;
    }

    // Trim()??? ???????????? ?????? ??????????????? ?????? trim() ???????????? ??????.
    // tslint:disable-next-line:typedef
    trim(str) {
        return str.replace(/^\s*|\s*$/g, '');
    }

    // tslint:disable-next-line:typedef
    ltrim(str) {
        return str.replace(/^\s+/, '');
    }

    // tslint:disable-next-line:typedef
    rtrim(str) {
        return str.replace(/\s+$/, '');
    }

    // tslint:disable-next-line:typedef
    gfn_cmmBinding(gubun, value, opt1) {
        if (gubun == 'txt') {
            return {value: value};
        } else if (gubun == 'cb') {
            return {value: value, dataSource: opt1, valueKey: 'cmmcd', textKey: 'cdval'};
        } else if (gubun == 'mask') {
            return {value: value, dataMode: 'rawtext', inputMask: opt1};
        } else if (gubun == 'cal') {
            return {value: value, width: '105px', dateInputFormat: 'yyyy-MM-dd'};
        } else {
            alert('????????? ???????????? ???????????????.');
        }
    }

    /*
    * ??? ???????????? ??????
    */
    // tslint:disable-next-line:typedef
    gfn_createEmptyDataset(strCols) {
        let array = strCols.split(',');
        let ds = {};

        for (let i = 0; i < array.length; i++) {
            let tmp = 'ds.' + array[i] + ' = ko.observable()';
            eval(tmp);
        }

        return ds;
    }

    // tslint:disable-next-line:typedef
    getType(x) {
        if (x == null) {
            return 'null';
        }

        let t = typeof x;
        if (t != 'object') {
            return t;
        }

        let c = Object.prototype.toString.apply(x);
        c = c.substring(8, c.length - 1); // [object ?]??? ????????? ?????????

        if (c != 'Object') {
            return c;
        }

        if (c.constructor == 'Object') {
            return c;
        } else {
            let s = x.constructor.toString();
            let i = s.indexOf('(');
            return s.substring(9, i); // function ?( ... ??? ????????? ?????????
        }
    }

    // data??? number??? null?????? true??????
    gfn_numberNull(data) {
        if ((typeof data) == 'number' && isNaN(data) == true) {
            return true;
        }
        return false;
    }

    /*
    * ??? Object ?????? ???????????? ???????????? ??????
    *  param (Object ??????????????????)
    */
    gfn_compareObject(o1, o2) {
        for (var p in o1) {
            if (o1[p] !== o2[p]) {
                return false;
            }
        }
        for (var p in o2) {
            if (o1[p] !== o2[p]) {
                return false;
            }
        }
        return true;
    }

    // tslint:disable-next-line:typedef
    gfn_createArrayData(param) {
        let dummyArray = [];
        Object.keys(param).length;
        for (let indexI = 0; indexI < Object.keys(param[0]).length; indexI++) {
            dummyArray[indexI] = {'label': param[0][indexI]};
        }
        return dummyArray;
    }

    // tslint:disable-next-line:typedef
    gfn_stringToInt(param) {
        let str_param: string;
        let result_param: number;
        if (typeof (param) == 'string') {
            str_param = param;
            result_param = parseInt(str_param);
        } else {
            result_param = param;
        }
        return result_param;
    }

    gfn_regPasswordType(data) {
        let regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{6,20}/;

        return regex.test(data);
    }

    gfn_parseDate(str) {
        let y = str.substr(0, 4);
        let m = str.substr(4, 2);
        let d = str.substr(6, 2);
        return new Date(y, m - 1, d);
    }

    gfn_getDateFormat() {
        //let datetest = this.gfn_dateParse(param);
        let datetest = new Date();
        var year = datetest.getFullYear().toString();
        var month = (datetest.getMonth() + 1).toString();
        var date = datetest.getDate().toString();

        return year + (month[1] ? month : '0' + month[0]) + (date[1] ? date : '0' + date[0]);
    }

    gfn_getDateFormatParam(param) {

        let str_date = '';
        let datetest = new Date(param);
        var year = datetest.getFullYear().toString();
        var month = (datetest.getMonth() + 1).toString();
        var date = datetest.getDate().toString();

        str_date = year + (month[1] ? month : '0' + month[0]) + (date[1] ? date : '0' + date[0]);

        return str_date;
    }

    gfn_getDateFormatBoth() {
        //let datetest = this.gfn_dateParse(param);
        let dataSet = {
            strStartDate: '',
            strFinishDate: '',
            startDate: '',
            fisnishDate: '',
        };
        let datetest = new Date();
        var year = datetest.getFullYear().toString();
        var month = (datetest.getMonth() + 1).toString();
        var date = datetest.getDate().toString();

        var d = new Date();
        var dayOfMonth = d.getDate();
        d.setDate(dayOfMonth - 7);
        var bfYear = d.getFullYear().toString();
        var bfMonth = (d.getMonth() + 1).toString();
        var bfDate = d.getDate().toString();

        dataSet.strFinishDate = year + (month[1] ? month : '0' + month[0]) + (date[1] ? date : '0' + date[0]);
        dataSet.fisnishDate = year + ((datetest.getMonth()).toString()) + (date);
        dataSet.strStartDate = bfYear + (bfMonth[1] ? bfMonth : '0' + bfMonth[0]) + (bfDate[1] ? bfDate : '0' + bfDate[0]);
        dataSet.startDate = bfYear + ((d.getMonth()).toString()) + (bfDate);

        return dataSet;
    }

    gfn_getDateFormat1(param) {
        const weekName = ['(???)', '(???)', '(???)', '(???)', '(???)', '(???)', '(???)'];

        let datetest = this.gfn_dateParse(param);
        var year = datetest.getFullYear();
        var month = datetest.getMonth() + 1;
        var date = datetest.getDate();
        var dayLabel = weekName[datetest.getDay()];

        return month + '.' + date + ' ' + dayLabel;
    }

    gfn_getDateFormat2(param) {
        const weekName = ['?????????', '?????????', '?????????', '?????????', '?????????', '?????????', '?????????'];

        let datetest = this.gfn_dateParse(param);
        var year = datetest.getFullYear();
        var month = datetest.getMonth() + 1;
        var date = datetest.getDate();
        var dayLabel = weekName[datetest.getDay()];

        return month + '.' + date + ' ' + dayLabel;
    }

    gfn_dateParse(str) {

        let num = str.toString();
        let y = num.substr(0, 4);
        let m = num.substr(4, 2);
        let d = num.substr(6, 2);

        return new Date(y, m - 1, d);
    }
}
