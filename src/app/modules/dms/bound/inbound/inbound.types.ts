export interface InBound
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    ibNo: string;               //입고번호
    type: string;               //유형
    status: string;             //상태
    supplier: string;           //공급사
    supplierNm: string;         //공급사명
    ibCreDate: string;          //입고생성일자
    ibDate: string;             //입고일자
    remarkHeader: string;       //비고
    ibLineNo: number;           //입고라인번호
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    refItemNm?: string;
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    ibExpQty: number;           //입고예정수량
    qty: number;                //수량
    ibQty: number;              //입고수량
    unitPrice: number;          //단가
    ibAmt?: number;           //금액
    totalAmt: number;           //금액
    udiYn: string;
    lot1: string;               //입고일자
    lot2: string;               //유효기간
    lot3: string;               //제조사 lot
    lot4: string;               //UDI 번호
    lot5: string;
    lot6: string;
    lot7: string;
    lot8: string;
    lot9: string;
    lot10: string;
    remarkDetail: string;
    poNo: string;
    poLineNo: number;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export interface InBoundHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    ibNo: string;               //입고번호
    type: string;               //유형
    status: string;             //상태
    supplier: string;           //공급사
    supplierNm: string;         //공급사명
    ibCreDate: string;          //입고생성일자
    ibDate: string;             //입고일자
    remarkHeader: string;       //비고
    poNo: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface InBoundDetail
{
    no?: number;
    flag?: string;
    ibLineNo: number;           //입고라인번호
    itemCd: string;             //품목코드
    itemNm: string;             //품목명
    refItemNm?: string;
    itemGrade: string;          //품목등급
    standard: string;           //규격
    unit: string;               //단위
    ibExpQty: number;           //입고예정수량
    qty: number;                //수량
    ibQty: number;              //입고수량
    unitPrice: number;          //단가
    totalAmt: number;           //금액
    udiYn: string;
    udiCode?: string;
    suplyContStdmt?: string;
    suplyTypeCode?: string;
    udiDiSeq?: string;
    lot1: string;               //입고일자
    lot2: string;               //유효기간
    lot3: string;               //제조사 lot
    lot4: string;               //UDI 번호
    lot5: string;
    lot6: string;
    lot7: string;
    lot8: string;
    lot9: string;
    lot10: string;
    remarkDetail: string;
    poNo: string;
    poLineNo: number;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface InBoundHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
export interface InBoundDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
