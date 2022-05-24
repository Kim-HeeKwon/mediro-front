export interface DiscountData
{
    mId: string;
    businessNumber: string; // 사업자 번호
    businessName: string; // 회원사 명
    addDate?: string; // 가입일
    startDate?: string; // 시작일자
    endDate?: string; // 종료 일자
    discountRate: number; // 할인율
}

export interface DiscountPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
