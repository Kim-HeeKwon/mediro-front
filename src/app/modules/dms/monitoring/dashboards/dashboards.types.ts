export interface RecallItem
{
    itemName?: string;         //상품명
    companyName?: string;      //회사명
    recallReason?: string;     //회수이유
    imgPath?: string;          //이미지 Url
    path?: string;             //redirect Url
    totalCnt?: number;         //totalCnt
}

export interface DashboardsPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface DashboardInfo1
{
    type: string;
    typeName: string;
    totalCnt: number;
    subCd: string;
    descr: string;
}

export interface IbInfo
{
    nCnt?: number;
    cCnt?: number;
    pCnt?: number;
    sCnt?: number;
    pcCnt?: number;
    scCnt?: number;
}

export interface ObInfo
{
    nCnt?: number;
    cCnt?: number;
    pCnt?: number;
    sCnt?: number;
    pcCnt?: number;
    scCnt?: number;
}

export interface QtInfo
{
    nCnt?: number;
    cCnt?: number;
    sCnt?: number;
    rsCnt?: number;
    cfaCnt?: number;
    cfCnt?: number;
}

export interface PoInfo
{
    nCnt?: number;
    cCnt?: number;
    sCnt?: number;
    pCnt?: number;
    cfaCnt?: number;
    cfCnt?: number;
}

export interface SoInfo
{
    sCnt?: number;
    nCnt?: number;
    cCnt?: number;
}

export interface BillInfo
{
    totalCnt?: number;
    invoiceCnt?: number;
}
