export interface CommonCodeData
{
    mainCd: string; // (공통코드)
    descr: string; // 명
    useYn: string; // 사용여부
}

export interface DetailCommonCodeData
{
    mainCd: string; // (공통코드)
    subCd: string; // 상세코드
    descr: string; // 명
    udf1: string; // udf1
    udf2: string; // udf2
    udf3: string; // udf3
    udf4: string; // udf4
    udf5: string; // udf5
    priority: number; // 우선순위
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
