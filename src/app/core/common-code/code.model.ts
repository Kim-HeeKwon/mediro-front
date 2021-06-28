export interface Code
{
    mainCd: string;
    descr: string;
    useYn?: string;
    delFlag?: string;
    ipaddr?: string;
    addUser?: string;
    addDate?: string;
    updUser?: string;
    updDate?: string;
    child: childData[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface childData
{
    mainCd: string;
    subCd: string;
    descr: string;
    useYn?: string;
    delFlag?: string;
    ipaddr?: string;
    addUser?: string;
    addDate?: string;
    updUser?: string;
    updDate?: string;
}

