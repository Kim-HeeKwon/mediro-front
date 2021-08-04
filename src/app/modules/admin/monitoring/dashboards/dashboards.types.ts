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
    sCnt?: number;
    pCnt?: number;
    nCnt?: number;
    fCnt?: number;
    cCnt?: number;
}

export interface ObInfo
{
    cCnt?: number;
    dCnt?: number;
    nCnt?: number;
    pCnt?: number;
    sCnt?: number;
}

export interface QtInfo
{
    sCnt?: number;
    rCnt?: number;
    nCnt?: number;
    cfCnt?: number;
    cCnt?: number;
}

export interface PoInfo
{
    nCnt?: number;
    pCnt?: number;
    psCnt?: number;
    sCnt?: number;
}

export interface SoInfo
{
    sCnt?: number;
    nCnt?: number;
    cCnt?: number;
}
