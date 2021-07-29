export interface OutBoundDetails
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
    udiYn: string;
    remarkDetail: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}


export interface OutBoundDetailPagenations
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
