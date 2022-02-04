export interface IncomeOutcomeHeader
{
    no?: number;
    line?: string;
    mId?: string;                //회원사
    account?: string;            //거래처
    accountNm?: string;            //거래처
    route?: string;
    writeDate?: string;
    itemNm?: string;
    invoice?: string;
    inComeAmt?: string;
    outComeAmt?: string;
    cashD?: string;
    noteD?: string;
    etcD?: string;
    cashW?: string;
    noteW?: string;
    etcW?: string;
    balance?: string;
    m?: string;
}
export interface IncomeOutcomeDetail
{
    no?: number;
    mId: string;                //회원사
    account: string;            //거래처
    accountNm: string;            //거래처
    rbalance: number;            //
    sbalance: number;            //
}
