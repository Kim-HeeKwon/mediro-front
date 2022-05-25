export interface ConnectionHistoryData
{
    mId: string;
    businessNumber: string; // 사업자 번호
    businessId: string; // 회원 ID
    connectDay?: string; // 접속 일자
    connectDate?: string; // 접속 날자
    connectTime?: string; // 접속 시간
}
export interface ConnectionHistoryPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
