export interface UdiCode
{
    mId: string;         //회원아이디
    itemCd: string;      //품목코드
    itemNm: string;      //품목명
    grade: number;       //품목명
    itemGrade?: number;  //품목등급
    udiYn?: string;       //UDI신고대상유무
    category?: string;   //카테고리
    unit: string;        //단위
    standard: string;    //규격
    ediCode: string;
    rcperSalaryCode?: string;
    modelId?: string;
    fomlInfo: string;
    seq: string;
    itemNoFullname: string;
    supplier: string;    //공급사
    supplierNm: string;    //공급사 명
    manufacturer: string;    //제조사
    buyPrice: number;    //구매단가
    sellPrice: number;   //판매단가
    salesPrice: number;   //판매단가
    active: boolean;     //cell상태
    medDevSeq?: string;
    mebTypeSeq?: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface UdiCodePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
