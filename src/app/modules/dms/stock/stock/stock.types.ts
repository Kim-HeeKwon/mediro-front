export interface Stock
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    standard: string;           //규격
    unit: string;               //단위
    itemGrade: string;          //품목등급
    poQty: number;
    availQty: number;
    acceptableQty: number;
    unusedQty: number;
    safetyQty: number;
    longtermQty: number;
    longterm: string;
}
export interface StockHistory
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    chgType: string;
    chgReason: string;
    qty: string;
    creDate: string;
    creUser: string;
}

export interface StockPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface StockHistoryPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface StockAdj
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    qty: number;
    adjType: string;
}



