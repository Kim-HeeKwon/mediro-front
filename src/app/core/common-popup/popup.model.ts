export interface Popup
{
    extPopupNo: string;          //팝업번호
    extPopupNm: string;          //팝업명
    extPopupTgtTypCd: string;    //팝업대상유형코드
    extPopupTgtObjVal: string;   //팝업대상객체값
    extPopupCntnt: string;       //팝업내용
    extCondSntncUseYn: string;   //조건구문사용여부
    extSortSntncUseYn: string;   //정렬구문사용여
    extLimitCntVal: string;      //제한개수값
    extUseYn: string;            //사용여부
    child: childData[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface childData
{
    extPopupNo: string;              //팝업번호
    extColId: string;                //컬럼ID
    extColNm: string;                //컬럼명
    extUseYn: string;                //사용여부
    extColExPosYn: string;           //컬럼노출여부
    extColWidVal: string;            //컬럼가로값
    extColLineOrdmadVal: string;     //컬럼줄맞춤값
    extColSortSeqVal: string;        //컬럼정렬순서값
    extColCondGbnVal: string;        //컬럼조건구분값
    extColQrySortSeqVal: string;     //컬럼조회정렬순서값
    extColDispTypVal: string;        //컬럼전시유형값
    extColFmtVal: string;            //컬럼포맷값
    extSelBoxAttrVal: string;        //선택박스속성값
    extEtcQryColGbnVal: string;      //기타조회컬럼구분값
    extEtcQryColCondVal: string;     //기타조회컬럼조건값
}

