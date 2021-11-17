export interface SupplyStatus
{
    no?: string; 	//순번
    serialkey: string;          //serialkey
    mflag: string;
    udiFlag: string;            //flag
    message: string;            //메세지
    suplyFlagCode: string;
    suplyTypeCode: string;
    meddevItemSeq: string;
    stdCode: string;
    lotNo: string;
    manufYm: string;
    bcncCode: string;
    suplyDate: string;
    suplyQty: string;
    suplyUntpc: string;
    suplyAmt: string;
}
export interface SupplyStatusPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
