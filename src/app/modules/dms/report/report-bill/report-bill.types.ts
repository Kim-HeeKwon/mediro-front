export interface ReportBillData
{
    mId: string;                //회원사
    addDate: string; // 일자
    custBusinessNumber: string; //사업자 번호
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    itemCd: string;      //품목코드
    itemNm: string;      //품목명
    standard: string;    //규격
    unit: string;        //단위
    qty: number;  // 수량
    amt: number; // 단가
    supplyprice: number; // 공급가액
    vat: number; // 부가세
    totalAmt: number; // 합계금액
    manager: string; // 담당자
    incomeOutcome: string; // 매입/매출
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
