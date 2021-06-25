export interface Code
{
    //data: child[];
    mainCd: string;
    descr: string;
    useYn: string;
    delFlag: string;
    ipaddr: string;
    addUser: string;
    addDate: string;
    updUser: string;
    updDate: string;
    child: child[];
}

export interface child
{
    mainCd: string;
    subCd: string;
    descr: string;
    useYn: string;
    delFlag: string;
    ipaddr: string;
    addUser: string;
    addDate: string;
    updUser: string;
    updDate: string;
}

