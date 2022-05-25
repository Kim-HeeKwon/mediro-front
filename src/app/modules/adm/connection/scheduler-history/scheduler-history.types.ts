export interface SchedulerHistoryData
{
    mId: string;
    schedulerNo: number; // 작업 번호
    schedulerName: string; // 작업명
    schedulerDay: string; // 작업 일자
    schedulerDate: string; // 작업 날자
    schedulerTime: string; // 작업 시간
}
export interface SchedulerHistoryPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
