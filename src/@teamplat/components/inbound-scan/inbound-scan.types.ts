export interface InBoundDetails
{
    no?: number;
    itemCd: string;
    itemNm: string;
    medDevItemSeq: string;
}
export interface Manages
{
    no?: string; 	//순번
    suplyContStdmt?: string; 	//공급내역 보고 기준 월 형식 : YYYYMM
    suplyContSeq?: string; 	//공급내역 보고자료 일련번호
    suplyEntpName?: string; 	//공급한 자 업체명
    cobTypeName?: string; 	//공급한 자 업체 영업형태
    suplyTypeCode?: string; 	//공급 형태 코드
    suplyFlagCode?: string; 	//공급 구분 코드 (1:출고, 2:반품, 3:폐기)
    rtngudFlagCode?: string; 	//반품 코드 (1:일반 반품, 2:회수 반품, 3: 임대 만 료)
    meddevItemSeq?: string; 	//의료기기 품목 일련번호
    seq?: string; 	//모델명 일련번호
    udiDiSeq?: string; 	//UDI-DI 코드 일련번호
    stdCode?: string; 	//표준코드
    udiDiCode?: string; 	//고유식별자(UDI-DI) 코드
    udiPiCode?: string; 	//생산식별자(UDI-PI) 코드
    entpName?: string; 	//품목 제조(수입) 업체명
    itemName?: string; 	//품목명
    meaClassNo?: string; 	//품목 분류번호
    permitNo?: string; 	//품목 허가번호
    typeName?: string; 	//모델명
    packQuantity?: string; 	//포장내 수량
    lotNo?: string; 	//로트번호
    itemSeq?: string; 	//일련번호
    manufYm?: string; 	//제조연월 //형식 : YYMMDD(표준코드 및 생산식별자 코드 에 일 정보가 없는 경우 ‘00’으로 대체)
    useTmlmt?: string; 	//사용기한 //형식 : YYMMDD(표준코드 및 생산식별자 코드 에 일 정보가 없는 경우 ‘00’으로 대체)
    bcncCode?: string; 	//거래처 코드
    bcncEntpName?: string; 	//거래처 명
    bcncCobTypeName?: string; 	//거래처 업종
    bcncEntpAddr?: string; 	//거래처 소재지
    bcncTaxNo?: string; 	//거래처 사업자등록번호
    bcncHptlCode?: string; 	//거래처 요양기관 기호
    isDiffDvyfg?: string; 	//납품장소 다름 여부
    dvyfgPlaceBcncCode?: string;	//납품장소 업체 거래처 코드
    dvyfgEntpName?: string; 	//납품장소 업체명
    dvyfgCobTypeName?: string; 	//납품장소 업체 영업형태
    dvyfgEntpAddr?: string; 	//납품장소 업체 소재지
    dvyfgTaxNo?: string; 	//납품장소 업체 사업자등록번호
    dvyfgHptlCode?: string; 	//납품장소 업체 요양기관 기호
    suplyDate?: string; 	//출고ᆞ반품ᆞ폐기 일자
    suplyQty?: string; 	//출고ᆞ반품ᆞ폐기 수량
    indvdlzSuplyQty?: string; //포장내수량중 낱개 회수수량
    suplyUntpc?: string; 	//공급단가(VAT포함, 원)
    suplyAmt?: string; 	//공급금액(VAT포함, 원)
    remark?: string; 	//비고
}
