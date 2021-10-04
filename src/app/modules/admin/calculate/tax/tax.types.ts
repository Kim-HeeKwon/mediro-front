export interface Tax
{
    no?: number;
    mId: string;                //회원사
}

export interface TaxHeaderPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
