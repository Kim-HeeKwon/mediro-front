export interface CommonPopupData
{
    extPopupNo: string; // (공통팝업)
    extPopupNm: string; // 명
    extUseYn: string; // 사용여부
}

export interface DetailCommonPopupData
{
    extPopupNo: string; // (공통팝업)
    extColId: string; // 컬럼 ID
    extColNm: string; // 컬럼 명
    extUseYn: string; // 사용여부
    extColWidVal: string; // 너비
    extColSortSeqVal: string; // 정렬
    extColCondGbnVal: string; // 검색조건
    extColQrySortSeqVal: string; // 정렬
    extColFmtVal: string; // 타입
    extSelBoxAttrVal: string; // val 타입
    extEtcQryColCondVal: string; // 조건
}

export interface CommonPopupPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
