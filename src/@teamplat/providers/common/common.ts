import {Injectable} from '@angular/core';
import {Api} from '../api/api';
import {map, share} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class Common {

    constructor(public api: Api) {
    }

    sendData(accountInfo: any, url: string): Observable<any> {
        return this.api.post(url, accountInfo).pipe(share()); // seq;
    }

    sendListData(accountInfo: any, url: string): Observable<any> {
        return this.api.postList(url, accountInfo).pipe(share()); // seq;
    }

    sendListDataObject(info: any, pageParam: any, url: string): Observable<any> {
        return this.api.postObjectList(url, info, pageParam).pipe(share()); // seq;
    }

    sendDataWithPageNation(param: any, pageParam: any,url: string): Observable<any> {
        return this.api.postWithPage(url, param, pageParam).pipe(share()); // seq;
    }

    put(url: string, param: any): Observable<any> {
        return this.api.apiPut(url, param).pipe(share()); // seq;
    }

    listPut(url: string, param: any): Observable<any> {
        return this.api.apiListPut(url, param).pipe(share()); // seq;
    }

    delete(url: string, param: any): Observable<any> {
        return this.api.apiDelete(url, param).pipe(share()); // seq;
    }

    listDelete(url: string, param: any): Observable<any> {
        return this.api.apiListDelete(url, param).pipe(share()); // seq;
    }

    sendFile(accountInfo: any, url: string): Observable<any> {
        return this.api.postFile(url, accountInfo).pipe(share()); // seq;
    }

    // NULL 체크
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
    * NULL 을 ""로 컨버트
    */
    // tslint:disable-next-line:typedef
    gfn_nullConvert(val, str) {
        if ((typeof val == 'number') && (val == 0)) {
            val = String(val);
        }	// number일때 0이면 "0"로 변환

        if (val == null || val == '' || val == undefined || val == 'null' || String(val) == 'NaN') {

            return this.gfn_isNull(str) ? '' : str;
        }
        return val;
    }

    // Trim()이 지원되지 않는 브라우저를 위해 trim() 정규식을 정의.
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
            alert('구분이 지정되지 않았습니다.');
        }
    }

    /*
    * 빈 데이터셋 생성
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
        c = c.substring(8, c.length - 1); // [object ?]의 특성을 이용함

        if (c != 'Object') {
            return c;
        }

        if (c.constructor == 'Object') {
            return c;
        } else {
            let s = x.constructor.toString();
            let i = s.indexOf('(');
            return s.substring(9, i); // function ?( ... 의 특성을 이용함
        }
    }

    // data가 number고 null이면 true리턴
    gfn_numberNull(data) {
        if ((typeof data) == 'number' && isNaN(data) == true) {
            return true;
        }
        return false;
    }

    /*
    * 두 Object 객체 데이터를 비교하는 함수
    *  param (Object 전달받아야함)
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
        const weekName = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)'];

        let datetest = this.gfn_dateParse(param);
        var year = datetest.getFullYear();
        var month = datetest.getMonth() + 1;
        var date = datetest.getDate();
        var dayLabel = weekName[datetest.getDay()];

        return month + '.' + date + ' ' + dayLabel;
    }

    gfn_getDateFormat2(param) {
        const weekName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

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
