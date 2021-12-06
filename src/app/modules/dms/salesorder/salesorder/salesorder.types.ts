export interface SalesOrder
{
    mId: string;                //회원사
    account: string;            //거래처
    soNo: string;               //주문번호
    soLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    itemGrade: string;
    reqQty: number;
    qty: number;
    poReqQty?: number;
    invQty?: number;
    unitPrice: number;
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    soCreDate: string;          //주문생성일자
    soDate: string;             //주문일자
    soAmt: number;              //주문금액
    remarkHeader: string;       //비고
    remarkDetail: string;
    obNo: string;               //출고번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export class SalesOrderHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    soNo: string;               //주문번호
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    soCreDate: string;          //주문생성일자
    soDate: string;             //주문일자
    soAmt: number;              //주문금액
    remarkHeader: string;       //비고
    obNo: string;               //출고번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;


    constructor(email: string = '', obNo: string = '',remarkHeader: string = ''){
        this.email = email;
        this.obNo = obNo;
        this.remarkHeader = remarkHeader;
    }
}
export interface SalesOrderDetail
{
    no?: number;
    flag?: string;
    soLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    itemGrade: string;
    reqQty: number;
    qty: number;
    poReqQty?: number;
    invQty?: number;
    unitPrice: number;
    soAmt: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface SalesOrderHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface SalesOrderDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
