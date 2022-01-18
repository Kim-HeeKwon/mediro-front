export class TradingHeaderData{
    no: string;
    date: string;
    toAccountNm?: string;
    deliveryDate?: string;
    deliveryAddress?: string;
    remark: string;
    custBusinessNumber?: string;// 사업자 등록번호
    custBusinessName?: string;//상호
    representName?: string;//성명
    address?: string;//주소
    businessCondition?: string;// 업태
    businessCategory?: string;// 종목
    phoneNumber?: string;// 전화번호
    fax?: string;// 팩스번호
}
export class TradingDetailData{
    no?: string;
    itemNm?: string;
    standard?: string;
    qty?: number;
    unitPrice?: number;
    totalAmt?: number;
    taxAmt?: number;
    remark?: number;

}

export interface TradingPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
