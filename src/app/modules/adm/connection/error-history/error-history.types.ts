export interface ErrorHistoryData
{
    mId: string;
    errorCode: string; // 에러 코드
    errorName: string; // 에러명
    errorMessage: string; // 에러 메시지
    errorResult: string; // 결과
}
export interface ErrorHistoryPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
