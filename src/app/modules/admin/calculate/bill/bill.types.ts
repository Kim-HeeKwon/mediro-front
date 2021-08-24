export interface Bill
{
    no?: number;
    mId: string;                //회원사
    account: string;
    accountNm: string;
    billing: string;
    lineNo: number;
    toAccount: string;
    toAccountNm: string;
    type: string;
    status: string;
    itemCd: string;
    taxGbn: string;
    billingQty: number;
    billingAmt: number;
    taxAmt: number;
    billingTotalAmt: number;
    invoice?: string;
    billingCreDate: string;
    billingDate: string;
    remark: string;
    delFlag: string;
}


export interface BillPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}


