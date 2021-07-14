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
    obCreDate: string;          //견적생성일자
    obDate: string;             //견적일자
    remarkHeader: string;       //비고
    obLineNo: number;
    itemCd: string;
    itemNm: string;
    obExpQty: number;
    qty: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export interface OutHeader
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
    obCreDate: string;          //견적생성일자
    obDate: string;             //견적일자
    remarkHeader: string;       //비고
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface OutDetail
{
    no?: number;
    flag?: string;
    obLineNo: number;
    itemCd: string;
    itemNm: string;
    status: string;
    obExpQty: number;
    qty: number;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface OutHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
export interface OutDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
