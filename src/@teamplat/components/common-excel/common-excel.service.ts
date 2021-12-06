import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {PopupPagenation} from "../common-popup-items/common-popup-items.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {map, switchMap, take} from "rxjs/operators";
import {Estimate} from "../../../app/modules/dms/estimate-order/estimate/estimate.types";

@Injectable({
    providedIn: 'root'
})
export class CommonExcelService{

    private _rtnList: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common) {
    }
    /**
     * Getter
     */
    get rtnList$(): Observable<any[]>
    {
        return this._rtnList.asObservable();
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    getExcelTransaction(excelJson, excelType, isProgressSpinner):
        Promise<any>{

        const searchParam = {};
        searchParam['order'] = '';
        searchParam['sort'] = '';

        const pageParam = {
            page: 1,
            size: 10,
        };
        // @ts-ignore
        // return this.rtnList$.pipe(
        //     take(1),
        //     switchMap(products => this._common.sendDataExcel(searchParam, pageParam, excelJson, 'v1/api/common/excel/upload', excelType).pipe(
        //         map((result) => {
        //             if(result.status === 'SUCCESS'){
        //                 console.log(result);
        //             }
        //             // Return the new product
        //             return result;
        //         })
        //     ))
        // );
        return new Promise((resolve, reject) => {
            this._common.sendDataExcel(searchParam, pageParam, excelJson, 'v1/api/common/excel/upload', excelType)
                .subscribe((response: any) => {
                    if(response.status === 'SUCCESS'){
                        this._rtnList.next(response);
                        return response;
                    }
                }, reject);



        });
    }

    /**
     * Create
     */
    dataUpload(data: any): Observable<any>
    {
        return this.rtnList$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(data, 'v1/api/common/excel/dataUpload').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
