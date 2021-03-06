export interface User
{
    id: string;
    mId: string;
    name: string;
    email: string;
    businessNumber?: string;
    businessName?: string;
    avatar?: string;
    status?: string;
    accessToken?: string;
    refreshToken?: string;
    ciphertext?: string;
    handle?: string;
    iv?: string;
    salt?: string;
    password?: string;
    phone?: number;
    userType?: string;
    imgPath?: string;
    udiClientSecret?: string;
    udiClientId?: string;
    udiSupplyAutoYn?: string;
    udiSupplyAutoDt?: string;
    initYn?: string;
    udiInfoYn?: string;
    popBillId?: string;
    freeYn?: string;
    payYn?: string;
    payFailYn?: string;
    version?: string;
    dashboardColor?: string;
}
export interface UserExperience
{
    email: string;

}
