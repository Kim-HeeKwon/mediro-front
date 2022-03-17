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
                name: param1.descr
            };
            commonValues.push(commonValue);
        });
        return commonValues;
    }

    /**
     * Generates a random id (밸리데이션)
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
                name: param1.descr
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
     * Generates a random id (밸리데이션)
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
                name: param1.descr
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
                extPopupNo: param.extPopupNo,              //팝업번호
                extColId: param.extColId,               //컬럼ID
                extColNm: param.extColNm,                //컬럼명
                extUseYn: param.extUseYn,                //사용여부
                extColExPosYn: param.extColExPosYn,           //컬럼노출여부
                extColWidVal: param.extColWidVal,            //컬럼가로값
                extColLineOrdmadVal: param.extColLineOrdmadVal,     //컬럼줄맞춤값
                extColSortSeqVal: param.extColSortSeqVal,        //컬럼정렬순서값
                extColCondGbnVal: param.extColCondGbnVal,        //컬럼조건구분값
                extColQrySortSeqVal: param.extColQrySortSeqVal,     //컬럼조회정렬순서값
                extColDispTypVal: param.extColDispTypVal,        //컬럼전시유형값
                extColFmtVal: param.extColFmtVal,            //컬럼포맷값
                extSelBoxAttrVal: param.extSelBoxAttrVal,        //선택박스속성값
                extEtcQryColGbnVal: param.extEtcQryColGbnVal,     //기타조회컬럼구분값
                extEtcQryColCondVal: param.extEtcQryColCondVal     //기타조회컬럼조건값
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
    extPopupNo: string;              //팝업번호
    extColId: string;                //컬럼ID
    extColNm: string;                //컬럼명
    extUseYn: string;                //사용여부
    extColExPosYn: string;           //컬럼노출여부
    extColWidVal: string;            //컬럼가로값
    extColLineOrdmadVal: string;     //컬럼줄맞춤값
    extColSortSeqVal: string;        //컬럼정렬순서값
    extColCondGbnVal: string;        //컬럼조건구분값
    extColQrySortSeqVal: string;     //컬럼조회정렬순서값
    extColDispTypVal: string;        //컬럼전시유형값
    extColFmtVal: string;            //컬럼포맷값
    extSelBoxAttrVal: string;        //선택박스속성값
    extEtcQryColGbnVal: string;      //기타조회컬럼구분값
    extEtcQryColCondVal: string;     //기타조회컬럼조건값
}
