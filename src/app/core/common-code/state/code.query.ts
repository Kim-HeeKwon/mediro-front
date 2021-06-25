import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { CodeStore } from './code.store';
import { Code } from '../../common-code/code.model';

@Injectable({ providedIn: 'root' })
export class CodeQuery extends Query<Code[]> {
    allState$ = this.select();

    //data$ = this.select(state => !!state.data);

    constructor(protected store: CodeStore) {
        super(store);
    }

}
