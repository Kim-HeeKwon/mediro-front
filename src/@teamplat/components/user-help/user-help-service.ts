import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Common} from '../../providers/common/common';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {UserHelp} from './user-help.types';

@Injectable({
    providedIn: 'root'
})
export class UserHelpService {

    private _userHelps: BehaviorSubject<UserHelp[]> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Getter for headers
     */
    get userHelps$(): Observable<UserHelp[]>
    {
        return this._userHelps.asObservable();
    }

    /**
     * Create
     */
    getUserHelp(search: any): Observable<UserHelp>
    {

        const pageParam = {
            page: 0,
            size: 100,
        };

        return this.userHelps$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataObject(search, pageParam, 'v1/api/common/user-help').pipe(
                map((result) => {
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
