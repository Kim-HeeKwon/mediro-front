import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import {catchError, share, switchMap} from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { Common } from '@teamplat/providers/common/common';
import { Crypto } from '@teamplat/providers/common/crypto';
import { Api } from '@teamplat/providers/api/api';
import { User } from '../user/user.model';
import { SessionStore } from '../session/state/session.store';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;
    private _user: User;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _common: Common,
        private _api: Api,
        private _cryptoJson: Crypto,
        private _sessionStore: SessionStore
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('access_token') ?? '';
    }

    set userEmail(email: string){
        localStorage.setItem('email', email);
    }

    get userEmail(): string
    {
        return localStorage.getItem('email') ?? '';
    }

    set userMid(mId: string){
        localStorage.setItem('mId', mId);
    }

    get userMid(): string
    {
        return localStorage.getItem('mId') ?? '';
    }

    set userId(id: string){
        localStorage.setItem('id', id);
    }

    get userId(): string
    {
        return localStorage.getItem('id') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(user: any): Observable<any>
    {
        // id == email
        user.id = user.email;

        let strJson = this._cryptoJson.getStringCryto(user.password);
        strJson.id = user.id;
        strJson.email = user.id;
        strJson.mId = 'mediroDefault';

        // + 나 스페이스 들어가 있을 경우 다시 생성
        while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1) {
            // console.log('reCreateCipher');
            strJson = this._cryptoJson.getStringCryto(user.password);
        }
        strJson.ciphertext = encodeURIComponent(strJson.ciphertext);


        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            console.log('User is alerady logged in');
            return throwError('User is already logged in.');
        }

        return this._api.post('user.userLogin.do', strJson).pipe(
            switchMap((response: any) => {
                // tslint:disable-next-line:triple-equals
                if (response.status !== 95){
                    return throwError('패스워드가 옳지 않습니다.');
                }
                this.accessToken = response.resultD.accessToken;
                this.userEmail = response.resultD.email;
                this.userMid = response.resultD.mid;
                this.userId = response.resultD.id;

                response.resultD.mId = response.resultD.mid;

                this._authenticated = true;
                // Store the user on the user service
                this._user = response.resultD;
                this._userService.user = response.resultD;

                console.log('user Check!!');
                console.log(response.resultD);

                // Store the akita store
                this._sessionStore.update(response.resultD);

                console.log(this._sessionStore.getValue());

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // console.log(this.accessToken);
        const vData = {
            'accessToken': this.accessToken,
            'email' : this.userEmail,
            'mId'   : this.userMid,
            'id'   : this.userId
        };
        // Renew token
        return this._api.postToken('auth.renewToken.do', vData).pipe(
            switchMap((response: any) => {

                //
                const status = response.status;
                if(status === '99'){

                    localStorage.removeItem('access_token');
                    localStorage.removeItem('email');
                    localStorage.removeItem('mId');
                    localStorage.removeItem('id');

                    return of(false);
                }

                this._authenticated = true;

                // Store the user on the user service
                this._user = response.resultD;
                this._userService.user = response.resultD;

                this._sessionStore.update(response.resultD);

                return of(true);
            })
        );

        return of(true);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('email');
        localStorage.removeItem('mId');
        localStorage.removeItem('id');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     * 휴대폰인증 후 가입완료
     * @param userauth.renewToken.do
     */
    signUp(user: any): Observable<any>
    {
        const formData = new FormData();

        // 비밀번호 암호화
        let strJson = this._cryptoJson.getStringCryto(user.password);

        while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1){
            strJson = this._cryptoJson.getStringCryto(user.password);
        }

        if (!this._common.gfn_isNull(user.avatar)){
            user.handler = 'pic';
        }

        formData.append('id', user.email);
        formData.append('mId', user.businessNumber);
        formData.append('name', user.name);
        formData.append('phone', user.phone);
        formData.append('businessNumber', user.businessNumber);
        formData.append('company', user.company);
        formData.append('userType', user.userType);
        formData.append('password', user.password);
        formData.append('email', user.email);
        formData.append('fileName', 'none');
        formData.append('ciphertext', strJson.ciphertext);
        formData.append('iv', strJson.iv);
        formData.append('salt', strJson.salt);
        formData.append('passPhrase', strJson.passPhrase);
        formData.append('randomNumber', user.randomNumber);
        formData.append('index', this.generateRandom(1, 100));
        formData.append('handle', 'insert');

        return this._api.postFile('/v1/api/auth/user', formData).pipe(share());
        // return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Sign up Temp
     * 휴대폰 인증을 위한 임시 가입자 정보 저장
     * @param
     */
    signUpTemp(user: any): Observable<any>
    {
        const formData = new FormData();

        // 비밀번호 암호화
        let strJson = this._cryptoJson.getStringCryto(user.password);

        while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1){
            strJson = this._cryptoJson.getStringCryto(user.password);
        }

        if (!this._common.gfn_isNull(user.avatar)){
            user.handler = 'pic';
        }

        formData.append('id', user.email);
        formData.append('name', user.name);
        formData.append('phone', user.phone);
        formData.append('businessNumber', user.businessNumber);
        formData.append('company', user.company);
        formData.append('userType', user.userType);
        formData.append('password', user.password);
        formData.append('email', user.email);
        formData.append('fileName', 'none');
        formData.append('ciphertext', strJson.ciphertext);
        formData.append('iv', strJson.iv);
        formData.append('salt', strJson.salt);
        formData.append('passPhrase', strJson.passPhrase);
        formData.append('index', this.generateRandom(1, 100));
        formData.append('handle', 'insert');

        return this._api.postFile('/v1/api/auth/temp-user', formData).pipe(share());
        // return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * checkBusinessNumber
     *
     * @param 사업자번호
     */
    checkBusinessNumber(_businessNumber: number): Observable<any>
    {
        const param = {
            businessNumber : _businessNumber
        };
        return this._api.get('v1/api/business',param).pipe(share());
    }

    /**
     * checkBusinessNumber
     *
     * @param 사업자번호
     */
    sendSms(user: any): Observable<any>
    {
        const formData = new FormData();

        formData.append('id', user.email);
        formData.append('name', user.name);
        formData.append('phone', user.phone);
        formData.append('businessNumber', user.businessNumber);
        formData.append('company', user.company);
        formData.append('userType', user.userType);
        formData.append('password', user.password);
        formData.append('email', user.email);
        formData.append('index', this.generateRandom(1, 100));
        formData.append('handle', 'update');

        return this._api.postFile('v1/api/business/send-sms', formData).pipe(share());
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        // console.log('여기 accessToken 체크');
        // if ( AuthUtils.isTokenExpired(this.accessToken) )
        // {
        //     return of(false);
        // }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    /**
     * create the authentication status
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    generateRandom(min, max) {
        const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
        return ranNum;
    }
}
