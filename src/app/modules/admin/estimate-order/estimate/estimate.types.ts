export interface EstimateHeader
{
    mId: string;                //회원사
    account: string;            //고객사
    qtNo: string;               //견적번호
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    qtCreDate: string;          //견적생성일자
    qtDate: string;             //견적일자
    qtAmt: number;              //견적금액
    remark: string;             //비고
    soNo: string;               //주문번호
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}
export interface EstimateDetail
{
    mId: string;                //회원사
    account: string;            //고객사
    qtNo: string;               //견적번호
    type: string;               //유형
    status: string;             //상태
    email: string;              //이메일
    qtCreDate: string;          //견적생성일자
    qtDate: string;             //견적일자
    qtAmt: number;              //견적금액
    remark: string;             //비고
    soNo: string;               //주문번호
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
