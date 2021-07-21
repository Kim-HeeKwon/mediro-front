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
