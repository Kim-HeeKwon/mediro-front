export interface Estimate
{
    mId: string;                //회원사
    account: string;            //고객사
    qtNo: string;               //견적번호
    qtLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    itemGrade: string;
    qty: number;
    poReqQty?: number;
    invQty?: number;
    qtPrice: number;
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    qtCreDate: string;          //견적생성일자
    qtDate: string;             //견적일자
    qtAmt: number;              //견적금액
    remarkHeader: string;       //비고
    remarkDetail: string;
    soNo: string;               //주문번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export class EstimateHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    qtNo: string;               //견적번호
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    qtCreDate: string;          //견적생성일자
    qtDate: string;             //견적일자
    qtAmt: number;              //견적금액
    remarkHeader: string;       //비고
    soNo: string;               //주문번호
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

    constructor(email: string = '',soNo: string = '',remarkHeader: string = ''){
        this.email = email;
        this.soNo = soNo;
        this.remarkHeader = remarkHeader;
    }
}


export interface EstimateDetail
{
    no?: number;
    flag?: string;
    qtLineNo: number;
    itemCd: string;
    itemNm: string;
    standard: string;
    unit: string;
    qty: number;
    poReqQty?: number;
    invQty?: number;
    qtPrice: number;
    qtAmt: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface EstimateHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface EstimateDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
