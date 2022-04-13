export interface UdiItem
{
    modelId: string;              // 품목ID
    medDevSeq: string;            // 품목번호
    seq: string;                  // 모델일련번호
    entpName: string;             // 업체명
    itemName: string;             // 품목명
    typeName: string;             // 모델명
    brandName: string;            // 제품명
    itemNoFullname: string;       // 품목허가번호
    rcperSalaryCode?: string;         //요양급여코드
    grade: number;                // 등급
    udidiCode?: string;            // UDI코드
    modelIndex: number;           // 품목인덱스
    totalCnt: number;             // 총 객수
}

export interface  UdiSearchItem
{
    itemName: string;               //품목명
    udidiCode?: string;              //UDI코드
    entpName: string;               //업체명
    typeName?: string;               //모델명
    brandName?: string;              //제품명
    itemNoFullname?: string;         //품목허가번호
    rcperSalaryCode?: string;         //요양급여코드
    grade?: number;                  //등급
    pageNum?: number;                //페이지
    searchYn?: boolean;               //서치유형
    searchOn?: string;                //서치온
    recordCountPerPage?: number;      //페이지당 아이템수
}

export interface ItemSearchPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
