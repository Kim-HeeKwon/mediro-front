export interface Acceptable
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    fomlInfo: string;           //모델명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    ibDate?: string;             //입고일자
    validity?: string;          //유효기간
    acceptableType?: string;
    thirty?: number;
    thirtyBysixty?: number;
    sixtyByninety?: number;
    ninety?: number;
    availQty: number;           //보유
}

export interface AcceptableDetail
{
    no?: number;
    mId: string;                //회원사
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    fomlInfo: string;           //모델명
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    acceptableType: string;
    addDate: string;
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


export interface AcceptableDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
