export interface CommonCodeData
{
    mainCd: string; // (공통코드)
    descr: string; // 명
    useYn: string; // 사용여부
}
export interface CommonCodePagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
