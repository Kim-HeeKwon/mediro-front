export interface AccountData
{
    mId: string;                //회원사
    account: string;            //거래처 코드
    descr: string;              //거래처 명
    accountType: string;        //유형
    cobFlagType: string;        //업종코드
    custBusinessNumber: string; //사업자 번호
    custBusinessName: string;   //사업자명
    representName: string;      //대표자명
    businessCondition: string;  //업태
    businessCategory: string;   //종목
    address: string;            //주소
    phoneNumber: string;        //대표 전화
    cellPhoneNumber: string;    //휴대 전화
    fax: string;                //팩스
    email: string;              //이메일
    taxEmail: string;           //이메일

    manager: string;    //담당자
    managerCellPhoneNumber: string;    //담당자 번호
    paymentTerms: string;    //결제조건
    remark: string;    //비고
    createUdiAccountCheck: string;

    addDate?: string;
    addUser?: string;
    updDate?: string;
    updUser?: string;
}

export interface AccountPagenation
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}
