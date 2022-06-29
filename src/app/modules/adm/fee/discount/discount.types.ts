export interface DiscountData
{
    endFlag: string;
    discount: string; // 번호
    discountTitle: string; // 제목
    discountComment: string; // 내용
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
