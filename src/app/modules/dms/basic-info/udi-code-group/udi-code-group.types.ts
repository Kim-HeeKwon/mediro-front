export interface UdiCodeGroup
{
    mId: string;         //회원아이디
    udiDiCode: string; // udiDiCode
    udiDiCodeGroup: string; // udiDiCodeGroup
    unit: string;        // 단위
    convertedQty: number; // 환산수량
}

export interface UdiCodeGroupPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
