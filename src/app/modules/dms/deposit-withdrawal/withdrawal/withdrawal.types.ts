export interface Withdrawal
{
    no?: number;
    mId: string;                //회원사
    withdrawal: string;         //출금번호
    withdrawalFlag: string;        //flag -1
    mgtFlag: string;         //flag -2
    billing: string;
    lineNo: number;
    account: string;            //거래처코드
    accountNm: string;          //거래처명
    note: string;
    type: string;
    withdrawalDate: string;     //출금일자
    withdrawalAmt: number;      //출금금액
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


export interface WithdrawalPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
