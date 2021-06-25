import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Code } from '../../common-code/code.model';

export function createInitialState(): Code[] {
    return [];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'code' })
export class CodeStore extends Store<Code[]> {

    constructor() {
        super(createInitialState());
    }
}
