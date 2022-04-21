export interface BillManagementData
{
    mId: string;
    businessNumber: string;
    businessName: string;
    freeYn: string;
    payYn: string;
    monthPayYn: string;

    suppliedAmt: number;
    vat: number;
    totalAmt: number;

    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface BillManagementPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
