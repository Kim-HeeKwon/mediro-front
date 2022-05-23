export interface DisplayedColumn{
    id: string;
}

export interface Column{
    id: string;
    name: string;
}
export interface UdiGridPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
