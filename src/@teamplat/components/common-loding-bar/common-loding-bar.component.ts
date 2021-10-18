import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../animations';


@Component({
    selector: 'app-loding',
    templateUrl: 'common-loding-bar.component.html',
    styleUrls: ['./common-loding-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations     : fuseAnimations
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class commonLodingBarComponent implements OnInit {


    constructor() {
    }

    ngOnInit(): void {

    }

}
