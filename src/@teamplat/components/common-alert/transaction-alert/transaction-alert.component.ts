import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation}
    from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Alertmessage} from '../transaction-alert/transaction-alert.type';

@Component({
    selector: 'transaction-alert',
    templateUrl: './transaction-alert.component.html',
    styleUrls: ['./transaction-alert.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class TransactionAlertComponent implements OnInit {

    message: string = '확인하시겠습니까?';
    constructor(
        public _matDialogRef: MatDialogRef<TransactionAlertComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,)
    {
        if(data.msg !== undefined){
            this.message = data.msg;
        }
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

    onClick(): void {
        this._matDialogRef.close(this.alertOk);
    }

    onClose(): void {
        this._matDialogRef.close(this.alertCancel);
    }
}
