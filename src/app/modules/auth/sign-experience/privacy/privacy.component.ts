/**
 * CREATE BY supersteve on 2021/08/10
 **/
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '@teamplat/animations';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector       : 'privacy-experience',
    templateUrl    : './privacy.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class PrivacyComponent implements OnInit, OnDestroy
{
    constructor(
        public matDialogRef: MatDialogRef<PrivacyComponent>,
    ) {

    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }
}
