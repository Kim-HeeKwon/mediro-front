export interface DiscountData
{
    endFlag: string;
    discount: string; // 번호
    discountTitle: string; // 제목
    discountComment: string; // 내용
    beginDate: string; // 시작일자
    endDate: string; // 종료 일자
    discountRate: number; // 할인율
    remark: string;
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
