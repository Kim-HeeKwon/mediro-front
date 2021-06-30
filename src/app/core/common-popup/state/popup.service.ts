import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PopupStore } from './popup.store';

@Injectable({ providedIn: 'root' })
export class PopupService {

    constructor(private popupStore: PopupStore,
                private http: HttpClient) {
    }
}
