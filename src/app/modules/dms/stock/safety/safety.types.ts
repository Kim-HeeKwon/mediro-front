export interface Safety
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    safetyQty: number;          //안전재고 수량
    availQty: number;           //보유
    poQty: number;              //발주대상수량
}


export interface SafetyPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
