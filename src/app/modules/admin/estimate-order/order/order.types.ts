export interface Order
{
    mId: string;                //회원사
    account: string;            //거래처
    poNo: string;               //발주번호
    poLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    reqQty: number;
    qty: number;
    unitPrice: number;
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    poCreDate: string;          //발주생성일자
    poDate: string;             //발주일자
    poAmt: number;              //발주금액
    remarkHeader: string;       //비고
    remarkDetail: string;
    ibNo: string;               //입고번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export class OrderHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    poNo: string;               //발주번호
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    poCreDate: string;          //발주생성일자
    poDate: string;             //발주일자
    poAmt: number;              //발주금액
    remarkHeader: string;       //비고
    ibNo: string;               //입고번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;


    constructor(email: string = '',ibNo: string = '',remarkHeader: string = ''){
        this.email = email;
        this.ibNo = ibNo;
        this.remarkHeader = remarkHeader;
    }
}
export interface OrderDetail
{
    no?: number;
    flag?: string;
    poLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    reqQty: number;
    qty: number;
    unitPrice: number;
    poAmt: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface OrderHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface OrderDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
