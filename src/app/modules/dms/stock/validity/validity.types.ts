export interface Validity
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    lot1?: string;              //입고일자
    lot2?: string;              //유효기간
    retentionPeriod?: string;   //보유기간
    averageHolding?: string;    //평균보유
    imminentType?: string;      //임박유형
    imminentStatus?: string;      //임박상태
    imminentPeriod?: string;      //임박기간
    validity?: string;          //유효기간(계산)
    validityType?: string;
    qty: number;                //현재고
    availQty: number;           //가용재고
}

export interface ValidityDetail
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    validityType?: string;
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


export interface ValidityDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

