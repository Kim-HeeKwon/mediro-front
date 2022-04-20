export interface InvoiceHeader
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    accountNm: string;            //거래처
    invoice: string;
    toAccount: string;
    toAccountNm: string;
    type: string;
    status: string;
    taxBillNo: string;
    taxBillStatus: string;
    taxBillRtn: string;
    bisNo: string;
    toBisNo: string;
    invoiceCreDate: string;
    invoiceDate: string;
    totalAmt: number;
    supplyAmt: number;
    taxAmt: number;
    writeDate: string;
    issueType: string;
    taxType: string;
    chargeDirection: string;
    purposeType: string;
    smsYn: string;
    faxYn: string;
    serialNum: string;
    remark: string;
    popBillId: string;

}

export interface InvoiceHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InvoiceDetail
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    invoice: string;
    lineNo: number;
    toAccount: string;
    billing: string;
    purchaseDate: string;
    itemCd: string;
    itemNm: string;
    standard: string;
    qty: number;
    unitPrice: number;
    amt: number;
    remark: string;
}

export interface InvoiceDetailPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
