import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Code } from '../../common-code/code.model';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createInitialState(): any {
    return {
        data: []
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'code' })
export class CodeStore extends Store<any> {
    constructor() {
        super(createInitialState());
    }
}

// addDate: "2021-06-21"
// addUser: ""
// child: (3) [{…}, {…}, {…}]
// delFlag: "N"
// descr: "헤더설명수정"
// ipaddr: "0:0:0:0:0:0:0:1"
// mainCd: "x"
// updDate: "2021-06-21"
// updUser: ""
// useYn: "Y"
