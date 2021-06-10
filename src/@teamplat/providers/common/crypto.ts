import { Injectable } from '@angular/core';
import { map, share } from 'rxjs/operators';
import { Subject } from 'rxjs';

import * as CryptoJS from 'crypto-js';

@Injectable()
export class Crypto{

    private rtn_json:any = {
        ciphertext: '',
        iv: '',
        salt: '',
        passPhrase: ''
    };

    constructor( ) { }

    getStringCryto(param){
        const keySize = 128;
        const iterationCount = 10000;
        const passPhrase = '1234';
        let iv = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
        let salt = CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
        let plainText = param;

        let key128Bits100Iterations = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt),
            { keySize: keySize/32, iterations: iterationCount });

        let encrypted = CryptoJS.AES.encrypt(
            plainText,
            key128Bits100Iterations,
            { iv: CryptoJS.enc.Hex.parse(iv) }
        );

        this.rtn_json.ciphertext = encrypted.toString();
        this.rtn_json.iv = iv;
        this.rtn_json.salt = salt;
        this.rtn_json.passPhrase = passPhrase;

        return this.rtn_json;
    }

}
