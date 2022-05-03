import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TeamPlatConfirmationConfig} from '@teamplat/services/confirmation/confirmation.types';

@Component({
    selector: 'fuse-confirmation-dialog',
    templateUrl: './dialog.component.html',
    encapsulation: ViewEncapsulation.None
})
export class TeamPlatConfirmationDialogComponent implements OnInit, AfterViewInit {

    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: TeamPlatConfirmationConfig,
        public matDialogRef: MatDialogRef<TeamPlatConfirmationDialogComponent>
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        const submit = document.getElementById('enterSubmit');
        const cancel = document.getElementById('enterCancel');
        setTimeout(() => {
            if (submit !== null) {
                submit.focus();
            } else if(cancel !== null) {
                cancel.focus();
            }
        }, 100);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

}
