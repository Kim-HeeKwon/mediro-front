export interface Acceptable
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    ibDate?: string;             //입고일자
    validity?: string;          //유효기간
    thirty?: number;
    thirtyBysixty?: number;
    sixtyByninety?: number;
    ninety?: number;
    availQty: number;           //보유
}


export interface AcceptablePagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
