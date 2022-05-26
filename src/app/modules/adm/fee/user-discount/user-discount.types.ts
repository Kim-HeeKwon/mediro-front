export interface UserDiscountData
{
    mId: string;
    discount: string;
    businessNumber: string; // 사업자 번호
    businessName: string; // 회원사 명
    addDate?: string; // 가입일
    discountTitle: string; // 제목
    discountComment: string; // 내용
    beginDate: string; // 기간 시작
    endDate: string; // 기간 종료
    discountRate: number; // 할인율

}

export interface UserDiscountPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
