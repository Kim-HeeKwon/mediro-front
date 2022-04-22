export interface UserData
{
    mId: string;                //회원사
    businessNumber: string; //사업자 번호
    businessName: string;   //사업자명
    representName: string;
    userId: string;

    subscriptionFeeYn: string;
    freeDate: string;
    payDate: string;
    payAmt: number;
    commissionWindow: string;
    commissionRate: number;
    commissionAmt: number;

    email: string;
    phoneNumber: string;
    delFlag: string;

    payGrade: string;
    yearUser: string;
    midGrade: string;
    address: string;

    channel: string;
    area: string;
    talkYn: string;
    userCnt: number;
    visitCnt: number;
    surveyResponses: string;
    promotion: string;
    promotionAmt: number;
    employeesCnt: number;
    scale: string;
    currentUse: string;
    remark: string;

    breakReason: string;
    breakDate: string;

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
