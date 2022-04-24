export interface ItemPrice
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    accountNm: string;          //거래처명
    itemCd: string;             //품목코드
    refItemNm?: string;
    itemNm: string;             //품목명
    fomlInfo?: string;             //모델명
    standard: string;           //규격
    unit: string;               //단위
    itemGrade: string;          //품목등급
    type: string;               //유형
    unitPrice: number;          //단가
    effectiveDate?: string;     //적용일자
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface ItemPriceHistory
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    accountNm: string;          //거래처명
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    fomlInfo: string;             //모델명
    type: string;               //유형
    unitPrice: number;          //단가
    effectiveDate?: string;     //적용일자
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}


export interface ItemPricePagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
export interface ItemPriceHistoryPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}


