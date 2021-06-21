import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { User } from '../../user/user.model';

export function createInitialState(): User {
    return {
        mId: null,
        id: null,
        name: null,
        email: null,
        avatar: null,
        status: null,
        accessToken: null,
        refreshToken: null,
        ciphertext: null,
        handle: null,
        iv: null,
        salt: null,
        password: null,
        phone: null,
        userType: null,
        imgPath: null
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'session' })
export class SessionStore extends Store<User> {

    constructor() {
        super(createInitialState());
    }
}
