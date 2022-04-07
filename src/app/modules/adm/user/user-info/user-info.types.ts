export interface UserInfo
{
    mId: string;                //회원사
    businessNumber: string; //사업자 번호
    businessName: string;   //사업자명

    delFlag: string;

    payGrade: string;
    yearUser: string;
    midGrade: string;

    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface UserInfoPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
