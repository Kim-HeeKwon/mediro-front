export interface Notice
{
    nbNo?: string;
    title?: string;
    comment?: string;
    cnt?: string;
    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface Pagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
