export interface UdiModels
{
    mId: string;                //회원사
    itemCd: string;
    modelName: string;
    itemName: string;
    permitItemNo: string;
    permitDate: string;
    grade: string;
    udidiCount: number;
    meddevItemSeq: string;
    isForExport: string;
    seq: string;
    cobFlagCode: string;
    totalCnt: number;             // 총 객수
}

export interface UdiModelsPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
