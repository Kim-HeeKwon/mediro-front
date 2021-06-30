import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { PopupStore } from './popup.store';
import {Popup} from '../popup.model';

@Injectable({ providedIn: 'root' })
export class PopupQuery extends Query<Popup[]> {
    allState$ = this.select();

    //data$ = this.select(state => !!state.data);

    constructor(protected store: PopupStore) {
        super(store);
    }

}
