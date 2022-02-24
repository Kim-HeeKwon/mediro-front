export interface Order
{
    mId: string;                //회원사
    account: string;            //거래처
    poNo: string;               //발주번호
    poLineNo: number;
    itemCd: string;
    itemNm: string;
    refItemNm?: string;
    standard: string;
    unit: string;
    itemGrade: string;
    reqQty: number;
    qty: number;
    poQty: number;
    poReqQty?: number;
    invQty?: number;
    unitPrice: number;
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    cellPhoneNumber: string;    //휴대전화
    poCreDate: string;          //발주생성일자
    poDate: string;             //발주일자
    deliveryDate?: string;          //납기일자
    poAmt: number;              //발주금액
    remarkHeader: string;       //비고
    remarkDetail: string;
    ibNo?: string;
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
    cellPhoneNumber: string;    //휴대전화
    poCreDate: string;          //발주생성일자
    poDate: string;             //발주일자
    poAmt: number;              //발주금액
    remarkHeader: string;       //비고
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;

    toAccountNm?: string;
    deliveryDate?: string;
    custBusinessNumber?: string;// 사업자 등록번호
    custBusinessName?: string;//상호
    representName?: string;//성명
    address?: string;//주소
    businessCondition?: string;// 업태
    businessCategory?: string;// 종목
    phoneNumber?: string;// 전화번호
    fax?: string;// 팩스번호
    ibNo: string;               //입고번호

    constructor(email: string = '',ibNo: string = '', remarkHeader: string = ''){
        this.email = email;
        this.remarkHeader = remarkHeader;
        this.ibNo = ibNo;
    }
}
export interface OrderDetail
{
    no?: number;
    flag?: string;
    poLineNo: number;
    itemCd: string;
    itemNm: string;
    refItemNm?: string;
    standard: string;
    unit: string;
    itemGrade: string;
    reqQty: number;
    qty: number;
    poQty: number;
    poReqQty?: number;
    invQty?: number;
    unitPrice: number;
    poAmt: number;
    remarkDetail: string;
    reportRemerk?: string;
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
