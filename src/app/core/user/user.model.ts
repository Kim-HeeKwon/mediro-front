export interface User
{
    id: string;
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
}
