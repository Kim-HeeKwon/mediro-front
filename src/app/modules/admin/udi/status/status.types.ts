export interface SupplyStatus
{
    no?: string; 	//순번
    serialkey: string;          //serialkey
    udiFlag: string;            //flag
    message: string;            //메세지
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
