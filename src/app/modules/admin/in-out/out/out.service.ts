import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {filter, map, switchMap, take, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class OutService {
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }
}
