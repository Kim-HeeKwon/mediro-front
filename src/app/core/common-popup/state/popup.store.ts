import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createInitialState(): any {
    return {
        data: []
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'popup' })
export class PopupStore extends Store<any> {
    constructor() {
        super(createInitialState());
    }
}
