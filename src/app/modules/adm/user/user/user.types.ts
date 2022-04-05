export interface UserData
{
    mId: string;                //회원사
    businessNumber: string; //사업자 번호
    businessName: string;   //사업자명
    userName: string;
    email: string;
    phoneNumber: string;
    delFlag: string;

    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface UserPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
