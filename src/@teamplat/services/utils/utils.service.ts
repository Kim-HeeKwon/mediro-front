import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class FuseUtilsService {
    /**
     * Constructor
     */
    constructor() {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = true".
     */
    get exactMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'exact'
        };
    }

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = false".
     */
    get subsetMatchOptions(): IsActiveMatchOptions {
        return {
            paths: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
            queryParams: 'subset'
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generates a random id
     *
     * @param length
     */
    randomId(length: number = 10): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';

        for (let i = 0; i < 10; i++) {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return name;
    }

    /**
     * Generates a random id
     *
     * @param commonCode
     */
    commonValue(commonCode: any[], value: string): any  // CommonCode[]
    {
        const commonValues: CommonCode[] = [];

        const childValues = commonCode.filter((item: any) => item.mainCd === value).map((param: any) => {
            return param.child;
        });

        childValues[0].forEach((param1: any) => {
            const commonValue: CommonCode = {
                id: param1.subCd,
                name: param1.descr,
                udf1: param1.udf1,
                udf2: param1.udf2,
                udf3: param1.udf3,
                udf4: param1.udf4,
                udf5: param1.udf5,
            };
            commonValues.push(commonValue);
        });
        return commonValues;
    }

    /**
     * Generates a random id (???????????????)
     *
     * @param commonCode
     */
    commonValueFilter(commonCode: any[], value: string, filterList: string[]): any  // CommonCode[]
    {
        let commonValues: CommonCode[] = [];

        const childValues = commonCode.filter((item: any) => item.mainCd === value).map((param: any) => {
            return param.child;
        });
        childValues[0].forEach((param1: any) => {
            const commonValue: CommonCode = {
                id: param1.subCd,
                name: param1.descr,
                udf1: param1.udf1,
                udf2: param1.udf2,
                udf3: param1.udf3,
                udf4: param1.udf4,
                udf5: param1.udf5,
            };
            commonValues.push(commonValue);
        });

        // @ts-ignore
        const finalValue: [] = [];
        for(let f=0; f<filterList.length; f++){
            commonValues = commonValues.filter((item: any) => item.id !== filterList[f]).map((param: any) => {
                return param;
            });
        }
        return commonValues;
    }

    /**
     * Generates a random id (???????????????)
     *
     * @param commonCode
     */
    commonValueSearchFilter(commonCode: any[], value: string, filterList: string[]): any  // CommonCode[]
    {
        let commonValues: CommonCode[] = [];

        const childValues = commonCode.filter((item: any) => item.mainCd === value).map((param: any) => {
            return param.child;
        });
        childValues[0].forEach((param1: any) => {
            const commonValue: CommonCode = {
                id: param1.subCd,
                name: param1.descr,
                udf1: param1.udf1,
                udf2: param1.udf2,
                udf3: param1.udf3,
                udf4: param1.udf4,
                udf5: param1.udf5,
            };
            commonValues.push(commonValue);
        });

        // @ts-ignore
        const finalValue: [] = [];
        for(let f=0; f<filterList.length; f++){
            commonValues = commonValues.filter((item: any) => item.id !== filterList[f]).map((param: any) => {
                return param;
            });
        }
        return commonValues;
    }

    /**
     * Generates a random id
     *
     * @param commonPopup
     */
    commonPopupValue(commonPopup: any[], value: string): any // CommonPopup[]
    {
        const commonValues: CommonPopup[] = [];

        const childValues = commonPopup.filter((item: any) => item.extPopupNo === value).map((param: any) => {
            return param.child;
        });

        childValues[0].forEach((param: any) => {
            const commonValue: CommonPopup = {
                extPopupNo: param.extPopupNo,              //????????????
                extColId: param.extColId,               //??????ID
                extColNm: param.extColNm,                //?????????
                extUseYn: param.extUseYn,                //????????????
                extColExPosYn: param.extColExPosYn,           //??????????????????
                extColWidVal: param.extColWidVal,            //???????????????
                extColLineOrdmadVal: param.extColLineOrdmadVal,     //??????????????????
                extColSortSeqVal: param.extColSortSeqVal,        //?????????????????????
                extColCondGbnVal: param.extColCondGbnVal,        //?????????????????????
                extColQrySortSeqVal: param.extColQrySortSeqVal,     //???????????????????????????
                extColDispTypVal: param.extColDispTypVal,        //?????????????????????
                extColFmtVal: param.extColFmtVal,            //???????????????
                extSelBoxAttrVal: param.extSelBoxAttrVal,        //?????????????????????
                extEtcQryColGbnVal: param.extEtcQryColGbnVal,     //???????????????????????????
                extEtcQryColCondVal: param.extEtcQryColCondVal     //???????????????????????????
            };
            commonValues.push(commonValue);
        });

        return commonValues;
    }

}

export interface CommonCode
{
    id: string;         //ID
    name: string;       //NAME
    udf1?: string;       //
    udf2?: string;       //
    udf3?: string;       //
    udf4?: string;       //
    udf5?: string;       //
}

export interface CommonCodeProcess
{
    id: string;         //ID
    name: string;       //NAME
    count: number;
    color: boolean;
}

export interface CommonPopup
{
    extPopupNo: string;              //????????????
    extColId: string;                //??????ID
    extColNm: string;                //?????????
    extUseYn: string;                //????????????
    extColExPosYn: string;           //??????????????????
    extColWidVal: string;            //???????????????
    extColLineOrdmadVal: string;     //??????????????????
    extColSortSeqVal: string;        //?????????????????????
    extColCondGbnVal: string;        //?????????????????????
    extColQrySortSeqVal: string;     //???????????????????????????
    extColDispTypVal: string;        //?????????????????????
    extColFmtVal: string;            //???????????????
    extSelBoxAttrVal: string;        //?????????????????????
    extEtcQryColGbnVal: string;      //???????????????????????????
    extEtcQryColCondVal: string;     //???????????????????????????
}
