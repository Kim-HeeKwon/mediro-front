import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SalesorderService {
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }
}
