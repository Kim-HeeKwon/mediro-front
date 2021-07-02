export interface InventoryInItem
{
    mId: string;         //회원아이디
    itemCd: string;      //품목코드
    itemNm: string;      //품목명
    grade: number;       //품목명
    itemGrade?: number;  //품목등급
    category?: string;   //카테고리
    unit: string;        //단위
    standard: string;    //규격
    supplier: string;    //공급사
    buyPrice: number;    //구매단가
    sellPrice: number;   //판매단가
    salesPrice: number;   //판매단가
    active: boolean;     //cell상태
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface InPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
