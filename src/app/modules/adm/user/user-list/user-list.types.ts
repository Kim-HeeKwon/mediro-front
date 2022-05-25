export interface UserList
{
    mId: string; //회원사
    businessNumber: string; // 사업자 번호
    businessName: string;   // 회원사 명
    userId: string; // 회원 ID
    addDate?: string;
}

export interface UserListPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
