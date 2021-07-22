export interface Validity
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    lot2?: string;              //유효기간일자
    validity?: string;          //유효기간
    qty: number;                //현재고
    availQty: number;           //가용재고
}


export interface ValidityPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}


