export interface ReportBoundData
{
    mId: string;                //회원사
    reportType: string; // 입출고 유형
    orderNo: string; // 오더번호(입고번호 or 출고번호
    addDate: string; // 일자
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    itemCd: string;      //품목코드
    itemNm: string;      //품목명
    fomlInfo: string; // 모델명
    standard: string;    //규격
    unit: string;        //단위
    ibQty: number;  // 입고수량
    obQty: number; // 출고수량
    totalAmt?: number; // 입출금액(매입, 매출금액)
}
export interface ReportBoundPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
