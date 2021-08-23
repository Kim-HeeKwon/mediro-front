export interface InBoundDetails
{
    no?: number;
    flag?: string;
    ibLineNo: number;
    itemCd: string;
    itemNm: string;
    status: string;
    ibExpQty: number;
    qty: number;
    ibQty: number;
    udiYn: string;
    udiCode: string;
    suplyContStdmt?: string;
    suplyTypeCode?: string;
    udiDiSeq?: string;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}


export interface InBoundDetailPagenations
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
