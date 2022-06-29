export interface ReportBillData
{
    mId: string;                //회원사
    addDate: string; // 일자
    bisNo: string; //사업자 번호
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    itemCd: string;      //품목코드
    itemNm: string;      //품목명
    fomlInfo: string;    //모델명
    standard: string;    //규격
    unit: string;        //단위
    qty: number;  // 수량
    unitPrice: number; // 단가
    billingAmt: number; // 공급가액
    taxAmt: number; // 부가세
    billingTotalAmt: number; // 합계금액
    manager: string; // 담당자
    type: string; // 매입/매출
}

export interface ReportBillPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
