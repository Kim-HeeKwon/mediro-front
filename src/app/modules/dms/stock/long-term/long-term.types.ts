export interface LongTerm{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    lot1?: string;              //입고일자
    retentionPeriod?: string;   //보유기간
    averageHolding?: string;    //평균보유
    longTermType?: string;      //유형
    longTermStatus?: string;      //상태
    qty: number;                //현재고
    availQty: number;           //가용재고
}
export interface LongTermPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
