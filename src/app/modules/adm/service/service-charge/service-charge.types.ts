export interface ServiceChargeData
{
    payGrade: string;
    yearUser: string;
    priority: string;
    basePrice: number;
    cntPrice: number;
    useYn: string;

    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface ServiceChargePagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
