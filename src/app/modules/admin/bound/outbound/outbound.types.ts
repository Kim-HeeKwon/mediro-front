export interface OutBound
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    obNo: string;               //출고번호
    type: string;               //유형
    status: string;             //상태
    address: string;            //주소
    dlvAccount: string;         //배송처
    dlvAddress: string;         //배송처 주소
    dlvDate: string;            //일자
    obCreDate: string;          //출고생성일자
    obDate: string;             //출고일자
    remarkHeader: string;       //비고
    obLineNo: number;
    itemCd: string;
    itemNm: string;
    obExpQty: number;
    qty: number;
    obQty: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export interface OutBoundHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    obNo: string;               //출고번호
    type: string;               //유형
    status: string;             //상태
    address: string;            //주소
    dlvAccount: string;         //배송처
    dlvAddress: string;         //배송처 주소
    dlvDate: string;            //일자
    obCreDate: string;          //출고생성일자
    obDate: string;             //출고일자
    remarkHeader: string;       //비고
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface OutBoundDetail
{
    no?: number;
    flag?: string;
    obLineNo: number;
    itemCd: string;
    itemNm: string;
    status: string;
    obExpQty: number;
    qty: number;
    obQty: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface OutBoundHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
export interface OutBoundDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
