import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Alertmessage} from '../delete-alert/delete-alert.type';

@Component({
    selector: 'delete-alert',
    templateUrl: './delete-alert.component.html',
    styleUrls: ['./delete-alert.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DeleteAlertComponent implements OnInit {

    constructor(
        public _matDialogRef: MatDialogRef<DeleteAlertComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,)
    {
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alertOk: Alertmessage = {
        code: 'SUCCESS',
        status: true
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alertCancel: Alertmessage = {
        code: 'CANCEL',
        status: false
    };

    ngOnInit(): void {
    }

    onDelete(): void {
        this._matDialogRef.close(this.alertOk);
    }

    onClose(): void {
        this._matDialogRef.close(this.alertCancel);
    }
}
