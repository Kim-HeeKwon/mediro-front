export interface Deposit
{
    no?: number;
    mId: string;                //회원사
    deposit: string;            //입금번호
    depositFlag: string;
    mgtFlag: string;
    billing: string;
    lineNo: number;
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    note: string;
    type: string;
    depositDate: string;        //입금일자
    depositAmt: number;         //입금금액
    remark: string;
    udf1: string;
    udf2: string;
    udf3: string;
    udf4: string;
    udf5: string;
    udf6: string;
    udf7: string;
    udf8: string;
    udf9: string;
    udf10: string;
}


export interface DepositPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
