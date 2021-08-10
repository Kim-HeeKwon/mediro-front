/**
 * CREATE BY supersteve on 2021/08/10
 **/

import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '@teamplat/animations';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector       : 'term-of-service',
    templateUrl    : './term-of-service.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class TermOfServiceComponent implements OnInit, OnDestroy
{
    constructor(
        public matDialogRef: MatDialogRef<TermOfServiceComponent>,
    ) {

    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }
}
