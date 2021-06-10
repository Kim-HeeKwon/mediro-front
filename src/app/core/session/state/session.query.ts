import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { SessionStore } from './session.store';
import { User } from '../../user/user.model';

@Injectable({ providedIn: 'root' })
export class SessionQuery extends Query<User> {
    allState$ = this.select();

    isAccessToken$ = this.select(state => !!state.accessToken);
    selectName$ = this.select('name');

    // Returns { name, age }
    // multiProps$ = this.select(['name', 'age']);

    constructor(protected store: SessionStore) {
        super(store);
    }

}
